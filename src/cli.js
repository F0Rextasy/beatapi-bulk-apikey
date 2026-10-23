#!/usr/bin/env node
'use strict';
/**
 * beatapi-bulk-apikey — one fresh BeatAPI account per key, verified, any number.
 *
 *   mailbox ──▶ GET  /api/verification?email=…       (mails a code)
 *            ├─▶ POST /api/user/register?turnstile=   (code + password)
 *            ├─▶ GET  /api/user/login/encryption-key  (RSA-OAEP key id)
 *            ├─▶ POST /api/user/login?turnstile=      (password_encrypted)
 *            ├─▶ POST /api/beat/account/keys          (create; returns a MASKED key)
 *            └─▶ POST /api/beat/account/keys/{id}/key (the real key — shown once)
 *                           │
 *                           ▼
 *                    GET /v1/usage → 200 means the key is live
 *
 * Longest-waiting limits are the provider's, not ours: the verification *send* is
 * paced (see SEND_GAP_MS) and a registration that answers `retry_after_seconds`
 * is waited out instead of burning the inbox.
 */
const crypto = require('crypto');
/** keys-dead.txt standard: `key<TAB>reason<TAB>ISO`, reason in 401|403|quota|ban.
 * A 429/5xx/transport failure is never a dead key — it answers null here. */
function deadReason(status, text = '') {
  const s = `${status == null ? '' : status} ${text || ''}`;
  if (/\b429\b|rate.?limit|\b5\d\d\b|timeout|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|transport|network/i.test(s)) return null;
  if (/\b401\b|unauthor/i.test(s)) return '401';
  if (/\b403\b|forbidden/i.test(s)) return '403';
  if (/\b402\b|quota|insufficient|no credit|out of credit|balance|exhaust/i.test(s)) return 'quota';
  if (/banned|suspend|deactivat|disabled/i.test(s)) return 'ban';
  return null;
}
/** The standard line (key \t reason \t ISO), or null when the reason is not final. */
const deadLine = (key, reason) => (reason ? [key, reason, new Date().toISOString()].join('\t') : null);
/** The key side of a standard line (dedupe helper). */
const deadKeyOf = (line) => String(line).split(String.fromCharCode(9))[0];
const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

// Proxy support is optional: without src/proxy.js the tool runs direct.
let createAgent = null;
let parseProxy = null;
try {
  ({ createAgent, parseProxy } = require('./proxy'));
} catch (e) {
  /* no proxy helper next to us — every request goes direct */
}

const GATEWAY = 'https://api.beatapi.io';
const EMAILNATOR = 'https://www.emailnator.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const USAGE = `beatapi-bulk-apikey — one BeatAPI key per fresh account, any number of accounts

  node src/cli.js --count N --out keys.txt [--prefix beatapi-bulk] [--delay 16000]
                  [--proxy-file proxies.txt | --proxy socks5://host:1080] [--workers 3]
  node src/cli.js --verify-only keys.txt [--proxy-file proxies.txt]

  One account is created per key — quota lives on the account, so N keys means N
  accounts. --count takes any N; there is no cap.

  Gate notes: BeatAPI accepts gmail.com/qq.com/yahoo.com/icloud.com only and
  refuses dots/plus in the local part; the mailbox comes from Emailnator.
`;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      out.help = true;
    } else if (arg.startsWith('--')) {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[arg.slice(2)] = true;
      else out[arg.slice(2)] = argv[++i];
    }
  }
  return out;
}

/** Minimal request helper: https, optional CONNECT/SOCKS proxy, JSON in/out. */
function rawRequest(url, { method = 'GET', headers = {}, body, proxy = null, timeoutMs = 30000 } = {}) {
  const wanted = typeof proxy === 'string' && parseProxy ? parseProxy(proxy) : proxy;
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const payload = body === undefined ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
    const req = https.request(
      {
        method,
        host: target.hostname,
        port: target.port || 443,
        path: target.pathname + target.search,
        agent: wanted && createAgent ? createAgent(wanted) : undefined,
        headers: {
          Accept: 'application/json',
          'User-Agent': UA,
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': payload.length } : {}),
          ...headers,
        },
      },
      (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (text += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(text);
          } catch (e) {
            /* not JSON: the caller sees `text` + `status` */
          }
          resolve({ status: res.statusCode, json, text, headers: res.headers });
        });
      }
    );
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Free exits die between the health probe and the real call, so every request
// retries itself through the next pool line instead of failing the account.
let PROXY_POOL = [];
let PROXY_CURSOR = 0;
const isNetworkError = (msg) =>
  /SOCKS|CONNECT|timeout|hang up|ECONN|ETIMEDOUT|EAI_AGAIN|socket|certificate|TLS|self.signed/i.test(String(msg));

function nextPoolLine() {
  if (!PROXY_POOL.length) return null;
  return PROXY_POOL[PROXY_CURSOR++ % PROXY_POOL.length];
}

// The provider throttles verification *sends* per address (measured: 15 s apart),
// so the send itself is paced. A slot is reserved when a send starts, not when the
// previous one finishes, and a refused send must not break the queue behind it.
const SEND_GAP_MS = 15000;
let SEND_GATE = Promise.resolve();
let LAST_SEND = 0;

const pacedSend = (fn) => {
  const send = async () => {
    const wait = Math.max(0, LAST_SEND + SEND_GAP_MS - Date.now());
    if (wait) await sleep(wait);
    LAST_SEND = Date.now();
    return fn();
  };
  const result = SEND_GATE.then(send, send);
  SEND_GATE = result.then(
    () => {},
    () => {}
  );
  return result;
};

function request(url, opts = {}) {
  const retries = opts.retries === undefined ? 3 : opts.retries;
  const proxy = opts.proxy !== undefined && opts.proxy !== null ? opts.proxy : nextPoolLine();
  return rawRequest(url, { ...opts, proxy }).catch((err) => {
    if (retries > 0 && isNetworkError(err.message) && PROXY_POOL.length) {
      return request(url, { ...opts, proxy: nextPoolLine(), retries: retries - 1 });
    }
    throw err;
  });
}

const emailnatorHeaders = { origin: EMAILNATOR, referer: `${EMAILNATOR}/` };

/** A dotted gmail address from Emailnator, plus its dot-free twin. */
async function newGmail(proxy) {
  const res = await request(`${EMAILNATOR}/api/generate-email`, {
    method: 'POST',
    headers: emailnatorHeaders,
    body: { ids: [3] },
    proxy,
  });
  const dotted = res.json && res.json.email;
  if (!dotted || !/@gmail\.com$/i.test(dotted)) {
    throw new Error(`emailnator returned ${res.status}: ${res.text.slice(0, 120)}`);
  }
  const [local, domain] = dotted.split('@');
  return { dotted, plain: `${local.replace(/\./g, '')}@${domain}` };
}

/** Poll Emailnator for the BeatAPI verification code. */
async function waitForCode(plain, { timeoutMs = 180000, pollMs = 5000, proxy = null } = {}) {
  const deadline = Date.now() + timeoutMs;
  const seen = new Set();
  while (Date.now() < deadline) {
    const res = await request(`${EMAILNATOR}/api/message-list`, {
      method: 'POST',
      headers: emailnatorHeaders,
      body: { email: plain, limit: 20 },
      proxy,
    });
    const messages = (res.json && res.json.messages) || [];
    for (const message of messages) {
      const id = String(message.id);
      if (seen.has(id)) continue;
      seen.add(id);
      if (!/beatapi/i.test(String(message.from || ''))) continue;
      const mail = await request(`${EMAILNATOR}/api/message/${encodeURIComponent(id)}`, {
        headers: emailnatorHeaders,
        proxy,
      });
      const body = String((mail.json && mail.json.content) || '');
      const code =
        /<strong>([0-9a-f]{6})<\/strong>/i.exec(body)?.[1] ||
        /\b([0-9a-f]{6})\b/i.exec(body.replace(/<[^>]+>/g, ' '))?.[1];
      if (code) return code;
    }
    await sleep(pollMs);
  }
  throw new Error('no verification code arrived');
}

/** new-api marks the local part with dots/plus as an alias and refuses it. */
async function requestCode(plain, proxy) {
  const res = await pacedSend(() =>
    request(`${GATEWAY}/api/verification?email=${encodeURIComponent(plain)}&turnstile=`, { proxy })
  );
  if (!res.json || res.json.success !== true) {
    throw new Error(`verification refused: ${res.json ? res.json.message : res.status}`);
  }
  return true;
}

async function register({ email, code, password, username }, proxy, { retryLimit = true } = {}) {
  const attempt = () =>
    request(`${GATEWAY}/api/user/register?turnstile=`, {
      method: 'POST',
      proxy,
      body: {
        username,
        password,
        display_name: username,
        email,
        verification_code: code,
        aff_code: null,
        acquisition_source: 'manual',
      },
    });
  let res = await attempt();
  if (retryLimit && (res.json || {}).retry_after_seconds) {
    const wait = Math.min(Number(res.json.retry_after_seconds) + 5, 900);
    console.log(`      ⏳ rate limited — waiting ${wait}s`);
    await sleep(wait * 1000);
    res = await attempt();
  }
  const json = res.json || {};
  if (json.success !== true) {
    throw new Error(`register failed: ${res.json ? JSON.stringify(res.json).slice(0, 160) : res.status}`);
  }
  return json;
}

/** The password travels RSA-OAEP(SHA-256)-encrypted, with the key id echoed back. */
async function login({ username, password }, proxy) {
  const keyRes = await request(`${GATEWAY}/api/user/login/encryption-key`, { proxy });
  const key = (keyRes.json && keyRes.json.data) || {};
  const publicKey = key.public_key || key.publicKey;
  const keyId = key.kid || key.key_id || key.id;
  if (!publicKey) throw new Error(`no encryption key: ${keyRes.text.slice(0, 140)}`);
  const encrypted = crypto
    .publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(password))
    .toString('base64');
  const res = await request(`${GATEWAY}/api/user/login?turnstile=`, {
    method: 'POST',
    proxy,
    body: { username, password_encrypted: encrypted, encryption_key_id: keyId },
  });
  const data = (res.json && res.json.data) || {};
  const token = data.access_token || data.token;
  const sid = (data.session && (data.session.sid || data.session.id)) || data.session_id;
  if (!token) throw new Error(`login failed: ${res.json ? JSON.stringify(res.json).slice(0, 160) : res.status}`);
  return { token, sid };
}

async function createKey({ token, sid, name }, proxy) {
  const headers = { Authorization: `Bearer ${token}`, ...(sid ? { 'x-auth-session': sid } : {}) };
  const res = await request(`${GATEWAY}/api/beat/account/keys`, {
    method: 'POST',
    headers,
    proxy,
    body: {
      name,
      expired_time: -1,
      remain_quota: 0,
      unlimited_quota: true,
      model_limits_enabled: false,
      model_limits: '',
      allow_ips: '',
      group: 'auto',
    },
  });
  const created = res.json && res.json.success !== false;
  const id = res.json && ((res.json.data && (res.json.data.id || res.json.data.key_id)) || res.json.id);
  if (!created || !id) {
    throw new Error(`key create failed: ${res.json ? JSON.stringify(res.json).slice(0, 160) : res.status}`);
  }
  const inline = res.json.data && (res.json.data.key || res.json.data.key_string || res.json.data.api_key);
  if (inline && !inline.includes('*')) return inline;
  // The panel only shows the key once, and only from this endpoint.
  const reveal = await request(`${GATEWAY}/api/beat/account/keys/${id}/key`, {
    method: 'POST',
    headers,
    proxy,
    body: {},
  });
  const key =
    reveal.json && reveal.json.data && (reveal.json.data.key || reveal.json.data.key_string || reveal.json.data.api_key);
  if (!key || key.includes('*')) {
    throw new Error(`key reveal failed: ${reveal.json ? JSON.stringify(reveal.json).slice(0, 160) : reveal.status}`);
  }
  return key;
}

async function verify(key, proxy) {
  const res = await request(`${GATEWAY}/v1/usage`, { headers: { Authorization: `Bearer ${key}` }, proxy });
  return { ok: res.status === 200, status: res.status };
}

/** The provider and the mailbox host both have to answer before we spend an inbox. */
async function proxyAlive(proxy) {
  if (!proxy) return true;
  for (const url of [`${GATEWAY}/api/status`, 'https://www.emailnator.com/']) {
    try {
      const res = await request(url, { proxy, timeoutMs: 9000 });
      if (!res.status || res.status >= 500) return false;
    } catch (e) {
      return false;
    }
  }
  return true;
}

async function verifyOnly(file, proxy) {
  const keys = fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!keys.length) {
    console.log(`  ! ${file} has no keys`);
    return 1;
  }
  console.log(`  verifying ${keys.length} key(s) against GET /v1/usage …`);
  let good = 0;
  const dead = [];
  for (const key of keys) {
    let result;
    try {
      result = await verify(key, proxy);
    } catch (err) {
      result = { ok: false, status: `network: ${String(err.message).slice(0, 40)}` };
    }
    if (result.ok) good++;
    else {
      const reason = deadReason(result.status);
      if (reason) dead.push({ key, reason });
    }
    console.log(`    ${result.ok ? '✔' : '✘'} ${key.slice(0, 6)}…${key.slice(-4)}  ${result.status}`);
  }
  console.log(`  verified  : ${good}/${keys.length} key(s) answer 200`);
  // The API own refusal (401/403/quota/ban) is a dead key: keys-dead.txt beside
  // the file, one standard line per key.
  const deadFile = path.join(path.dirname(path.resolve(file)), `keys-dead.txt`);
  // keys-dead.txt standard: key \t reason(401|403|quota|ban) \t new Date().toISOString()

  const deadLines = dead.map((d) => deadLine(d.key, d.reason)).filter(Boolean);
  fs.writeFileSync(deadFile, deadLines.join(`\n`) + (deadLines.length ? `\n` : ``));
  console.log(`  dead keys : ${dead.length} -> ${deadFile}`);
  return good === keys.length ? 0 : 1;
}

function proxyPool(args) {
  if (args['proxy-file']) {
    return fs
      .readFileSync(String(args['proxy-file']), 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  }
  const single = args.proxy || process.env.BEATAPI_PROXY || null;
  return single ? [String(single)] : [];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.count && !args['verify-only'])) {
    console.log(USAGE);
    return;
  }

  if (args['verify-only']) {
    PROXY_POOL = proxyPool(args);
    // proxy = null → every check takes the next pool line (rotated, like the mint path)
    process.exitCode = await verifyOnly(String(args['verify-only']), null);
    return;
  }

  const target = parseInt(args.count || '30', 10);
  const outFile = String(args.out || 'keys.txt');
  const accountsFile = String(args.accounts || `${outFile.replace(/\.txt$/, '')}.accounts.json`);
  const delay = parseInt(args.delay || '16000', 10);
  const prefix = String(args.prefix || 'beatapi-bulk');
  const doVerify = !args['no-verify'];
  const pool = proxyPool(args);

  if (pool.length && !createAgent) console.warn('  ! proxy helper not found — running direct');
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });

  const keys = fs.existsSync(outFile)
    ? fs.readFileSync(outFile, 'utf8').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [];
  const accounts = fs.existsSync(accountsFile) ? JSON.parse(fs.readFileSync(accountsFile, 'utf8')).accounts || [] : [];

  console.log(`  target ${target} · have ${keys.length} · proxies ${pool.length || 'none'}`);

  PROXY_POOL = pool;

  const save = () => {
    fs.writeFileSync(outFile, `${keys.join('\n')}\n`);
    fs.writeFileSync(
      accountsFile,
      JSON.stringify({ generated_at: new Date().toISOString(), count: keys.length, accounts }, null, 2)
    );
  };

  /** First pool line that answers on both sides — null when nothing is alive. */
  async function liveProxy() {
    if (!pool.length) return null;
    for (let i = 0; i < Math.min(pool.length, 25); i++) {
      const candidate = nextPoolLine();
      if (await proxyAlive(candidate)) return candidate;
    }
    return null;
  }

  let attempts = 0;

  async function mintOne(n) {
    const startedAt = Date.now();
    const proxy = await liveProxy();
    if (pool.length && !proxy) {
      console.error(`  [${n}] ✘ no live proxy in the pool — waiting 60s`);
      await sleep(60000);
      return false;
    }
    try {
      let plain = null;
      let dotted = null;
      for (let i = 0; i < 8; i++) {
        const mailbox = await newGmail(proxy);
        try {
          await requestCode(mailbox.plain, proxy);
          plain = mailbox.plain;
          dotted = mailbox.dotted;
          break;
        } catch (err) {
          if (/already in use/i.test(err.message)) continue;
          throw err;
        }
      }
      if (!plain) throw new Error('no fresh mailbox after 8 tries (all already in use)');
      console.log(`  [${n}] ${plain}${dotted !== plain ? ` (dotted ${dotted})` : ''}${proxy ? ` · proxy ${proxy}` : ''}`);
      const code = await waitForCode(plain, { proxy });
      const username = `${plain.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 14)}-${crypto
        .randomBytes(2)
        .toString('hex')}`;
      const password = `${crypto.randomBytes(12).toString('base64url')}Aa1!`;
      await register({ email: plain, code, password, username }, proxy);
      const { token, sid } = await login({ username, password }, proxy);
      const key = await createKey({ token, sid, name: `${prefix}-${n}` }, proxy);
      keys.push(key);
      accounts.push({ n, email: plain, username, password, key });
      save();
      const check = doVerify ? await verify(key, proxy) : { ok: null, status: 'skipped' };
      const failed = doVerify && check.ok === false;
      console.log(
        `      ${failed ? '✘' : '✔'} ${key.slice(0, 12)}… (${((Date.now() - startedAt) / 1000).toFixed(1)}s)` +
          (doVerify ? ` usage=${check.status}` : '')
      );
      return true;
    } catch (err) {
      console.error(`  [${n}] ✘ ${String(err.message).slice(0, 150)}`);
      if (isNetworkError(err.message)) await sleep(2000);
      return false;
    }
  }

  const workers = Math.max(1, parseInt(args.workers || '3', 10));
  console.log(`  workers   : ${workers}`);
  // A failed account must not eat one of the requested keys: keep going until the
  // list reaches --count, with a ceiling so a dead pool cannot spin forever.
  const attemptLimit = Math.max(target * 2, target + 10);

  // A slot is claimed only while the list is still short of --count, counting the
  // attempts already in flight, so workers cannot overshoot the target. A failed
  // account releases its slot again instead of eating one of the requested keys.
  let inFlight = 0;
  async function worker() {
    for (;;) {
      if (keys.length + inFlight >= target) return;
      if (attempts >= attemptLimit) return;
      const n = ++attempts;
      inFlight++;
      let ok;
      try {
        ok = await mintOne(n);
      } finally {
        inFlight--;
      }
      if (keys.length < target) await sleep(ok ? delay : Math.min(delay, 3000));
    }
  }

  await Promise.all(Array.from({ length: workers }, worker));
  console.log(`  keys → ${outFile} (${keys.length} line(s)) · accounts → ${accountsFile}`);
}

main().catch((err) => {
  console.error('[fatal]', err.message);
  process.exit(1);
});
