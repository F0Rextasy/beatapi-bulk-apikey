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

**自動生成された API キーで BeatAPI アカウントを一括作成 — OpenAI 互換の推論（43 モデル、うち 7 つが無料枠）+ 9Router 対応エンドポイント。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-43-of-them) · [🧪 API の使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 イシュー](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 無料枠 — どれだけ使えるか

**新しい BeatAPI アカウントにはすべて 7 つの `-free` モデルが付与されます — カード不要。有料モデルを使うには、同じアカウントにクレジットが必要です。**

| 項目 | 値 |
| --- | --- |
| 無料枠モデル | 一覧にある 43 の id のうち **7 つ**が、資金未投入の新品アカウントでも応答します |
| 無料モデルの制限（実測） | **無料モデルごとに 1 ウィンドウあたり 1 回の成功リクエスト** — 次の呼び出しは `429 this model allows at most 1 successful requests …` を返します |
| 有料モデル | アカウントにチャージするまで `402 Insufficient balance` を返します |
| カード要否 | 登録に **不要** |
| 登録用メールボックス | `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` のみ — ドットは無視されます（`first.last@` は `firstlast@` と同じアドレス） |
| スケールする単位 | **1 アカウント = 1 キー** → `--count N` で N 個のアカウントを取得し、それぞれが独自の無料モデルウィンドウと独自のクレジット残高を持ちます |

**無料枠モデルの id**

| モデル | 備考 |
| --- | --- |
| `deepseek-v4.1-flash-free` | ここでのライブ検証に使用したモデル |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | ゲートウェイが提供する Google 系の id |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 ファミリー |
| `gpt-6.1-sol-free` | OpenAI 系の id |
| `jev-1.13-free` | Jev |

> 💡 付与量やウィンドウは BeatAPI が設定するもので、変更される可能性があります（同社の料金ページには、登録クレジットで 48 モデルに到達できること、7 つの無料モデルが「期間限定」で提供されていることも記載されています）。ご自身のファイルはいつでも再検証できます:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 無料枠は BeatAPI が設定するもので、変更される可能性があります。最新の数値は [beatapi.io](https://beatapi.io) で確認してください — そしてツール自身のゲートに判断を任せてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全 43 個

発行済みのキーで `GET https://api.beatapi.io/v1/models` を呼び出すと **43 モデル**が返り、そのうち **7 つが無料枠**です。残りの 36 は資金未投入のアカウントでは `402 Insufficient balance` を返します — キーは有効ですが、アカウントにクレジットがありません。

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**カタログをもっと使いたい？** アカウントにクレジットを追加するか、アカウントをさらに発行してください。各キーが独自の無料モデルウィンドウと独自の残高を持ちます。

## 🧪 API の使い方

ベース URL は **`https://api.beatapi.io/v1`** です — OpenAI 互換なので、OpenAI を扱えるものなら何でも動作します（SDK、Cursor、OpenCode、Kilo Code など）。

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

アカウント自身のカウンターも OpenAI 形式のエンドポイントです:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 クイックスタート

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

`keys.txt` は、新しいキーで `GET /v1/usage` が 200 を返した**後にのみ**書き込まれるため、その中のすべての行はプロバイダー自身の API で認証に成功したキーです。

### 🖱️ ランチャー

```bash
node launcher.js
```

キーの数、出力ファイル、キー名のプレフィックス、アカウント間の一時停止、およびオプションのプロキシ / プロキシリストを尋ね、回答を `launcher.config.json` に記憶してからツールを実行します。メニュー: **1) Mint keys · 2) Verify keys · 3) Settings · 4) Help · q) Quit**。

## ✅ 検証済みで動作 — すべてのキーがテストされています

キーが `keys.txt` に到達するのは、プロバイダー自身の API がそのキーで応答した後だけです:

| チェック | 結果 |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — **すべての**キーに対して作成直後に自動実行 | **HTTP 200**、`data.object: "usage"` |
| `--verify-only` によるリスト全体の再チェック（別々のアカウントのキー） | **8/8 → 200**（`PSofZD…d4Cu`、`25Mcg6…FLhU`、`FIBhQQ…3f2d`、`Due4H4…ISxD`、…） |
| `-free` モデルに対する `POST https://api.beatapi.io/v1/chat/completions` | **HTTP 200**、実際の補完（`deepseek-v4.1-flash-free`） |
| 新品アカウントでの有料モデル | `402 Insufficient balance` — *キー*は有効で、*アカウント*にクレジットが必要 |

> キーは作成時に**一度だけ**表示されます: パネルはマスクされた形式（`x9ZX**********2erY`）で応答し、実際のキーは `POST /api/beat/account/keys/{id}/key` からのみ取得できます。ツールはそのエンドポイントを即座に呼び出し、結果を直接ディスクに書き込みます。

> **品質ゲート。** ここにあるすべてのキーは、`keys.txt` に書き込まれる前にライブの `chat-200` を通過しています
> （死んだキーは決して出荷されません）。ルーターのコンボもモデルレベルで同じルールに従います: エントリが
> 追加されるのは、**モデルが `chat-200` を返し、かつツールを呼び出せる場合のみ**です — ツールをサポートしないモデル、
> 死んだキー、死んだプロバイダーは追加されずに除外されます。検証ステップはいつでも再実行できます。
> 失敗は報告され、決して隠されません。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| メールボックス | `GET /api/verification?email=…` | コードを `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` のアドレスに送信します |
| 登録 | `POST /api/user/register?turnstile=` | コード + パスワード |
| ログインキー | `GET /api/user/login/encryption-key` | RSA-OAEP キー id |
| ログイン | `POST /api/user/login?turnstile=` | `password_encrypted` |
| キー作成 | `POST /api/beat/account/keys` | **マスクされた**キーを返します |
| キー表示 | `POST /api/beat/account/keys/{id}/key` | 実際のキー — 一度だけ表示されます |
| 証明 | `GET /v1/usage` | `200` はキーが有効であることを意味します |

**事前に知っておく価値のあるプロバイダー側の注意点が 2 つあります。** 登録アドレスは `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` のメールボックスである必要があり、ドットは無視されます（`first.last@` は `firstlast@` と同じアドレスで、*"Email address is already in use"* を返します）— メールボックスを渡す際はドットなしの形式を使用してください。また、BeatAPI は独自の確認メールを送信します: 1 日に大量の登録を行うと `550 You have reached your daily email sending quota` を返しますが、これは単に新規登録が翌日に再開されることを意味するだけです — すでに持っているキーは引き続き動作します。

## ⚙️ CLI オプション

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| オプション | デフォルト | 意味 |
| --- | --- | --- |
| `--count <n>` | `30` | リストが最終的に持つべきキーの数 |
| `--out <file>` | `keys.txt` | キーリスト、**1 行に 1 キー** |
| `--accounts <file>` | `<out>.accounts.json` | アカウント記録（メールボックス / ユーザー / パスワード） |
| `--prefix <name>` | `beatapi-bulk` | ダッシュボードに表示されるキー名のプレフィックス |
| `--delay <ms>` | `16000` | アカウント間の一時停止 |
| `--proxy <url>` | `$BEATAPI_PROXY` | すべてのリクエストに対する単一の HTTP(S)/SOCKS プロキシ |
| `--proxy-file <f>` | — | 1 行に 1 プロキシ、**アカウントごとにローテーション** |
| `--no-verify` | off | `GET /v1/usage` チェックをスキップ（非推奨） |
| `--verify-only <f>` | — | リスト内のすべてのキーを再チェックして終了 |
| `-h, --help` | | 使用方法 |

`--out` にすでに存在するキーは `--count` にカウントされるため、再実行すると不足分だけが追加されます。

## 🛰️ プロキシの背後で

**実行の前に出口を用意してください。** 1 キーにつき 1 アカウントということは、1 キーにつき 1 回の登録を意味し、BeatAPI はアドレスごとに登録をレート制限します（実測: *20 リクエスト / 20 分*）— プロキシリストをローテーションすればすべてのアカウントがクリーンに実行でき、制限に引っかかった場合でもツールはアカウントを無駄にせず `429 … retry_after_seconds` を待ちます。

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 検証済みのキー、1 行に 1 つ — git で無視され、決してコミットされません |
| `keys.accounts.json` | アカウント記録（メールボックス / ユーザー / パスワード）— git で無視されます |
| `proxies.txt` | 出口プール、1 行に 1 プロキシ — git で無視されます |
| `launcher.config.json` | ランチャーが記憶する内容 — git で無視されます |
| `cli.js` · `launcher.js` · `proxy.js` | 発行ツール、インタラクティブメニュー、プロキシローテーション |

## 🔌 9Router に接続

[9Router](https://9router.com) はセルフホスト型の OpenAI 互換ルーターです。BeatAPI は `https://api.beatapi.io/v1` でプレーンな OpenAI を提供するため、コネクターは **1 つの `openai-compatible` プロバイダーノード**（プレフィックス `beatapi`）を登録し、`keys.txt` 内のすべてのキーを接続としてアタッチします — `beatapi-001`、`beatapi-002`、… 再実行しても冪等です。

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "BeatAPI"`、`--prefix beatapi`、`--base-url https://api.beatapi.io/v1`、`--model deepseek-v4.1-flash-free`。モデルは `beatapi/<model id>` として提供されます — `beatapi/deepseek-v4.1-flash-free`、`beatapi/gemini-3.8-flash-free`、`beatapi/glm-5.3-free`、`beatapi/gpt-6.1-sol-free` — すべての接続にわたってロードバランスされます:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute に接続

[OmniRoute](https://omniroute.online) はセルフホスト型の OpenAI 互換ルーターです。コネクターはそこで同じ役割を果たします — 1 つの `openai-compatible` ノード（プレフィックス `beatapi`）、`keys.txt` 内のキーごとに 1 つの接続:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

デフォルト: `--base http://localhost:20128`、`--password 123456`、`--name "BeatAPI"`、`--prefix beatapi`、`--base-url https://api.beatapi.io/v1`、`--model deepseek-v4.1-flash-free`。

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 1 つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 プロバイダーが提供するもの | キーごとに 1 つの新品アカウント — 43 モデル、うち 7 つが無料枠、すべてのキーがプロバイダー自身の API で証明済み |
| 🔑 1 つのキーで得られるもの | 独自のアカウントにスコープされた 1 つの API キー: 以下のエンドポイントで 43 のモデル id を、プランの制限内で利用できます。クォータは**アカウント**に紐づくため、このツールがキーごとに 1 アカウントを作成するのです |
| 🌐 API 形式 | OpenAI 互換: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 あなたのデータ | 接続されるのは beatapi.io と設定した受信トレイバックエンドのみで、キーはあなたのマシン上に留まります |

## 🐞 イシュー

BeatAPI 側で何かが変わりましたか（エンドポイント、メールのルール、制限）？ 実行したコマンドと正確なエラーテキストを添えて **[イシューを開いてください](../../issues)**。PR も歓迎します。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE) を参照してください。

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>