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

**자동 생성된 API 키로 BeatAPI 계정을 대량 생성 — OpenAI 호환 추론(43개 모델, 7개 무료 티어) + 9Router 지원 엔드포인트.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-43-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 무료 티어 — 얼마나 받을 수 있나

**모든 신규 BeatAPI 계정은 7개의 `-free` 모델을 받습니다 — 카드 불필요; 유료 모델은 같은 계정에 크레딧이 필요합니다.**

| 항목 | 값 |
| --- | --- |
| 무료 티어 모델 | 나열된 43개 id 중 **7개**가 자금이 없는 새 계정에서 응답합니다 |
| 무료 모델 제한 (측정됨) | **무료 모델당 윈도우마다 성공 요청 1회** — 다음 호출은 `429 this model allows at most 1 successful requests …`로 응답합니다 |
| 유료 모델 | 계정에 충전하기 전까지 `402 Insufficient balance`로 응답합니다 |
| 카드 필요 여부 | 등록에는 **불필요** |
| 가입 메일함 | `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`만 — 점은 무시됩니다 (`first.last@`는 `firstlast@`와 같은 주소) |
| 확장되는 단위 | **계정 하나 = 키 하나** → `--count N`은 N개의 계정을 만들고, 각각 자체 무료 모델 윈도우와 자체 크레딧 잔액을 가집니다 |

**무료 티어 모델 id**

| 모델 | 비고 |
| --- | --- |
| `deepseek-v4.1-flash-free` | 여기서 실시간 검증에 사용된 모델 |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | 게이트웨이가 제공하는 Google 계열 id |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 계열 |
| `gpt-6.1-sol-free` | OpenAI 계열 id |
| `jev-1.13-free` | Jev |

> 💡 금액과 윈도우는 BeatAPI가 설정하며 변경될 수 있습니다 (가격 페이지에는 48개 모델에 도달하는 가입 크레딧과 7개 무료 모델이 "제한된 기간 동안" 운영된다고 명시되어 있습니다). 언제든지 자신의 파일을 다시 검증하세요:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 무료 티어는 BeatAPI가 설정하며 변경될 수 있습니다. 실시간 수치는 [beatapi.io](https://beatapi.io)에서 확인하세요 — 그리고 도구 자체의 게이트가 판단하도록 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 43개 전부

발급된 키로 `GET https://api.beatapi.io/v1/models`를 호출하면 **43개 모델**이 반환되며, **그중 7개가 무료 티어**입니다. 나머지 36개는 자금이 없는 계정에서 `402 Insufficient balance`로 응답합니다 — 키는 유효하지만 계정에 크레딧이 없습니다.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**카탈로그를 더 원하시나요?** 계정에 크레딧을 충전하거나, 계정을 더 발급하세요: 모든 키는 자체 무료 모델 윈도우와 자체 잔액을 가져옵니다.

## 🧪 API 사용 방법

베이스 URL은 **`https://api.beatapi.io/v1`** 입니다 — OpenAI 호환이므로 OpenAI를 지원하는 모든 것(SDK, Cursor, OpenCode, Kilo Code, …)이 작동합니다.

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

계정 자체의 카운터도 OpenAI 형태의 엔드포인트입니다:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 빠른 시작

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

`keys.txt`는 새 키로 `GET /v1/usage`가 200을 응답한 **후에만** 작성되므로, 그 안의 모든 줄은 제공자의 자체 API로 인증된 키입니다.

### 🖱️ 런처

```bash
node launcher.js
```

원하는 키 개수, 출력 파일, 키 이름 접두사, 계정 간 일시정지, 선택적 프록시 / 프록시 목록을 묻고, 답변을 `launcher.config.json`에 기억한 다음 도구를 실행합니다. 메뉴: **1) 키 발급 · 2) 키 검증 · 3) 설정 · 4) 도움말 · q) 종료**.

## ✅ 검증된 작동 — 모든 키가 테스트됩니다

키는 제공자의 자체 API가 그 키로 응답한 후에만 `keys.txt`에 도달합니다:

| 검사 | 결과 |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — 생성 직후 **모든** 키에 대해 자동 실행 | **HTTP 200**, `data.object: "usage"` |
| `--verify-only`로 전체 목록 재검사 (별도 계정의 키들) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `-free` 모델에 대한 `POST https://api.beatapi.io/v1/chat/completions` | **HTTP 200**, 실제 완성 (`deepseek-v4.1-flash-free`) |
| 새 계정의 유료 모델 | `402 Insufficient balance` — *키*는 유효하지만 *계정*에 크레딧이 필요합니다 |

> 키는 생성 시 **한 번만** 표시됩니다: 패널은 마스킹된 형태(`x9ZX**********2erY`)로 응답하며 실제 키는 `POST /api/beat/account/keys/{id}/key`에서만 나옵니다. 도구는 그 엔드포인트를 즉시 호출하고 결과를 곧바로 디스크에 기록합니다.

> **품질 게이트.** 여기의 모든 키는 `keys.txt`에 기록되기 전에 실시간 `chat-200`을 통과했습니다
> (죽은 키는 절대 배포되지 않습니다). 라우터 콤보도 모델 수준에서 같은 규칙을 따릅니다: 항목은
> **모델이 `chat-200`으로 응답하고 도구를 호출할 수 있는 경우에만** 추가됩니다 — 도구 지원이 없는 모델,
> 죽은 키 또는 죽은 제공자는 추가되지 않고 제거됩니다. 언제든지 검증 단계를 다시 실행하세요;
> 실패는 보고되며 절대 숨겨지지 않습니다.

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 메일함 | `GET /api/verification?email=…` | `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` 주소로 코드를 메일로 보냅니다 |
| 등록 | `POST /api/user/register?turnstile=` | 코드 + 비밀번호 |
| 로그인 키 | `GET /api/user/login/encryption-key` | RSA-OAEP 키 id |
| 로그인 | `POST /api/user/login?turnstile=` | `password_encrypted` |
| 키 생성 | `POST /api/beat/account/keys` | **마스킹된** 키를 반환합니다 |
| 키 공개 | `POST /api/beat/account/keys/{id}/key` | 실제 키 — 한 번만 표시됩니다 |
| 검증 | `GET /v1/usage` | `200`은 키가 살아 있음을 의미합니다 |

**미리 알아두면 좋은 제공자 측 참고 사항 두 가지.** 등록 주소는 `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` 메일함이어야 하며, 점은 무시됩니다 (`first.last@`는 `firstlast@`와 같은 주소이며 *"Email address is already in use"*로 응답합니다) — 메일함을 전달하고 점 없는 형태를 유지하세요. 그리고 BeatAPI는 자체 검증 메일을 보냅니다: 하루에 가입이 많으면 `550 You have reached your daily email sending quota`로 응답하는데, 이는 단순히 신규 가입이 다음 날 재개된다는 의미입니다 — 이미 가진 키는 계속 작동합니다.

## ⚙️ CLI 옵션

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| 옵션 | 기본값 | 의미 |
| --- | --- | --- |
| `--count <n>` | `30` | 목록이 최종적으로 가져야 할 키 개수 |
| `--out <file>` | `keys.txt` | 키 목록, **한 줄에 키 하나** |
| `--accounts <file>` | `<out>.accounts.json` | 계정 기록 (메일함 / 사용자 / 비밀번호) |
| `--prefix <name>` | `beatapi-bulk` | 대시보드에 표시되는 키 이름 접두사 |
| `--delay <ms>` | `16000` | 계정 간 일시정지 |
| `--proxy <url>` | `$BEATAPI_PROXY` | 모든 요청에 사용할 단일 HTTP(S)/SOCKS 프록시 |
| `--proxy-file <f>` | — | 한 줄에 프록시 하나, **계정마다 순환** |
| `--no-verify` | off | `GET /v1/usage` 검사 건너뛰기 (권장하지 않음) |
| `--verify-only <f>` | — | 목록의 모든 키를 재검사하고 종료 |
| `-h, --help` | | 사용법 |

`--out`에 이미 있는 키는 `--count`에 포함되므로, 재실행 시 누락된 것만 추가됩니다.

## 🛰️ 프록시 뒤에서

**실행 앞에 출구를 두세요.** 키 하나당 계정 하나는 키 하나당 등록 하나를 의미하며, BeatAPI는 주소당 등록을 속도 제한합니다 (측정됨: *20 requests / 20 minutes*) — 프록시 목록을 순환하면 모든 계정이 깨끗하게 실행되고, 제한이 여전히 걸릴 때 도구는 계정을 태우는 대신 `429 … retry_after_seconds`를 기다립니다.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 검증된 키, 한 줄에 하나 — git-ignored, 절대 커밋되지 않음 |
| `keys.accounts.json` | 계정 기록 (메일함 / 사용자 / 비밀번호) — git-ignored |
| `proxies.txt` | 출구 풀, 한 줄에 프록시 하나 — git-ignored |
| `launcher.config.json` | 런처가 기억하는 내용 — git-ignored |
| `cli.js` · `launcher.js` · `proxy.js` | 발급 도구, 대화형 메뉴, 프록시 순환 |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다. BeatAPI는 `https://api.beatapi.io/v1`에서 일반 OpenAI를 제공하므로, 커넥터는 **하나의 `openai-compatible` 제공자 노드**(접두사 `beatapi`)를 등록하고 `keys.txt`의 모든 키를 연결로 붙입니다 — `beatapi-001`, `beatapi-002`, … 재실행은 멱등적입니다.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. 모델은 `beatapi/<model id>`로 제공됩니다 — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — 모든 연결에 걸쳐 로드 밸런싱됩니다:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다. 커넥터는 거기서도 같은 작업을 합니다 — 하나의 `openai-compatible` 노드(접두사 `beatapi`), `keys.txt`의 키마다 하나의 연결:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

기본값: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 키 하나로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 제공자가 주는 것 | 키마다 새 계정 하나 — 43개 모델, 그중 7개가 무료 티어, 모든 키가 제공자의 자체 API에서 검증됨 |
| 🔑 키 하나로 얻는 것 | 자체 계정에 범위가 지정된 API 키 하나: 아래 엔드포인트의 43개 모델 id, 플랜의 한도 내에서. 할당량은 **계정**에 있으므로, 이 도구가 키마다 계정 하나를 만드는 것입니다 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 데이터 | beatapi.io와 구성한 메일함 백엔드만 접속됩니다; 키는 사용자 컴퓨터에 남습니다 |

## 🐞 이슈

BeatAPI 측에서 무언가 바뀌었나요 (엔드포인트, 이메일 규칙, 한도)? 실행한 명령과 정확한 오류 텍스트를 포함하여 **[이슈를 열어주세요](../../issues)**. PR 환영합니다.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>