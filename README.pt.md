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

**Crie contas BeatAPI em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI (43 modelos, 7 no nível gratuito) + endpoint pronto para 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-43-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Nível gratuito — quanto você recebe

**Toda nova conta BeatAPI recebe os 7 modelos `-free` — sem cartão; modelos pagos exigem créditos na mesma conta.**

| O quê | Valor |
| --- | --- |
| Modelos do nível gratuito | **7 dos 43** ids listados respondem em uma conta nova e sem fundos |
| Limite de modelos gratuitos (medido) | **uma requisição bem-sucedida por modelo gratuito por janela** — a próxima chamada responde `429 this model allows at most 1 successful requests …` |
| Modelos pagos | respondem `402 Insufficient balance` até você adicionar créditos à conta |
| Cartão exigido | **Não** para se registrar |
| Caixa de correio para cadastro | apenas `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — e os pontos são ignorados (`first.last@` é o mesmo endereço que `firstlast@`) |
| A unidade que escala | **uma conta = uma chave** → `--count N` gera N contas, cada uma com sua própria janela de modelos gratuitos e seu próprio saldo de créditos |

**Os ids dos modelos do nível gratuito**

| Modelo | Observações |
| --- | --- |
| `deepseek-v4.1-flash-free` | o modelo usado para a verificação ao vivo aqui |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | id da família Google servido pelo gateway |
| `glm-5.3-free`, `glm-5.3-flash-free` | família GLM 5.3 |
| `gpt-6.1-sol-free` | id da família OpenAI |
| `jev-1.13-free` | Jev |

> 💡 Os valores e as janelas são definidos pela BeatAPI e podem mudar (a página de preços dela também menciona um crédito de cadastro que alcança 48 modelos, e os 7 modelos gratuitos funcionando "por tempo limitado"). Revalide seu próprio arquivo a qualquer momento:

```bash
node src/cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 O nível gratuito é definido pela BeatAPI e pode mudar. Confira os números ao vivo em [beatapi.io](https://beatapi.io) — e deixe o próprio gate da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 43

`GET https://api.beatapi.io/v1/models` com uma chave gerada retorna **43 modelos**, **7 dos quais estão no nível gratuito**. Os 36 restantes respondem `402 Insufficient balance` em uma conta sem fundos — a chave é válida, a conta não tem créditos.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Quer mais do catálogo?** Adicione créditos à conta, ou crie mais contas: cada chave traz sua própria janela de modelos gratuitos e seu próprio saldo.

## 🧪 Como usar a API

A URL base é **`https://api.beatapi.io/v1`** — compatível com OpenAI, então qualquer coisa que fale OpenAI funciona (SDKs, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Os próprios contadores da conta também são um endpoint no formato OpenAI:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Início rápido

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

`keys.txt` é escrito **somente** depois que `GET /v1/usage` responde 200 com a nova chave, então cada linha nele é uma chave que se autenticou contra a própria API do provedor.

### 🖱️ O launcher

```bash
node src/launcher.js
```

Ele pergunta quantas chaves você quer e qual lista de proxies usar, memoriza as respostas em `launcher.config.json` e então executa a ferramenta com as flags corretas. Menu: **1) Mint keys · 2) Verify keys · 3) Settings · 4) Help · 5) Connect to 9Router · 6) Connect to OmniRoute · q) Quit**.

## ✅ Verificado e funcionando — toda chave é testada

Uma chave só chega a `keys.txt` depois que a própria API do provedor responde com ela:

| Verificação | Resultado |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — executado automaticamente para **toda** chave logo após a criação | **HTTP 200**, `data.object: "usage"` |
| Reverificação da lista inteira com `--verify-only` (chaves de contas separadas) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` em um modelo `-free` | **HTTP 200**, conclusão real (`deepseek-v4.1-flash-free`) |
| Modelo pago em uma conta nova | `402 Insufficient balance` — a *chave* é válida, a *conta* precisa de créditos |

> Uma chave é mostrada **uma única vez**, na criação: o painel responde com a forma mascarada (`x9ZX**********2erY`) e a chave real só vem de `POST /api/beat/account/keys/{id}/key`. A ferramenta chama esse endpoint imediatamente e grava o resultado direto no disco.

> **Gates de qualidade.** Toda chave aqui passou por um `chat-200` ao vivo antes de ser escrita em `keys.txt`
> (chaves mortas nunca são entregues). As combinações do roteador seguem a mesma regra no nível do modelo: uma entrada é
> adicionada **somente se o modelo responder `chat-200` e conseguir chamar ferramentas** — um modelo sem suporte a ferramentas,
> uma chave morta ou um provedor morto é descartado em vez de adicionado. Reexecute a etapa de verificação a qualquer momento;
> as falhas são reportadas, nunca escondidas.

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Observações |
| --- | --- | --- |
| caixa de correio | `GET /api/verification?email=…` | envia o código para um endereço `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` |
| registrar | `POST /api/user/register?turnstile=` | código + senha |
| chave de login | `GET /api/user/login/encryption-key` | id da chave RSA-OAEP |
| login | `POST /api/user/login?turnstile=` | `password_encrypted` |
| criar chave | `POST /api/beat/account/keys` | retorna uma chave **mascarada** |
| revelar chave | `POST /api/beat/account/keys/{id}/key` | a chave real — mostrada uma única vez |
| provar | `GET /v1/usage` | `200` significa que a chave está ativa |

**Duas observações do lado do provedor que vale a pena saber de antemão.** O endereço de cadastro precisa ser uma caixa de correio `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`, e os pontos são ignorados (`first.last@` é o mesmo endereço que `firstlast@`, o que responde *"Email address is already in use"*) — passe uma caixa de correio e fique na sua forma sem pontos. E a BeatAPI envia seu próprio e-mail de verificação: depois de muitos cadastros em um único dia ela responde `550 You have reached your daily email sending quota`, o que simplesmente significa que novos cadastros serão retomados no dia seguinte — as chaves que você já tem continuam funcionando.

## ⚙️ Opções da CLI

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node src/cli.js --verify-only keys.txt    # re-check a whole list
node src/cli.js --help
```

| Opção | Padrão | Significado |
| --- | --- | --- |
| `--count <n>` | `30` | com quantas chaves a lista deve terminar |
| `--out <file>` | `keys.txt` | lista de chaves, **uma chave por linha** |
| `--accounts <file>` | `<out>.accounts.json` | registros de contas (caixa de correio / usuário / senha) |
| `--prefix <name>` | `beatapi-bulk` | prefixo do nome da chave mostrado no painel |
| `--delay <ms>` | `16000` | pausa entre contas |
| `--proxy <url>` | `$BEATAPI_PROXY` | proxy HTTP(S)/SOCKS único para todas as requisições |
| `--proxy-file <f>` | — | um proxy por linha, **rotacionado por conta** |
| `--no-verify` | desativado | pula a verificação `GET /v1/usage` (não recomendado) |
| `--verify-only <f>` | — | reverifica toda chave de uma lista e sai |
| `-h, --help` | | uso |

Chaves já presentes em `--out` contam para `--count`, então reexecutar adiciona apenas o que está faltando.

## 🛰️ Atrás de um proxy

**Coloque uma saída na frente da execução.** Uma conta por chave significa um cadastro por chave, e a BeatAPI limita cadastros por endereço (medido: *20 requisições / 20 minutos*) — rotacionar uma lista de proxies dá a cada conta uma execução limpa, e a ferramenta espera um `429 … retry_after_seconds` em vez de queimar a conta quando o limite ainda é atingido.

```bash
node src/cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node src/cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | chaves verificadas, uma por linha — ignorado pelo git, nunca commitado |
| `keys.accounts.json` | registros de contas (caixa de correio / usuário / senha) — ignorado pelo git |
| `proxies.txt` | seu pool de saídas, um proxy por linha — ignorado pelo git |
| `launcher.config.json` | o que o launcher memoriza — ignorado pelo git |
| `src/cli.js` · `src/launcher.js` · `src/proxy.js` | a ferramenta de criação, o menu interativo e a rotação de proxies |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI. A BeatAPI serve OpenAI puro em `https://api.beatapi.io/v1`, então o conector registra **um nó de provedor `openai-compatible`** (prefixo `beatapi`) e anexa cada chave em `keys.txt` como uma conexão — `beatapi-001`, `beatapi-002`, … Reexecutá-lo é idempotente.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Os modelos são então servidos como `beatapi/<model id>` — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — com balanceamento de carga entre todas as conexões:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI. O conector faz o mesmo trabalho lá — um nó `openai-compatible` (prefixo `beatapi`), uma conexão por chave em `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Padrões: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 O que uma chave te dá

| | |
| --- | --- |
| 🏢 Provedor | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 O que o provedor oferece | uma conta nova por chave — 43 modelos, 7 deles no nível gratuito, toda chave comprovada na própria API do provedor |
| 🔑 O que uma chave te dá | uma chave de API vinculada à sua própria conta: os 43 ids de modelo no endpoint abaixo, nos limites do seu plano. A cota fica na **conta**, que é exatamente por isso que esta ferramenta cria uma conta por chave |
| 🌐 Formato da API | Compatível com OpenAI: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Seus dados | apenas beatapi.io e o backend de caixa de correio que você configurar são contatados; as chaves ficam na sua máquina |

## 🐞 Problemas

Algo mudou do lado da BeatAPI (endpoint, regras de e-mail, limites)? **[Abra uma issue](../../issues)** com o comando que você executou e o texto exato do erro. PRs são bem-vindos.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>