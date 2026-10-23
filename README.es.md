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

**Crea cuentas de BeatAPI en masa con claves API autogeneradas — inferencia compatible con OpenAI (43 modelos, 7 de nivel gratuito) + endpoint listo para 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-43-of-them) · [🧪 Usa la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Nivel gratuito — cuánto obtienes

**Cada cuenta nueva de BeatAPI obtiene los 7 modelos `-free` — sin tarjeta; los modelos de pago necesitan créditos en esa misma cuenta.**

| Qué | Valor |
| --- | --- |
| Modelos de nivel gratuito | **7 de los 43** ids listados responden en una cuenta nueva y sin fondos |
| Límite de modelos gratuitos (medido) | **una solicitud exitosa por modelo gratuito por ventana** — la siguiente llamada responde `429 this model allows at most 1 successful requests …` |
| Modelos de pago | responden `402 Insufficient balance` hasta que recargues la cuenta |
| Tarjeta requerida | **No** para registrarse |
| Buzón de registro | solo `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — y los puntos se ignoran (`first.last@` es la misma dirección que `firstlast@`) |
| La unidad que escala | **una cuenta = una clave** → `--count N` te da N cuentas, cada una con su propia ventana de modelos gratuitos y su propio saldo de créditos |

**Los ids de modelos del nivel gratuito**

| Modelo | Notas |
| --- | --- |
| `deepseek-v4.1-flash-free` | el modelo usado para la verificación en vivo aquí |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | id de la familia Google servido por el gateway |
| `glm-5.3-free`, `glm-5.3-flash-free` | familia GLM 5.3 |
| `gpt-6.1-sol-free` | id de la familia OpenAI |
| `jev-1.13-free` | Jev |

> 💡 Los montos y las ventanas los define BeatAPI y pueden cambiar (su página de precios también menciona un crédito de registro que alcanza 48 modelos, y los 7 modelos gratuitos funcionando "por tiempo limitado"). Vuelve a comprobar tu propio archivo en cualquier momento:

```bash
node src/cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 El nivel gratuito lo define BeatAPI y puede cambiar. Consulta los números en vivo en [beatapi.io](https://beatapi.io) — y deja que la propia puerta de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 43

`GET https://api.beatapi.io/v1/models` con una clave generada devuelve **43 modelos**, **7 de los cuales están en el nivel gratuito**. Los 36 restantes responden `402 Insufficient balance` en una cuenta sin fondos — la clave es válida, la cuenta no tiene créditos.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**¿Quieres más del catálogo?** Recarga la cuenta, o crea más cuentas: cada clave trae su propia ventana de modelos gratuitos y su propio saldo.

## 🧪 Cómo usar la API

La URL base es **`https://api.beatapi.io/v1`** — compatible con OpenAI, así que cualquier cosa que hable OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Los propios contadores de la cuenta también son un endpoint con forma de OpenAI:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Inicio rápido

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

`keys.txt` se escribe **solo** después de que `GET /v1/usage` responda 200 con la nueva clave, así que cada línea es una clave que se autenticó contra la propia API del proveedor.

### 🖱️ El lanzador

```bash
node src/launcher.js
```

Pregunta cuántas claves quieres y qué lista de proxies usar, recuerda las respuestas en `launcher.config.json` y luego ejecuta la herramienta con los flags correctos. Menú: **1) Crear claves · 2) Verificar claves · 3) Ajustes · 4) Ayuda · 5) Conectar con 9Router · 6) Conectar con OmniRoute · q) Salir**.

## ✅ Verificado y funcionando — cada clave se prueba

Una clave llega a `keys.txt` solo después de que la propia API del proveedor responda con ella:

| Comprobación | Resultado |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — se ejecuta automáticamente para **cada** clave justo después de crearla | **HTTP 200**, `data.object: "usage"` |
| Revisión de toda la lista con `--verify-only` (claves de cuentas distintas) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` en un modelo `-free` | **HTTP 200**, finalización real (`deepseek-v4.1-flash-free`) |
| Modelo de pago en una cuenta nueva | `402 Insufficient balance` — la *clave* es válida, la *cuenta* necesita créditos |

> Una clave se muestra **una sola vez**, al crearla: el panel responde con la forma enmascarada (`x9ZX**********2erY`) y la clave real solo proviene de `POST /api/beat/account/keys/{id}/key`. La herramienta llama a ese endpoint de inmediato y escribe el resultado directamente en disco.

> **Controles de calidad.** Cada clave aquí pasó un `chat-200` en vivo antes de escribirse en `keys.txt`
> (las claves muertas nunca se entregan). Las combinaciones del router siguen la misma regla a nivel de modelo: una entrada se
> añade **solo si el modelo responde `chat-200` y puede llamar a herramientas** — un modelo sin soporte de herramientas,
> una clave muerta o un proveedor muerto se descarta en lugar de añadirse. Vuelve a ejecutar el paso de verificación en cualquier momento;
> los fallos se reportan, nunca se ocultan.

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| buzón | `GET /api/verification?email=…` | envía el código a una dirección `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` |
| registro | `POST /api/user/register?turnstile=` | código + contraseña |
| clave de inicio de sesión | `GET /api/user/login/encryption-key` | id de clave RSA-OAEP |
| inicio de sesión | `POST /api/user/login?turnstile=` | `password_encrypted` |
| creación de clave | `POST /api/beat/account/keys` | devuelve una clave **enmascarada** |
| revelación de clave | `POST /api/beat/account/keys/{id}/key` | la clave real — se muestra una vez |
| prueba | `GET /v1/usage` | `200` significa que la clave está activa |

**Dos notas del proveedor que conviene saber de antemano.** La dirección de registro tiene que ser un buzón `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`, y los puntos se ignoran (`first.last@` es la misma dirección que `firstlast@`, lo que responde *"Email address is already in use"*) — pasa un buzón y quédate con su forma sin puntos. Y BeatAPI envía su propio correo de verificación: tras muchos registros en un mismo día responde `550 You have reached your daily email sending quota`, lo que simplemente significa que los nuevos registros se reanudan al día siguiente — las claves que ya tienes siguen funcionando.

## ⚙️ Opciones de la CLI

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node src/cli.js --verify-only keys.txt    # re-check a whole list
node src/cli.js --help
```

| Opción | Predeterminado | Significado |
| --- | --- | --- |
| `--count <n>` | `30` | con cuántas claves debe terminar la lista |
| `--out <file>` | `keys.txt` | lista de claves, **una clave por línea** |
| `--accounts <file>` | `<out>.accounts.json` | registros de cuentas (buzón / usuario / contraseña) |
| `--prefix <name>` | `beatapi-bulk` | prefijo del nombre de la clave mostrado en el panel |
| `--delay <ms>` | `16000` | pausa entre cuentas |
| `--proxy <url>` | `$BEATAPI_PROXY` | proxy HTTP(S)/SOCKS único para cada solicitud |
| `--proxy-file <f>` | — | un proxy por línea, **rotado por cuenta** |
| `--no-verify` | off | omite la comprobación `GET /v1/usage` (no recomendado) |
| `--verify-only <f>` | — | vuelve a comprobar cada clave de una lista y sale |
| `-h, --help` | | uso |

Las claves que ya están en `--out` cuentan para `--count`, así que volver a ejecutar solo añade lo que falta.

## 🛰️ Detrás de un proxy

**Pon una salida delante de la ejecución.** Una cuenta por clave significa un registro por clave, y BeatAPI limita los registros por dirección (medido: *20 solicitudes / 20 minutos*) — rotar una lista de proxies le da a cada cuenta una ejecución limpia, y la herramienta espera un `429 … retry_after_seconds` en lugar de quemar la cuenta cuando el límite aún se dispara.

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node src/cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | claves verificadas, una por línea — ignorado por git, nunca se confirma |
| `keys.accounts.json` | registros de cuentas (buzón / usuario / contraseña) — ignorado por git |
| `proxies.txt` | tu grupo de salidas, un proxy por línea — ignorado por git |
| `launcher.config.json` | lo que recuerda el lanzador — ignorado por git |
| `src/cli.js` · `src/launcher.js` · `src/proxy.js` | la herramienta de creación, el menú interactivo y la rotación de proxies |

## 🔌 Conectar con 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI. BeatAPI sirve OpenAI puro en `https://api.beatapi.io/v1`, así que el conector registra **un nodo de proveedor `openai-compatible`** (prefijo `beatapi`) y adjunta cada clave de `keys.txt` como una conexión — `beatapi-001`, `beatapi-002`, … Volver a ejecutarlo es idempotente.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Los modelos se sirven entonces como `beatapi/<model id>` — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — con balanceo de carga entre todas las conexiones:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar con OmniRoute

[OmniRoute](https://omniroute.online) es un router autoalojado y compatible con OpenAI. El conector hace el mismo trabajo allí — un nodo `openai-compatible` (prefijo `beatapi`), una conexión por cada clave de `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Predeterminados: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 Qué da el proveedor | una cuenta nueva por clave — 43 modelos, 7 de ellos de nivel gratuito, cada clave probada en la propia API del proveedor |
| 🔑 Qué te da una clave | una clave API limitada a su propia cuenta: los 43 ids de modelos en el endpoint de abajo, con los límites de tu plan. La cuota vive en la **cuenta**, que es exactamente por lo que esta herramienta crea una cuenta por clave |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con beatapi.io y el backend de buzón que configures; las claves se quedan en tu máquina |

## 🐞 Problemas

¿Algo cambió del lado de BeatAPI (endpoint, reglas de correo, límites)? **[Abre un issue](../../issues)** con el comando que ejecutaste y el texto exacto del error. Se aceptan PRs.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>