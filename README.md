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

[🛠 Quick start](#-quick-start) · [✅ Verified](#-verified-working--every-key-is-tested) · [🤖 Models & free tier](#-models--free-tier) · [🔑 What one key gets you](#-what-one-key-gets-you) · [⚙️ Options](#️-options) · [🛰️ Proxy](#️-behind-a-proxy) · [🐞 Issues](#-issues--updates)

</div>

---

> **Mint as many accounts/keys as you need — there is no cap.** `--count N` (default `30`)
> accepts any N; the number is just how many accounts you want this run to create.

## ✨ Why this exists

BeatAPI hands out keys from its dashboard **one account at a time**, and every new account has to be
registered, confirmed by an e-mail code and logged in before a key can be created. Doing that by hand
30 times is the whole afternoon; this tool does it in a loop, over your proxy list, and checks every
key as it is written.

```
mailbox ──▶ GET  /api/verification?email=…        (mails a code)
         ├─▶ POST /api/user/register?turnstile=    (code + password)
         ├─▶ GET  /api/user/login/encryption-key   (RSA-OAEP key id)
         ├─▶ POST /api/user/login?turnstile=       (password_encrypted)
         ├─▶ POST /api/beat/account/keys           (create; returns a MASKED key)
         └─▶ POST /api/beat/account/keys/{id}/key  (the real key — shown once)
                        │
                        ▼
                 GET /v1/usage → 200 means the key is live
```

## 🤖 Models & free tier

`GET https://api.beatapi.io/v1/models` with a minted key returns **43 models**, **7 of which are on
the free tier** — they answer on a brand-new, unfunded account:

| Free-tier model | Notes |
| --- | --- |
| `deepseek-v4.1-flash-free` | the model used for live verification here |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | Google-family id served by the gateway |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 family |
| `gpt-6.1-sol-free` | OpenAI-family id |
| `jev-1.13-free` | Jev |

**What the free tier actually gives you, measured:** **one successful request per free model per
window** — the next call to the same model answers `429 this model allows at most 1 successful
requests …`. So one key is a daily taste of the catalogue, not a free engine.

**Paid models** (the remaining 36 on the same key) need credits on the account: without a balance they
answer `402 Insufficient balance` — the *key* is valid, the *account* is unfunded. The pricing page
notes a sign-up credit reaching 48 models and the 7 free models running "for a limited time"; amounts
and windows are set by BeatAPI and can change.

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Want more of it?** One account per key is the unit: `--count N` gives you N accounts, each with its
own free-model window and its own credit balance, so quota scales with the number of keys you mint.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **BeatAPI** — [beatapi.io](https://beatapi.io) · API at `https://api.beatapi.io/v1` |
| 🎁 What the provider gives | An OpenAI-compatible gateway over **43 models** (7 of them free-tier), plus "models, data tools" endpoints |
| 🔑 What one key gets you | A working Bearer key for your own account: `GET /v1/usage` answers 200 with your account's credit and usage counters, and the **7 `-free` models answer while their promo runs** — one request per model per window. Paid models need credits/​top-up on that account |
| 🧮 Keys per account | One key per account here (the account *is* the unit); this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.beatapi.io/v1/chat/completions`, `GET /v1/models`, `GET /v1/usage` |
| 🔒 Your data | Only `api.beatapi.io` and the mailbox service are contacted; keys stay on your machine |

## ✅ Verified working — every key is tested

A key reaches `keys.txt` only after the provider's own API answers with it:

| Check | Result |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — run automatically for **every** key right after creation | **HTTP 200**, `data.object: "usage"` |
| Whole-list re-check with `--verify-only` (keys from separate accounts) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` on a `-free` model | **HTTP 200**, real completion (`deepseek-v4.1-flash-free`) |
| Paid model on a fresh account | `402 Insufficient balance` — the *key* is valid, the *account* needs credits |

```bash
node cli.js --verify-only keys.txt   # re-check a whole list at any time
```

> A key is shown **once**, at creation: the panel answers with the masked form (`x9ZX**********2erY`)
> and the real key only comes from `POST /api/beat/account/keys/{id}/key`. The tool calls that endpoint
> immediately and writes the result straight to disk — nothing depends on you keeping a tab open.

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

> **Two provider-side notes worth knowing up front.** The registration address has to be a
> **`gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`** mailbox, and dots are ignored
> (`first.last@` is the same address as `firstlast@`, which would answer *"Email address is already in
> use"*) — so pass a mailbox and stay on its dot-free form. And BeatAPI sends its own verification
> mail: after a lot of sign-ups in one day it answers `550 You have reached your daily email sending
> quota`, which simply means new sign-ups resume the next day — the keys you already have keep working.

## ⚙️ Options

| Option | Default | Meaning |
| --- | --- | --- |
| `--count <n>` | `30` | how many keys the list should end up with |
| `--out <file>` | `keys.txt` | key list, **one key per line** |
| `--accounts <file>` | `<out>.accounts.json` | account records (mailbox / user / password) |
| `--prefix <name>` | `beatapi-bulk` | key name prefix shown in the dashboard |
| `--delay <ms>` | `16000` | pause between accounts |
| `--proxy <url>` | `$BEATAPI_PROXY` | single HTTP(S)/SOCKS proxy for every request |
| `--proxy-file <f>` | — | one proxy per line, **rotated per account** |
| `--no-verify` | off | skip the `GET /v1/usage` check (not recommended) |
| `--verify-only <f>` | — | re-check every key in a list and exit |
| `-h, --help` | | usage |

**Top-up behaviour:** keys already present in `--out` count towards `--count`, so re-running adds
only what is missing.

## 🛰️ Behind a proxy

**Put an exit in front of the run.** One account per key means one registration per key, and BeatAPI
rate-limits registrations per address (measured: *20 requests / 20 minutes*) — rotating a proxy list
gives every account a clean run, and the tool waits out a `429 … retry_after_seconds` instead of
burning the account when the limit still trips.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | verified keys, one per line — git-ignored, never committed |
| `keys.accounts.json` | account records (mailbox / user / password) — git-ignored |
| `proxies.txt` | your exit pool, one proxy per line — git-ignored |
| `launcher.config.json` | what the launcher remembers |

## 🐞 Issues & updates

Something changed on BeatAPI's side (endpoint, e-mail rules, limits)? **[Open an issue](https://github.com/F0Rextasy/beatapi-bulk-apikey/issues)**
with the command you ran and the exact error text. PRs welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE). BeatAPI's own terms and rate limits apply to whatever you do with
the keys; use this for your own accounts.

<div align="center">

**[github.com/F0Rextasy](https://github.com/F0Rextasy)** · **[x.com/bigbullapp](https://x.com/bigbullapp)**

</div>
