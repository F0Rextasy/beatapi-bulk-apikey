<div align="center">

```
██████╗ ███████╗ █████╗ ████████╗ █████╗ ██████╗ ██╗
██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██║
██████╔╝█████╗  ███████║   ██║   ███████║██████╔╝██║
██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══██║██╔═══╝ ██║
██████╔╝███████╗██║  ██║   ██║   ██║  ██║██║     ██║
╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝
```

# beatapi-bulk-apikey

**Bulk-create BeatAPI accounts with auto-generated API keys — OpenAI-compatible inference (43 models, 7 free-tier) + 9Router-ready endpoint.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-43-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Free tier — how much you get

**Every new BeatAPI account gets the 7 `-free` models — no card; paid models need credits on that same account.**

| What | Value |
| --- | --- |
| Free-tier models | **7 of the 43** listed ids answer on a brand-new, unfunded account |
| Free-model limit (measured) | **one successful request per free model per window** — the next call answers `429 this model allows at most 1 successful requests …` |
| Paid models | answer `402 Insufficient balance` until you top the account up |
| Card required | **No** to register |
| Sign-up mailbox | `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` only — and dots are ignored (`first.last@` is the same address as `firstlast@`) |
| The unit that scales | **one account = one key** → `--count N` gives you N accounts, each with its own free-model window and its own credit balance |

**The free-tier model ids**

| Model | Notes |
| --- | --- |
| `deepseek-v4.1-flash-free` | the model used for live verification here |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | Google-family id served by the gateway |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 family |
| `gpt-6.1-sol-free` | OpenAI-family id |
| `jev-1.13-free` | Jev |

> 💡 Amounts and windows are set by BeatAPI and can change (its pricing page also notes a sign-up credit reaching 48 models, and the 7 free models running "for a limited time"). Re-prove your own file at any time:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 The free tier is set by BeatAPI and can change. Check the live numbers at [beatapi.io](https://beatapi.io) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 43 of them

`GET https://api.beatapi.io/v1/models` with a minted key returns **43 models**, **7 of which are on the free tier**. The remaining 36 answer `402 Insufficient balance` on an unfunded account — the key is valid, the account has no credits.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Want more of the catalogue?** Credit the account, or mint more accounts: every key brings its own free-model window and its own balance.

## 🧪 How to use the API

The base URL is **`https://api.beatapi.io/v1`** — OpenAI-compatible, so anything that speaks OpenAI works (SDKs, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

The account's own counters are an OpenAI-shaped endpoint too:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Quick start

```bash
# clone or fork this repository, then:
cd beatapi-bulk-apikey

# 1) your proxy list, one exit per line (http://… or socks5://…)
printf 'http://127.0.0.1:8080\n' > proxies.txt

# 2) go
node launcher.js                              # interactive
# or directly:
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
```

`keys.txt` is written **only** after `GET /v1/usage` answers 200 with the new key, so every line in it is a key that authenticated against the provider's own API.

### 🖱️ The launcher

```bash
node launcher.js
```

It asks how many keys you want, the output file, the key-name prefix, the pause between accounts and an optional proxy / proxy-list, remembers the answers in `launcher.config.json`, and then runs the tool. Menu: **1) Mint keys · 2) Verify keys · 3) Settings · 4) Help · q) Quit**.

## ✅ Verified working — every key is tested

A key reaches `keys.txt` only after the provider's own API answers with it:

| Check | Result |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — run automatically for **every** key right after creation | **HTTP 200**, `data.object: "usage"` |
| Whole-list re-check with `--verify-only` (keys from separate accounts) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` on a `-free` model | **HTTP 200**, real completion (`deepseek-v4.1-flash-free`) |
| Paid model on a fresh account | `402 Insufficient balance` — the *key* is valid, the *account* needs credits |

> A key is shown **once**, at creation: the panel answers with the masked form (`x9ZX**********2erY`) and the real key only comes from `POST /api/beat/account/keys/{id}/key`. The tool calls that endpoint immediately and writes the result straight to disk.

> **Quality gates.** Every key here passed a live `chat-200` before it was written to `keys.txt`
> (dead keys are never shipped). Router combos follow the same rule at the model level: an entry is
> added **only if the model answers `chat-200` and can call tools** — a model without tool support,
> a dead key or a dead provider is dropped instead of added. Re-run the verify step any time;
> failures are reported, never hidden.

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| mailbox | `GET /api/verification?email=…` | mails the code to a `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` address |
| register | `POST /api/user/register?turnstile=` | code + password |
| login key | `GET /api/user/login/encryption-key` | RSA-OAEP key id |
| login | `POST /api/user/login?turnstile=` | `password_encrypted` |
| key create | `POST /api/beat/account/keys` | returns a **masked** key |
| key reveal | `POST /api/beat/account/keys/{id}/key` | the real key — shown once |
| prove | `GET /v1/usage` | `200` means the key is live |

**Two provider-side notes worth knowing up front.** The registration address has to be a `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` mailbox, and dots are ignored (`first.last@` is the same address as `firstlast@`, which answers *"Email address is already in use"*) — pass a mailbox and stay on its dot-free form. And BeatAPI sends its own verification mail: after a lot of sign-ups in one day it answers `550 You have reached your daily email sending quota`, which simply means new sign-ups resume the next day — the keys you already have keep working.

## ⚙️ CLI options

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

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

Keys already present in `--out` count towards `--count`, so re-running adds only what is missing.

## 🛰️ Behind a proxy

**Put an exit in front of the run.** One account per key means one registration per key, and BeatAPI rate-limits registrations per address (measured: *20 requests / 20 minutes*) — rotating a proxy list gives every account a clean run, and the tool waits out a `429 … retry_after_seconds` instead of burning the account when the limit still trips.

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
| `launcher.config.json` | what the launcher remembers — git-ignored |
| `cli.js` · `launcher.js` · `proxy.js` | the minting tool, the interactive menu and the proxy rotation |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router. BeatAPI serves plain OpenAI at `https://api.beatapi.io/v1`, so the connector registers **one `openai-compatible` provider-node** (prefix `beatapi`) and attaches every key in `keys.txt` as a connection — `beatapi-001`, `beatapi-002`, … Re-running it is idempotent.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Models are then served as `beatapi/<model id>` — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — load-balanced across every connection:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Connect to OmniRoute

[OmniRoute](https://omniroute.online) is a self-hosted, OpenAI-compatible router. The connector does the same job there — one `openai-compatible` node (prefix `beatapi`), one connection per key in `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Defaults: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 What the provider gives | one fresh account per key — 43 models, 7 of them free-tier, every key proven on the provider's own API |
| 🔑 What one key gets you | one API key scoped to its own account: the 43 model ids on the endpoint below, at your plan's limits. The quota lives on the **account**, which is exactly why this tool creates one account per key |
| 🌐 API shape | OpenAI-compatible: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Your data | only beatapi.io and the inbox backend you configure are contacted; keys stay on your machine |

## 🐞 Issues

Something changed on BeatAPI's side (endpoint, e-mail rules, limits)? **[Open an issue](../../issues)** with the command you ran and the exact error text. PRs welcome.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>
