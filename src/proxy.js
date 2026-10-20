'use strict';
/**
 * Proxy support for the BeatAPI CLI: http(s) CONNECT, SOCKS5 and SOCKS4a.
 *
 * `parseProxy()` turns a pool line into `{ protocol, host, port, username, password }`,
 * `createAgent(proxy)` returns an https.Agent that dials the provider through it.
 * Both are optional at runtime: without this file the CLI runs direct.
 *
 * Accepted pool lines:
 *   host:port
 *   user:pass@host:port
 *   socks5://user:pass@host:port
 *   host:port:user:pass        (the `|` separated crawl format with 4 parts)
 */
const net = require('net');
const tls = require('tls');
const https = require('https');

const DEFAULT_TIMEOUT_MS = 15000;

function parseProxy(raw, { defaultProtocol = 'http' } = {}) {
  const line = String(raw).trim();
  if (!line) return null;
  let protocol = defaultProtocol;
  let rest = line;
  const scheme = line.match(/^([a-z0-9]+):\/\/(.+)$/i);
  if (scheme) {
    protocol = scheme[1].toLowerCase();
    rest = scheme[2];
  } else if (line.includes('|')) {
    const [host, port, user, pass] = line.split('|').map((part) => part.trim());
    return buildProxy(protocol, host, port, user, pass, line);
  }

  let username;
  let password;
  const at = rest.lastIndexOf('@');
  if (at !== -1) {
    const credentials = rest.slice(0, at);
    rest = rest.slice(at + 1);
    const split = credentials.indexOf(':');
    if (split === -1) username = credentials;
    else {
      username = credentials.slice(0, split);
      password = credentials.slice(split + 1);
    }
  }

  const parts = rest.split(':');
  let host;
  let port;
  let extraUser;
  let extraPass;
  if (parts.length === 4) [host, port, extraUser, extraPass] = parts;
  else if (parts.length === 2) [host, port] = parts;
  else return null;
  if (extraUser !== undefined && username === undefined) {
    username = extraUser;
    password = extraPass;
  }
  return buildProxy(protocol, host, port, username, password, line);
}

function buildProxy(protocol, host, port, username, password, raw) {
  const wanted = String(protocol || 'http').toLowerCase();
  const normalized =
    wanted === 'https'
      ? 'https'
      : wanted === 'socks4' || wanted === 'socks4a'
      ? 'socks4'
      : wanted === 'socks' || wanted === 'socks5' || wanted === 'socks5h'
      ? 'socks5'
      : 'http';
  const number = parseInt(port, 10);
  if (!host || !Number.isFinite(number) || number <= 0 || number > 65535) return null;
  return {
    raw,
    protocol: normalized,
    host: String(host).replace(/^\[|\]$/g, ''),
    port: number,
    username: username || undefined,
    password: password || undefined,
  };
}

/** `socks5://user:***@host:1080` — safe to print. */
function label(proxy) {
  if (!proxy) return '(direct)';
  const credentials = proxy.username ? `${encodeURIComponent(proxy.username)}:***@` : '';
  return `${proxy.protocol}://${credentials}${proxy.host}:${proxy.port}`;
}

/** Resolve when `event` fires, reject on `error`, give up after timeoutMs. */
function once(emitter, event, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = timeoutMs
      ? setTimeout(() => {
          cleanup();
          reject(new Error(`timeout waiting for ${event}`));
        }, timeoutMs)
      : null;
    const onEvent = (...args) => {
      cleanup();
      resolve(args);
    };
    const onError = (err) => {
      cleanup();
      reject(err);
    };
    function cleanup() {
      clearTimeout(timer);
      emitter.removeListener(event, onEvent);
      emitter.removeListener('error', onError);
    }
    emitter.once(event, onEvent);
    emitter.once('error', onError);
  });
}

/** Open a TCP tunnel to host:port through the proxy; resolves with the socket. */
function connectHttpProxy(proxy, { host, port, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxy.host, port: proxy.port });
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };
    const timer = setTimeout(() => fail(new Error(`proxy CONNECT timeout (${label(proxy)})`)), timeoutMs);
    socket.on('error', (err) => {
      clearTimeout(timer);
      fail(new Error(`proxy connect failed (${label(proxy)}): ${err.message}`));
    });
    socket.setNoDelay(true);

    let buffer = Buffer.alloc(0);
    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const end = buffer.indexOf('\r\n\r\n');
      if (end === -1) return;
      socket.removeListener('data', onData);
      clearTimeout(timer);
      const head = buffer.slice(0, end).toString('latin1');
      const status = parseInt((head.split('\r\n')[0].match(/^HTTP\/\d\.\d (\d{3})/) || [])[1], 10);
      if (status !== 200) {
        let hint = '';
        if (status === 407) hint = ' (proxy authentication required/rejected)';
        else if (status === 403) hint = ' (proxy refused the destination)';
        else if (!status) hint = ' (not an HTTP proxy response)';
        return fail(new Error(`proxy CONNECT ${status || 'garbage'}${hint} via ${label(proxy)}`));
      }
      if (settled) return;
      settled = true;
      const leftover = buffer.slice(end + 4);
      if (leftover.length) socket.unshift(leftover);
      resolve(socket);
    };
    socket.on('data', onData);
    socket.on('connect', () => {
      const request = [
        `CONNECT ${host}:${port} HTTP/1.1`,
        `Host: ${host}:${port}`,
        'Proxy-Connection: Keep-Alive',
      ];
      if (proxy.username) {
        const credentials = Buffer.from(`${proxy.username}:${proxy.password || ''}`).toString('base64');
        request.push(`Proxy-Authorization: Basic ${credentials}`);
      }
      socket.write(request.join('\r\n') + '\r\n\r\n');
    });
  });
}

const SOCKS5_ERRORS = {
  1: 'general failure',
  2: 'not allowed',
  3: 'network unreachable',
  4: 'host unreachable',
  5: 'connection refused',
  6: 'TTL expired',
  7: 'command not supported',
  8: 'address type not supported',
};

/** SOCKS5 (with optional username/password auth), IPv4/IPv6/domain targets. */
function connectSocks5(proxy, { host, port, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxy.host, port: proxy.port });
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };
    const timer = setTimeout(() => fail(new Error(`SOCKS5 timeout (${label(proxy)})`)), timeoutMs);
    socket.on('error', (err) => fail(new Error(`SOCKS5 connect failed (${label(proxy)}): ${err.message}`)));
    socket.setNoDelay(true);

    let stage = 'method';
    let buffer = Buffer.alloc(0);

    const requestConnect = () => {
      const target = Buffer.from(host);
      socket.write(Buffer.concat([Buffer.from([5, 1, 0, 3, target.length]), target, Buffer.from([(port >> 8) & 0xff, port & 0xff])]));
    };

    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      if (stage === 'method') {
        if (buffer.length < 2) return;
        const method = buffer[1];
        buffer = buffer.slice(2);
        if (method === 0xff) return fail(new Error(`SOCKS5 proxy rejected auth methods (${label(proxy)})`));
        if (method === 0x02) {
          if (!proxy.username) return fail(new Error(`SOCKS5 proxy wants username/password (${label(proxy)})`));
          stage = 'auth';
          const user = Buffer.from(proxy.username);
          const pass = Buffer.from(proxy.password || '');
          socket.write(Buffer.concat([Buffer.from([1, user.length]), user, Buffer.from([pass.length]), pass]));
          return;
        }
        stage = 'reply';
        return requestConnect();
      }

      if (stage === 'auth') {
        if (buffer.length < 2) return;
        const ok = buffer[1] === 0;
        buffer = buffer.slice(2);
        if (!ok) return fail(new Error(`SOCKS5 auth rejected (${label(proxy)})`));
        stage = 'reply';
        return requestConnect();
      }

      if (buffer.length < 4) return;
      const status = buffer[1];
      const addressType = buffer[3];
      const replyLength = addressType === 1 ? 10 : addressType === 4 ? 22 : 7 + buffer[4];
      if (buffer.length < replyLength) return;
      if (status !== 0) {
        return fail(new Error(`SOCKS5 error ${SOCKS5_ERRORS[status] || status} (${label(proxy)})`));
      }
      clearTimeout(timer);
      const leftover = buffer.slice(replyLength);
      if (settled) return;
      settled = true;
      if (leftover.length) socket.unshift(leftover);
      resolve(socket);
    };

    socket.on('data', onData);
    socket.on('connect', () => {
      const methods = proxy.username ? [0, 2] : [0];
      socket.write(Buffer.from([5, methods.length, ...methods]));
    });
  });
}

/** SOCKS4a — the hostname is sent to the proxy, so no local DNS lookup. */
function connectSocks4(proxy, { host, port, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const socket = net.connect({ host: proxy.host, port: proxy.port });
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(err);
    };
    const timer = setTimeout(() => fail(new Error(`SOCKS4 timeout (${label(proxy)})`)), timeoutMs);
    socket.on('error', (err) => fail(new Error(`SOCKS4 connect failed (${label(proxy)}): ${err.message}`)));
    socket.setNoDelay(true);

    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length < 8) return;
      clearTimeout(timer);
      if (buffer[1] !== 0x5a) return fail(new Error(`SOCKS4 error code ${buffer[1]} (${label(proxy)})`));
      const leftover = buffer.slice(8);
      if (settled) return;
      settled = true;
      if (leftover.length) socket.unshift(leftover);
      resolve(socket);
    });
    socket.on('connect', () => {
      const user = Buffer.from(proxy.username || '');
      socket.write(
        Buffer.concat([
          Buffer.from([4, 1, (port >> 8) & 0xff, port & 0xff, 0, 0, 0, 1]), // 0.0.0.1 = SOCKS4a
          user,
          Buffer.from([0]),
          Buffer.from(host),
          Buffer.from([0]),
        ])
      );
    });
  });
}

function openTunnel(proxy, { host, port, timeoutMs } = {}) {
  if (proxy.protocol === 'socks5') return connectSocks5(proxy, { host, port, timeoutMs });
  if (proxy.protocol === 'socks4') return connectSocks4(proxy, { host, port, timeoutMs });
  return connectHttpProxy(proxy, { host, port, timeoutMs });
}

/** https.Agent that dials every host through the proxy (TLS is still verified). */
class ProxyAgent extends https.Agent {
  constructor(proxy, options = {}) {
    super({ keepAlive: false, ...options });
    this.proxy = proxy;
  }

  createConnection(options, callback) {
    const host = options.host;
    const port = Number(options.port) || 443;
    let tunnel = null;
    openTunnel(this.proxy, { host, port, timeoutMs: this.proxy.timeoutMs })
      .then((socket) => {
        tunnel = socket;
        if (options.secureEndpoint === false) return socket;
        const secured = tls.connect({
          socket,
          servername: options.servername || host,
          rejectUnauthorized: this.proxy.rejectUnauthorized !== false,
        });
        return once(secured, 'secureConnect', this.proxy.timeoutMs || DEFAULT_TIMEOUT_MS).then(() => secured);
      })
      .then((socket) => callback(null, socket))
      .catch((err) => {
        if (tunnel) tunnel.destroy();
        callback(err);
      });
  }
}

function createAgent(proxy, options) {
  return new ProxyAgent(proxy, options);
}

module.exports = { parseProxy, openTunnel, createAgent, ProxyAgent };
