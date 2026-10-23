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

**Массовое создание аккаунтов BeatAPI с автоматически сгенерированными API-ключами — инференс, совместимый с OpenAI (43 модели, 7 бесплатных) + endpoint, готовый для 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-43-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Бесплатный тариф — сколько вы получаете

**Каждый новый аккаунт BeatAPI получает 7 моделей `-free` — без карты; для платных моделей нужны кредиты на том же аккаунте.**

| Что | Значение |
| --- | --- |
| Модели бесплатного тарифа | **7 из 43** перечисленных id отвечают на совершенно новом аккаунте без пополнения |
| Лимит бесплатной модели (измерено) | **один успешный запрос на бесплатную модель за окно** — следующий вызов отвечает `429 this model allows at most 1 successful requests …` |
| Платные модели | отвечают `402 Insufficient balance`, пока вы не пополните аккаунт |
| Требуется карта | **Нет** для регистрации |
| Почтовый ящик для регистрации | только `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — и точки игнорируются (`first.last@` — тот же адрес, что и `firstlast@`) |
| Единица масштабирования | **один аккаунт = один ключ** → `--count N` даёт вам N аккаунтов, каждый со своим окном бесплатных моделей и своим балансом кредитов |

**Id моделей бесплатного тарифа**

| Модель | Примечания |
| --- | --- |
| `deepseek-v4.1-flash-free` | модель, использованная для живой проверки здесь |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | id семейства Google, обслуживаемый шлюзом |
| `glm-5.3-free`, `glm-5.3-flash-free` | семейство GLM 5.3 |
| `gpt-6.1-sol-free` | id семейства OpenAI |
| `jev-1.13-free` | Jev |

> 💡 Суммы и окна устанавливаются BeatAPI и могут меняться (на его странице цен также упоминается приветственный кредит, открывающий доступ к 48 моделям, и что 7 бесплатных моделей работают «ограниченное время»). Перепроверьте свой файл в любой момент:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 Бесплатный тариф устанавливается BeatAPI и может меняться. Проверяйте актуальные цифры на [beatapi.io](https://beatapi.io) — и позвольте собственному гейту инструмента решить:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 43

`GET https://api.beatapi.io/v1/models` с созданным ключом возвращает **43 модели**, **7 из которых входят в бесплатный тариф**. Остальные 36 отвечают `402 Insufficient balance` на аккаунте без пополнения — ключ действителен, но на аккаунте нет кредитов.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Хотите больше из каталога?** Пополните аккаунт или создайте больше аккаунтов: каждый ключ приносит своё окно бесплатных моделей и свой баланс.

## 🧪 Как использовать API

Базовый URL — **`https://api.beatapi.io/v1`** — совместим с OpenAI, поэтому работает всё, что говорит на языке OpenAI (SDK, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Собственные счётчики аккаунта — тоже endpoint в форме OpenAI:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Быстрый старт

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

`keys.txt` записывается **только** после того, как `GET /v1/usage` ответит 200 с новым ключом, поэтому каждая строка в нём — это ключ, который прошёл аутентификацию на собственном API провайдера.

### 🖱️ Лаунчер

```bash
node launcher.js
```

Он спрашивает, сколько ключей вы хотите, файл вывода, префикс имени ключа, паузу между аккаунтами и необязательный прокси / список прокси, запоминает ответы в `launcher.config.json`, а затем запускает инструмент. Меню: **1) Создать ключи · 2) Проверить ключи · 3) Настройки · 4) Справка · q) Выход**.

## ✅ Проверено в работе — каждый ключ протестирован

Ключ попадает в `keys.txt` только после того, как собственный API провайдера ответит с ним:

| Проверка | Результат |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — выполняется автоматически для **каждого** ключа сразу после создания | **HTTP 200**, `data.object: "usage"` |
| Перепроверка всего списка с `--verify-only` (ключи из разных аккаунтов) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` на модели `-free` | **HTTP 200**, реальное завершение (`deepseek-v4.1-flash-free`) |
| Платная модель на свежем аккаунте | `402 Insufficient balance` — *ключ* действителен, *аккаунту* нужны кредиты |

> Ключ показывается **один раз**, при создании: панель отвечает маскированной формой (`x9ZX**********2erY`), а настоящий ключ приходит только из `POST /api/beat/account/keys/{id}/key`. Инструмент вызывает этот endpoint немедленно и записывает результат прямо на диск.

> **Контроль качества.** Каждый ключ здесь прошёл живой `chat-200` прежде чем был записан в `keys.txt`
> (мёртвые ключи никогда не поставляются). Комбинации роутера следуют тому же правилу на уровне модели: запись
> добавляется **только если модель отвечает `chat-200` и умеет вызывать инструменты** — модель без поддержки инструментов,
> мёртвый ключ или мёртвый провайдер отбрасывается, а не добавляется. Перезапускайте шаг проверки в любой момент;
> сбои сообщаются, но никогда не скрываются.

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| почтовый ящик | `GET /api/verification?email=…` | отправляет код на адрес `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` |
| регистрация | `POST /api/user/register?turnstile=` | код + пароль |
| ключ входа | `GET /api/user/login/encryption-key` | id ключа RSA-OAEP |
| вход | `POST /api/user/login?turnstile=` | `password_encrypted` |
| создание ключа | `POST /api/beat/account/keys` | возвращает **маскированный** ключ |
| раскрытие ключа | `POST /api/beat/account/keys/{id}/key` | настоящий ключ — показывается один раз |
| проверка | `GET /v1/usage` | `200` означает, что ключ живой |

**Две заметки со стороны провайдера, которые стоит знать заранее.** Адрес регистрации должен быть почтовым ящиком `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`, и точки игнорируются (`first.last@` — тот же адрес, что и `firstlast@`, что отвечает *"Email address is already in use"*) — передавайте ящик и придерживайтесь его формы без точек. И BeatAPI отправляет собственную верификационную почту: после множества регистраций за один день он отвечает `550 You have reached your daily email sending quota`, что просто означает, что новые регистрации возобновятся на следующий день — ключи, которые у вас уже есть, продолжают работать.

## ⚙️ Опции CLI

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| Опция | По умолчанию | Значение |
| --- | --- | --- |
| `--count <n>` | `30` | сколько ключей должно оказаться в списке в итоге |
| `--out <file>` | `keys.txt` | список ключей, **один ключ на строку** |
| `--accounts <file>` | `<out>.accounts.json` | записи аккаунтов (почтовый ящик / пользователь / пароль) |
| `--prefix <name>` | `beatapi-bulk` | префикс имени ключа, отображаемый в панели |
| `--delay <ms>` | `16000` | пауза между аккаунтами |
| `--proxy <url>` | `$BEATAPI_PROXY` | единый HTTP(S)/SOCKS прокси для каждого запроса |
| `--proxy-file <f>` | — | один прокси на строку, **ротируется для каждого аккаунта** |
| `--no-verify` | выкл. | пропустить проверку `GET /v1/usage` (не рекомендуется) |
| `--verify-only <f>` | — | перепроверить каждый ключ в списке и выйти |
| `-h, --help` | | справка |

Ключи, уже присутствующие в `--out`, учитываются в `--count`, поэтому повторный запуск добавляет только недостающее.

## 🛰️ За прокси

**Поставьте выход перед запуском.** Один аккаунт на ключ означает одну регистрацию на ключ, а BeatAPI ограничивает регистрации по адресу (измерено: *20 запросов / 20 минут*) — ротация списка прокси даёт каждому аккаунту чистый запуск, а инструмент пережидает `429 … retry_after_seconds` вместо того, чтобы сжечь аккаунт, когда лимит всё же срабатывает.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | проверенные ключи, по одному на строку — игнорируется git, никогда не коммитится |
| `keys.accounts.json` | записи аккаунтов (почтовый ящик / пользователь / пароль) — игнорируется git |
| `proxies.txt` | ваш пул выходов, один прокси на строку — игнорируется git |
| `launcher.config.json` | то, что запоминает лаунчер — игнорируется git |
| `cli.js` · `launcher.js` · `proxy.js` | инструмент создания, интерактивное меню и ротация прокси |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI. BeatAPI обслуживает обычный OpenAI на `https://api.beatapi.io/v1`, поэтому коннектор регистрирует **один узел-провайдер `openai-compatible`** (префикс `beatapi`) и прикрепляет каждый ключ из `keys.txt` как соединение — `beatapi-001`, `beatapi-002`, … Повторный запуск идемпотентен.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Затем модели обслуживаются как `beatapi/<model id>` — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — с балансировкой нагрузки по каждому соединению:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Подключение к OmniRoute

[OmniRoute](https://omniroute.online) — это самостоятельно размещаемый роутер, совместимый с OpenAI. Коннектор выполняет ту же работу там — один узел `openai-compatible` (префикс `beatapi`), одно соединение на каждый ключ в `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

По умолчанию: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 Что даёт провайдер | один свежий аккаунт на ключ — 43 модели, 7 из них бесплатного тарифа, каждый ключ проверен на собственном API провайдера |
| 🔑 Что даёт один ключ | один API-ключ, привязанный к своему аккаунту: 43 id моделей на endpoint ниже, в пределах лимитов вашего тарифа. Квота живёт на **аккаунте**, именно поэтому этот инструмент создаёт один аккаунт на ключ |
| 🌐 Форма API | совместим с OpenAI: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Ваши данные | связь только с beatapi.io и настроенным вами бэкендом почтового ящика; ключи остаются на вашей машине |

## 🐞 Проблемы

Что-то изменилось на стороне BeatAPI (endpoint, правила e-mail, лимиты)? **[Откройте issue](../../issues)** с командой, которую вы запустили, и точным текстом ошибки. PR приветствуются.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>