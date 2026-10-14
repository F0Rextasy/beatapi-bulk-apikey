<div align="center">

```
███████╗ ██████╗ ██████╗ ███████╗██╗  ██╗████████╗ █████╗ ███████╗██╗   ██╗
██╔════╝██╔═████╗██╔══██╗██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔════╝╚██╗ ██╔╝
█████╗  ██║██╔██║██████╔╝█████╗   ╚███╔╝    ██║   ███████║███████╗ ╚████╔╝
██╔══╝  ████╔╝██║██╔══██╗██╔══╝   ██╔██╗    ██║   ██╔══██║╚════██║  ╚██╔╝
██║     ╚██████╔╝██║  ██║███████╗██╔╝ ██╗   ██║   ██║  ██║███████║   ██║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝
```

# beatapi-bulk-apikey

**Mint many [BeatAPI](https://beatapi.io) keys — one fresh account per key — verified, one per line, with an interactive launcher.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20(%2B7%20free)-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 What you get](#-what-you-get) · [🤖 Models](#-models-one-key-reaches) · [⚙️ Options](#️-cli-options) · [🛰️ Proxy](#️-behind-a-proxy)

</div>

---

> **Mint as many accounts/keys as you need — there is no cap.** `--count N` (default `30`)
> accepts any N; the number is just how many accounts you want this run to create.

## ✨ Why this exists

BeatAPI hands out keys from its dashboard **one account at a time** — and registration is guarded
on two sides: the address must be a **dot-free `gmail.com`/`qq.com`/`yahoo.com`/`icloud.com`**
mailbox, and a *successful* registration only happens after a six-character code arrives by mail.
Doing that by hand 30 times is the whole afternoon; this tool does it in a loop, over proxies, and
checks every key as it is written.

```
dot-free gmail ──▶ GET  /api/verification?email=…        (mails a code)
               ├─▶ POST /api/user/register?turnstile=    (code + password)
               ├─▶ GET  /api/user/login/encryption-key   (RSA-OAEP key id)
               ├─▶ POST /api/user/login?turnstile=       (password_encrypted)
               ├─▶ POST /api/beat/account/keys           (create; returns a MASKED key)
               └─▶ POST /api/beat/account/keys/{id}/key  (the real key — shown once)
                              │
                              ▼
                       GET /v1/usage → 200 means the key is live
```

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — run automatically for **every** key right after creation | **all keys → HTTP 200**, `data.object: "usage"` |
| Whole-list re-check with `--verify-only` (fresh proxy pool, keys from separate accounts) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` on a `-free` model | **HTTP 200**, real completion (`deepseek-v4.1-flash-free`) |
| Free-tier limits observed live | one successful request per free model per window (extra calls answer `429 this model allows at most 1 successful requests …`) |
| Paid models on a fresh account | `402 Insufficient balance` — the *key* is valid, the *account* needs credits |

Every key is verified before it lands in `keys.txt`, and `--verify-only` re-checks a whole list at
any time:

```bash
node cli.js --verify-only keys.txt
```

## 🧭 What you get

| | |
| --- | --- |
| 🏢 Provider | **BeatAPI** — [beatapi.io](https://beatapi.io) · API at `https://api.beatapi.io/v1` |
| 🎁 What the provider gives | An OpenAI-compatible gateway over **43 models** (7 of them free-tier: `deepseek-v4.1-flash-free`, `gemini-3.8-flash-free`, `glm-5.3-free`, `glm-5.3-flash-free`, `gpt-6.1-sol-free`, `deepseek-v4-flash-0731-free`, `jev-1.13-free`), plus "models, data tools" endpoints. Pricing page: *signup credit reaches 48 models; 7 models free for a limited time* |
| 🔑 What one key gets you | A working Bearer key for your own account: `GET /v1/usage` answers 200 with your account's credit and usage counters, and the **7 `-free` models answer while their promo runs** — one request per model per window, so a key is a "daily taste" of the paid catalogue. Paid models need credits/​top-up on that account |
| 🧮 Keys per account | One key per account here (the account *is* the unit); this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.beatapi.io/v1/chat/completions`, `GET /v1/models`, `GET /v1/usage` |
| 🔒 Your data | Only `api.beatapi.io` and the mailbox service are contacted; keys stay on your machine |

## 🤖 Models one key reaches

`GET https://api.beatapi.io/v1/models` with a minted key — **43 models**, including:

| Family | Examples |
| --- | --- |
| OpenAI-family ids served by the gateway | `gpt-6-astra`, `gpt-5.6-terra`, `gpt-5.6-luna`, `gpt-5.6-sol`, `gpt-6.1-sol-free` |
| Anthropic-family ids | `claude-opus-5`, `claude-opus-5-5`, `claude-sonnet-5`, `claude-fable-5-1`, `claude-haiku-4-5-20251001` |
| Google-family ids | `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.1-pro-preview` |
| xAI-family ids | `grok-4.7`, `grok-4.6`, `grok-4.5` |
| Open-weight families | `deepseek-v4.1-flash`, `deepseek-v4-pro-0813`, `kimi-k3`, `glm-5.3`, `MiniMax-M3`, `qwen3.8-max` |
| Free tier (7) | `deepseek-v4.1-flash-free`, `deepseek-v4-flash-0731-free`, `gemini-3.8-flash-free`, `glm-5.3-free`, `glm-5.3-flash-free`, `gpt-6.1-sol-free`, `jev-1.13-free` |

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🛠 Quick start

```bash
git clone https://github.com/F0Rextasy/beatapi-bulk-apikey.git
cd beatapi-bulk-apikey
```

### 🖱️ The launcher (recommended)

```bash
node launcher.js
```

It asks how many keys you want, the output file, the key-name prefix, the pause between accounts
and an optional proxy / proxy-list, remembers the answers in `launcher.config.json`, and then runs
the tool. Menu: **1) Mint keys · 2) Verify keys · 3) Settings · 4) Help · q) Quit**.

### ⌨️ Directly

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
```

```
  target    : 30 key(s), 0 already in keys.txt
  egress    : 45 proxies (rotated)
  [1] someone@gmail.com · proxy 203.0.113.7:3128
      ✔ PSofZDzl…d4Cu (24.7s) usage=200
  …
  keys      : keys.txt (30 line(s))
  accounts  : keys.accounts.json
```

### 🛰️ Egress first, always

Paid exits, shared exits, whatever you have — **put it in front of the run**. One account per key
means one registration per key, and BeatAPI throttles registrations per address
(*20 requests / 20 minutes*); rotating a proxy list gives every account a clean slate, and the tool
waits out a `429 … retry_after_seconds` instead of burning the account when it still happens.

## ⚙️ CLI options

| Option | Default | Meaning |
| --- | --- | --- |
| `--count <n>` | `30` | how many keys the list should end up with |
| `--out <file>` | `keys.txt` | key list, **one key per line** |
| `--accounts <file>` | `<out>.accounts.json` | account records (mailbox / user / password) |
| `--prefix <name>` | `beatapi-bulk` | key name prefix shown in the dashboard |
| `--delay <ms>` | `16000` | pause between accounts (measured `/api/verification` limit) |
| `--proxy <url>` | `$BEATAPI_PROXY` | single HTTP(S)/SOCKS proxy for every request |
| `--proxy-file <f>` | — | one proxy per line, **rotated per account** |
| `--no-verify` | off | skip the `GET /v1/usage` check (not recommended) |
| `--verify-only <f>` | — | re-check every key in a list and exit |
| `-h, --help` | | usage |

**Top-up behaviour:** keys already present in `--out` count towards `--count`, so re-running adds
only what is missing.

## 🧠 Notes & limits

- **A provider-side daily cap exists** — measured live: after a batch of accounts the
  verification send starts answering
  `550 You have reached your daily email sending quota`. That is BeatAPI's own outbound-mail
  budget, not a limit of this tool, and it resets on their side; the tool reports it per account and
  you can simply resume the next day (`--count` continues where `keys.txt` left off).
- **Dots matter**: BeatAPI treats `first.last@gmail.com` as an alias of `firstlast@gmail.com` and
  answers *"Email address is already in use"* — the tool takes a mailbox and strips the dots before
  using it.
- **A key is shown once**: creation answers with the masked form (`x9ZX**********2erY`); the real
  key only comes from `POST /api/beat/account/keys/{id}/key`, which is why the tool calls it
  immediately and writes the result straight to disk.
- **Free-tier models are rationed**: one successful request per free model per window — extra calls
  answer `429 this model allows at most 1 successful requests …`. Paid models need credits on the
  account (`402 Insufficient balance`).
- Gate summary: mailbox allow-list (gmail/qq/yahoo/icloud) → code by mail → registration throttle
  (20 req / 20 min per address) → daily send quota → no phone step, no card step.
- BeatAPI's own terms and rate limits apply to whatever you do with the keys. Use this for your own
  accounts.

## 🐞 Issues & updates

Something changed on BeatAPI's side (endpoint, allow-list, throttle)? **[Open an issue](https://github.com/F0Rextasy/beatapi-bulk-apikey/issues)**
with the command you ran and the exact error text. PRs welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[github.com/F0Rextasy](https://github.com/F0Rextasy)** · **[x.com/bigbullapp](https://x.com/bigbullapp)**

</div>
