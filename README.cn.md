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

**批量创建 BeatAPI 账户并自动生成 API 密钥 — OpenAI 兼容推理（43 个模型，7 个免费层）+ 9Router 就绪端点。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费层](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-43-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 免费层 — 你能获得多少

**每个新的 BeatAPI 账户都会获得 7 个 `-free` 模型 — 无需银行卡；付费模型需要在该账户上有额度。**

| 项目 | 值 |
| --- | --- |
| 免费层模型 | 列出的 43 个 id 中有 **7 个** 在全新的、未充值的账户上可用 |
| 免费模型限制（实测） | **每个免费模型每个窗口一次成功请求** — 下一次调用会返回 `429 this model allows at most 1 successful requests …` |
| 付费模型 | 在账户充值前返回 `402 Insufficient balance` |
| 是否需要银行卡 | 注册 **不需要** |
| 注册邮箱 | 仅限 `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — 且点号会被忽略（`first.last@` 与 `firstlast@` 是同一地址） |
| 可扩展的单位 | **一个账户 = 一个密钥** → `--count N` 会给你 N 个账户，每个都有自己的免费模型窗口和自己的额度余额 |

**免费层模型 id**

| 模型 | 备注 |
| --- | --- |
| `deepseek-v4.1-flash-free` | 此处用于实时验证的模型 |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | 由网关提供的 Google 系列 id |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 系列 |
| `gpt-6.1-sol-free` | OpenAI 系列 id |
| `jev-1.13-free` | Jev |

> 💡 额度和窗口由 BeatAPI 设定，可能会变化（其定价页面还提到注册赠送额度可覆盖 48 个模型，且 7 个免费模型"限时"运行）。你可以随时重新验证自己的文件：

```bash
node src/cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 免费层由 BeatAPI 设定，可能会变化。请在 [beatapi.io](https://beatapi.io) 查看实时数据 — 并让工具自身的关卡来做判断：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 43 个

使用铸造的密钥调用 `GET https://api.beatapi.io/v1/models` 会返回 **43 个模型**，其中 **7 个属于免费层**。其余 36 个在未充值账户上返回 `402 Insufficient balance` — 密钥有效，只是账户没有额度。

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**想要更多目录内容？** 给账户充值，或铸造更多账户：每个密钥都带来自己的免费模型窗口和自己的余额。

## 🧪 如何使用 API

基础 URL 是 **`https://api.beatapi.io/v1`** — 兼容 OpenAI，因此任何支持 OpenAI 的工具都能用（SDK、Cursor、OpenCode、Kilo Code 等）。

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

账户自身的计数器也是一个 OpenAI 形式的端点：

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 快速开始

```bash

# clone or fork this repository, then:
cd beatapi-bulk-apikey

# 1) your proxy list, one exit per line (http://… or socks5://…)
printf 'http://127.0.0.1:8080\n' > proxies.txt

# 2) go
node src/launcher.js                          # interactive
# or directly:
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt
```

`keys.txt` **只有**在 `GET /v1/usage` 用新密钥返回 200 后才会写入，因此其中的每一行都是通过了提供商自身 API 认证的密钥。

### 🖱️ 启动器

```bash
node src/launcher.js
```

它会询问你想要多少个密钥以及使用哪个代理列表，将答案记住在 `launcher.config.json` 中，然后用正确的标志运行工具。菜单：**1) 铸造密钥 · 2) 验证密钥 · 3) 设置 · 4) 帮助 · 5) 连接到 9Router · 6) 连接到 OmniRoute · q) 退出**。

## ✅ 已验证可用 — 每个密钥都经过测试

密钥只有在提供商自身的 API 用它返回响应后才会进入 `keys.txt`：

| 检查 | 结果 |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — 在**每个**密钥创建后立即自动运行 | **HTTP 200**，`data.object: "usage"` |
| 使用 `--verify-only` 进行整表复查（来自不同账户的密钥） | **8/8 → 200**（`PSofZD…d4Cu`、`25Mcg6…FLhU`、`FIBhQQ…3f2d`、`Due4H4…ISxD` 等） |
| 在 `-free` 模型上 `POST https://api.beatapi.io/v1/chat/completions` | **HTTP 200**，真实补全（`deepseek-v4.1-flash-free`） |
| 新账户上的付费模型 | `402 Insufficient balance` — *密钥*有效，*账户*需要额度 |

> 密钥**只显示一次**，即在创建时：面板返回掩码形式（`x9ZX**********2erY`），真实密钥只能通过 `POST /api/beat/account/keys/{id}/key` 获取。工具会立即调用该端点并将结果直接写入磁盘。

> **质量关卡。** 这里的每个密钥在写入 `keys.txt` 之前都通过了实时 `chat-200`
> （死密钥绝不会被交付）。路由器组合在模型层面遵循同样的规则：只有**当模型返回 `chat-200` 且能调用工具**时才会添加条目 —
> 不支持工具的模型、死密钥或死提供商会直接被丢弃而不是添加。随时重新运行验证步骤；
> 失败会被报告，绝不会被隐藏。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 备注 |
| --- | --- | --- |
| 邮箱 | `GET /api/verification?email=…` | 将验证码发送到 `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` 地址 |
| 注册 | `POST /api/user/register?turnstile=` | 验证码 + 密码 |
| 登录密钥 | `GET /api/user/login/encryption-key` | RSA-OAEP 密钥 id |
| 登录 | `POST /api/user/login?turnstile=` | `password_encrypted` |
| 创建密钥 | `POST /api/beat/account/keys` | 返回**掩码**密钥 |
| 显示密钥 | `POST /api/beat/account/keys/{id}/key` | 真实密钥 — 只显示一次 |
| 验证 | `GET /v1/usage` | `200` 表示密钥可用 |

**提供商侧有两点值得提前了解。** 注册地址必须是 `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` 邮箱，且点号会被忽略（`first.last@` 与 `firstlast@` 是同一地址，会返回 *"Email address is already in use"*）— 传入邮箱时请保持其无点号形式。另外 BeatAPI 会发送自己的验证邮件：一天内注册过多后它会返回 `550 You have reached your daily email sending quota`，这仅仅意味着新注册将在第二天恢复 — 你已有的密钥仍可继续使用。

## ⚙️ CLI 选项

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node src/cli.js --verify-only keys.txt    # re-check a whole list
node src/cli.js --help
```

| 选项 | 默认值 | 含义 |
| --- | --- | --- |
| `--count <n>` | `30` | 列表最终应包含多少个密钥 |
| `--out <file>` | `keys.txt` | 密钥列表，**每行一个密钥** |
| `--accounts <file>` | `<out>.accounts.json` | 账户记录（邮箱 / 用户 / 密码） |
| `--prefix <name>` | `beatapi-bulk` | 仪表板中显示的密钥名称前缀 |
| `--delay <ms>` | `16000` | 账户之间的暂停 |
| `--proxy <url>` | `$BEATAPI_PROXY` | 用于每个请求的单个 HTTP(S)/SOCKS 代理 |
| `--proxy-file <f>` | — | 每行一个代理，**按账户轮换** |
| `--no-verify` | 关闭 | 跳过 `GET /v1/usage` 检查（不推荐） |
| `--verify-only <f>` | — | 复查列表中的每个密钥并退出 |
| `-h, --help` | | 用法 |

`--out` 中已存在的密钥会计入 `--count`，因此重新运行只会添加缺失的部分。

## 🛰️ 在代理后面

**在运行前放置一个出口。** 每个密钥一个账户意味着每个密钥一次注册，而 BeatAPI 会按地址限制注册速率（实测：*20 请求 / 20 分钟*）— 轮换代理列表能让每个账户干净地运行，当限制仍然触发时，工具会等待 `429 … retry_after_seconds` 而不是浪费账户。

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node src/cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 已验证的密钥，每行一个 — 已被 git 忽略，绝不提交 |
| `keys.accounts.json` | 账户记录（邮箱 / 用户 / 密码）— 已被 git 忽略 |
| `proxies.txt` | 你的出口池，每行一个代理 — 已被 git 忽略 |
| `launcher.config.json` | 启动器记住的内容 — 已被 git 忽略 |
| `src/cli.js` · `src/launcher.js` · `src/proxy.js` | 铸造工具、交互式菜单和代理轮换 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管的、兼容 OpenAI 的路由器。BeatAPI 在 `https://api.beatapi.io/v1` 提供纯 OpenAI 服务，因此连接器会注册**一个 `openai-compatible` 提供商节点**（前缀 `beatapi`），并将 `keys.txt` 中的每个密钥附加为一个连接 — `beatapi-001`、`beatapi-002` 等。重新运行它是幂等的。

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "BeatAPI"`、`--prefix beatapi`、`--base-url https://api.beatapi.io/v1`、`--model deepseek-v4.1-flash-free`。模型随后以 `beatapi/<model id>` 形式提供 — `beatapi/deepseek-v4.1-flash-free`、`beatapi/gemini-3.8-flash-free`、`beatapi/glm-5.3-free`、`beatapi/gpt-6.1-sol-free` — 在所有连接之间负载均衡：

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管的、兼容 OpenAI 的路由器。连接器在那里做同样的工作 — 一个 `openai-compatible` 节点（前缀 `beatapi`），`keys.txt` 中每个密钥一个连接：

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

默认值：`--base http://localhost:20128`、`--password 123456`、`--name "BeatAPI"`、`--prefix beatapi`、`--base-url https://api.beatapi.io/v1`、`--model deepseek-v4.1-flash-free`。

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 提供商提供什么 | 每个密钥一个全新账户 — 43 个模型，其中 7 个为免费层，每个密钥都在提供商自身的 API 上验证过 |
| 🔑 一个密钥能给你什么 | 一个作用域为其自身账户的 API 密钥：下方端点上的 43 个模型 id，受你套餐的限制。配额存在于**账户**上，这正是本工具为每个密钥创建一个账户的原因 |
| 🌐 API 形式 | 兼容 OpenAI：`POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 你的数据 | 仅联系 beatapi.io 和你配置的收件箱后端；密钥保留在你的机器上 |

## 🐞 问题

BeatAPI 那边有变化（端点、邮件规则、限制）？请**[提交 issue](../../issues)**，附上你运行的命令和确切的错误文本。欢迎 PR。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>