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

**BeatAPI-Konten im Bulk anlegen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz (43 Modelle, 7 im Free-Tier) + 9Router-fähiger Endpunkt.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Free-Tier](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-43-of-them) · [🧪 API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Free-Tier — wie viel du bekommst

**Jedes neue BeatAPI-Konto erhält die 7 `-free`-Modelle — ohne Karte; kostenpflichtige Modelle benötigen Guthaben auf demselben Konto.**

| Was | Wert |
| --- | --- |
| Free-Tier-Modelle | **7 der 43** aufgeführten IDs antworten auf einem brandneuen, unaufgeladenen Konto |
| Free-Modell-Limit (gemessen) | **eine erfolgreiche Anfrage pro Free-Modell pro Fenster** — der nächste Aufruf antwortet mit `429 this model allows at most 1 successful requests …` |
| Kostenpflichtige Modelle | antworten mit `402 Insufficient balance`, bis du das Konto auflädst |
| Karte erforderlich | **Nein** zur Registrierung |
| Anmelde-Postfach | nur `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — und Punkte werden ignoriert (`first.last@` ist dieselbe Adresse wie `firstlast@`) |
| Die Einheit, die skaliert | **ein Konto = ein Schlüssel** → `--count N` gibt dir N Konten, jedes mit eigenem Free-Modell-Fenster und eigenem Guthaben |

**Die Free-Tier-Modell-IDs**

| Modell | Hinweise |
| --- | --- |
| `deepseek-v4.1-flash-free` | das für die Live-Verifizierung hier verwendete Modell |
| `deepseek-v4-flash-0731-free` | DeepSeek Flash |
| `gemini-3.8-flash-free` | Google-Familien-ID, bereitgestellt vom Gateway |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM-5.3-Familie |
| `gpt-6.1-sol-free` | OpenAI-Familien-ID |
| `jev-1.13-free` | Jev |

> 💡 Beträge und Fenster werden von BeatAPI festgelegt und können sich ändern (die Preisseite weist auch auf ein Anmeldeguthaben hin, das 48 Modelle erreicht, und darauf, dass die 7 kostenlosen Modelle „für begrenzte Zeit" laufen). Überprüfe deine eigene Datei jederzeit erneut:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 Der Free-Tier wird von BeatAPI festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen unter [beatapi.io](https://beatapi.io) — und lass das eigene Gate des Tools entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 43

`GET https://api.beatapi.io/v1/models` mit einem erzeugten Schlüssel liefert **43 Modelle**, von denen **7 im Free-Tier** sind. Die übrigen 36 antworten auf einem unaufgeladenen Konto mit `402 Insufficient balance` — der Schlüssel ist gültig, das Konto hat kein Guthaben.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Möchtest du mehr aus dem Katalog?** Lade das Konto auf oder erzeuge mehr Konten: Jeder Schlüssel bringt sein eigenes Free-Modell-Fenster und sein eigenes Guthaben mit.

## 🧪 So verwendest du die API

Die Basis-URL ist **`https://api.beatapi.io/v1`** — OpenAI-kompatibel, also funktioniert alles, was OpenAI spricht (SDKs, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Die eigenen Zähler des Kontos sind ebenfalls ein OpenAI-förmiger Endpunkt:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Schnellstart

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

`keys.txt` wird **erst** geschrieben, nachdem `GET /v1/usage` mit dem neuen Schlüssel 200 antwortet, sodass jede Zeile darin ein Schlüssel ist, der sich gegenüber der API des Anbieters authentifiziert hat.

### 🖱️ Der Launcher

```bash
node launcher.js
```

Er fragt, wie viele Schlüssel du möchtest, die Ausgabedatei, das Schlüsselnamen-Präfix, die Pause zwischen den Konten und einen optionalen Proxy / eine Proxy-Liste, merkt sich die Antworten in `launcher.config.json` und führt dann das Tool aus. Menü: **1) Schlüssel erzeugen · 2) Schlüssel verifizieren · 3) Einstellungen · 4) Hilfe · q) Beenden**.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

Ein Schlüssel erreicht `keys.txt` erst, nachdem die API des Anbieters damit geantwortet hat:

| Prüfung | Ergebnis |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — automatisch für **jeden** Schlüssel direkt nach der Erstellung ausgeführt | **HTTP 200**, `data.object: "usage"` |
| Erneute Prüfung der gesamten Liste mit `--verify-only` (Schlüssel aus separaten Konten) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` auf einem `-free`-Modell | **HTTP 200**, echte Completion (`deepseek-v4.1-flash-free`) |
| Kostenpflichtiges Modell auf einem frischen Konto | `402 Insufficient balance` — der *Schlüssel* ist gültig, das *Konto* benötigt Guthaben |

> Ein Schlüssel wird **einmal** angezeigt, bei der Erstellung: Das Panel antwortet mit der maskierten Form (`x9ZX**********2erY`) und der echte Schlüssel kommt nur von `POST /api/beat/account/keys/{id}/key`. Das Tool ruft diesen Endpunkt sofort auf und schreibt das Ergebnis direkt auf die Festplatte.

> **Qualitätsgates.** Jeder Schlüssel hier hat ein Live-`chat-200` bestanden, bevor er in `keys.txt` geschrieben wurde
> (tote Schlüssel werden nie ausgeliefert). Router-Kombinationen folgen derselben Regel auf Modellebene: Ein Eintrag wird
> **nur hinzugefügt, wenn das Modell `chat-200` antwortet und Tools aufrufen kann** — ein Modell ohne Tool-Unterstützung,
> ein toter Schlüssel oder ein toter Anbieter wird verworfen statt hinzugefügt. Führe den Verifizierungsschritt jederzeit erneut aus;
> Fehler werden gemeldet, nie versteckt.

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Postfach | `GET /api/verification?email=…` | schickt den Code an eine `gmail.com`- / `qq.com`- / `yahoo.com`- / `icloud.com`-Adresse |
| Registrieren | `POST /api/user/register?turnstile=` | Code + Passwort |
| Login-Schlüssel | `GET /api/user/login/encryption-key` | RSA-OAEP-Schlüssel-ID |
| Login | `POST /api/user/login?turnstile=` | `password_encrypted` |
| Schlüssel erstellen | `POST /api/beat/account/keys` | gibt einen **maskierten** Schlüssel zurück |
| Schlüssel enthüllen | `POST /api/beat/account/keys/{id}/key` | der echte Schlüssel — einmalig angezeigt |
| Nachweisen | `GET /v1/usage` | `200` bedeutet, der Schlüssel ist live |

**Zwei anbieterseitige Hinweise, die man vorab kennen sollte.** Die Registrierungsadresse muss ein `gmail.com`- / `qq.com`- / `yahoo.com`- / `icloud.com`-Postfach sein, und Punkte werden ignoriert (`first.last@` ist dieselbe Adresse wie `firstlast@`, was mit *„Email address is already in use"* antwortet) — gib ein Postfach an und bleibe bei dessen punktfreier Form. Und BeatAPI versendet seine eigene Verifizierungsmail: Nach vielen Anmeldungen an einem Tag antwortet es mit `550 You have reached your daily email sending quota`, was einfach bedeutet, dass neue Anmeldungen am nächsten Tag wieder möglich sind — die Schlüssel, die du bereits hast, funktionieren weiter.

## ⚙️ CLI-Optionen

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| Option | Standard | Bedeutung |
| --- | --- | --- |
| `--count <n>` | `30` | wie viele Schlüssel die Liste am Ende enthalten soll |
| `--out <file>` | `keys.txt` | Schlüsselliste, **ein Schlüssel pro Zeile** |
| `--accounts <file>` | `<out>.accounts.json` | Kontodatensätze (Postfach / Benutzer / Passwort) |
| `--prefix <name>` | `beatapi-bulk` | Schlüsselnamen-Präfix, das im Dashboard angezeigt wird |
| `--delay <ms>` | `16000` | Pause zwischen den Konten |
| `--proxy <url>` | `$BEATAPI_PROXY` | einzelner HTTP(S)/SOCKS-Proxy für jede Anfrage |
| `--proxy-file <f>` | — | ein Proxy pro Zeile, **pro Konto rotiert** |
| `--no-verify` | aus | überspringt die `GET /v1/usage`-Prüfung (nicht empfohlen) |
| `--verify-only <f>` | — | prüft jeden Schlüssel in einer Liste erneut und beendet |
| `-h, --help` | | Verwendung |

Schlüssel, die bereits in `--out` vorhanden sind, zählen zu `--count` hinzu, sodass ein erneuter Lauf nur das Fehlende ergänzt.

## 🛰️ Hinter einem Proxy

**Setze einen Exit vor den Lauf.** Ein Konto pro Schlüssel bedeutet eine Registrierung pro Schlüssel, und BeatAPI begrenzt Registrierungen pro Adresse (gemessen: *20 Anfragen / 20 Minuten*) — eine rotierende Proxy-Liste gibt jedem Konto einen sauberen Lauf, und das Tool wartet ein `429 … retry_after_seconds` aus, statt das Konto zu verbrennen, wenn das Limit trotzdem greift.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | verifizierte Schlüssel, einer pro Zeile — von Git ignoriert, nie committet |
| `keys.accounts.json` | Kontodatensätze (Postfach / Benutzer / Passwort) — von Git ignoriert |
| `proxies.txt` | dein Exit-Pool, ein Proxy pro Zeile — von Git ignoriert |
| `launcher.config.json` | was der Launcher sich merkt — von Git ignoriert |
| `cli.js` · `launcher.js` · `proxy.js` | das Erzeugungstool, das interaktive Menü und die Proxy-Rotation |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router. BeatAPI liefert reines OpenAI unter `https://api.beatapi.io/v1`, sodass der Connector **einen `openai-compatible`-Provider-Node** registriert (Präfix `beatapi`) und jeden Schlüssel in `keys.txt` als Verbindung anhängt — `beatapi-001`, `beatapi-002`, … Ein erneuter Lauf ist idempotent.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Modelle werden dann als `beatapi/<model id>` bereitgestellt — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — lastverteilt über jede Verbindung:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Mit OmniRoute verbinden

[OmniRoute](https://omniroute.online) ist ein selbst gehosteter, OpenAI-kompatibler Router. Der Connector erledigt dort dieselbe Aufgabe — ein `openai-compatible`-Node (Präfix `beatapi`), eine Verbindung pro Schlüssel in `keys.txt`:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Standardwerte: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 Was der Anbieter gibt | ein frisches Konto pro Schlüssel — 43 Modelle, 7 davon im Free-Tier, jeder Schlüssel auf der API des Anbieters nachgewiesen |
| 🔑 Was ein Schlüssel dir bringt | ein API-Schlüssel, der auf sein eigenes Konto beschränkt ist: die 43 Modell-IDs am untenstehenden Endpunkt, zu den Limits deines Tarifs. Das Kontingent liegt auf dem **Konto**, weshalb dieses Tool genau ein Konto pro Schlüssel erstellt |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Deine Daten | nur beatapi.io und das von dir konfigurierte Postfach-Backend werden kontaktiert; Schlüssel bleiben auf deinem Rechner |

## 🐞 Issues

Hat sich auf BeatAPIs Seite etwas geändert (Endpunkt, E-Mail-Regeln, Limits)? **[Öffne ein Issue](../../issues)** mit dem ausgeführten Befehl und dem exakten Fehlertext. PRs willkommen.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>