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

**Otomatik oluşturulan API anahtarlarıyla toplu BeatAPI hesabı oluşturun — OpenAI uyumlu çıkarım (43 model, 7 ücretsiz katman) + 9Router'a hazır uç nokta.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-43-of-them) · [🧪 API'yi kullanın](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Ücretsiz katman — ne kadar alırsınız

**Her yeni BeatAPI hesabı 7 `-free` modeli alır — kart gerekmez; ücretli modeller aynı hesapta kredi gerektirir.**

| Ne | Değer |
| --- | --- |
| Ücretsiz katman modelleri | Listelenen 43 kimlikten **7'si** yepyeni, bakiye yüklenmemiş bir hesapta yanıt verir |
| Ücretsiz model limiti (ölçülen) | **pencere başına ücretsiz model başına bir başarılı istek** — sonraki çağrı `429 this model allows at most 1 successful requests …` yanıtını verir |
| Ücretli modeller | Hesaba bakiye yükleyene kadar `402 Insufficient balance` yanıtını verir |
| Kart gerekli mi | Kayıt için **Hayır** |
| Kayıt posta kutusu | Yalnızca `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` — ve noktalar yok sayılır (`first.last@` ile `firstlast@` aynı adrestir) |
| Ölçeklenen birim | **bir hesap = bir anahtar** → `--count N` size N hesap verir, her birinin kendi ücretsiz model penceresi ve kendi kredi bakiyesi vardır |

**Ücretsiz katman model kimlikleri**

| Model | Notlar |
| --- | --- |
| `deepseek-v4.1-flash-free` | burada canlı doğrulama için kullanılan model |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | ağ geçidi tarafından sunulan Google ailesi kimliği |
| `glm-5.3-free`, `glm-5.3-flash-free` | GLM 5.3 ailesi |
| `gpt-6.1-sol-free` | OpenAI ailesi kimliği |
| `jev-1.13-free` | Jev |

> 💡 Miktarlar ve pencereler BeatAPI tarafından belirlenir ve değişebilir (fiyatlandırma sayfası ayrıca 48 modele ulaşan bir kayıt kredisi ve 7 ücretsiz modelin "sınırlı bir süre" çalıştığını belirtir). Kendi dosyanızı istediğiniz zaman yeniden doğrulayın:

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 Ücretsiz katman BeatAPI tarafından belirlenir ve değişebilir. Canlı sayıları [beatapi.io](https://beatapi.io) adresinden kontrol edin — ve aracın kendi kapısının karar vermesine izin verin:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 43'ünün tamamı

Oluşturulmuş bir anahtarla `GET https://api.beatapi.io/v1/models` **43 model** döndürür, bunların **7'si ücretsiz katmandadır**. Kalan 36'sı bakiye yüklenmemiş bir hesapta `402 Insufficient balance` yanıtını verir — anahtar geçerlidir, hesabın kredisi yoktur.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Katalogdan daha fazlasını mı istiyorsunuz?** Hesaba kredi yükleyin veya daha fazla hesap oluşturun: her anahtar kendi ücretsiz model penceresini ve kendi bakiyesini getirir.

## 🧪 API nasıl kullanılır

Temel URL **`https://api.beatapi.io/v1`** — OpenAI uyumlu, yani OpenAI konuşan her şey çalışır (SDK'lar, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Hesabın kendi sayaçları da OpenAI biçiminde bir uç noktadır:

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Hızlı başlangıç

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

`keys.txt` **yalnızca** `GET /v1/usage` yeni anahtarla 200 yanıtını verdikten sonra yazılır, böylece içindeki her satır sağlayıcının kendi API'sine karşı kimlik doğrulaması yapmış bir anahtardır.

### 🖱️ Başlatıcı

```bash
node launcher.js
```

Kaç anahtar istediğinizi, çıktı dosyasını, anahtar adı önekini, hesaplar arasındaki duraklamayı ve isteğe bağlı bir proxy / proxy listesini sorar, yanıtları `launcher.config.json` içinde hatırlar ve ardından aracı çalıştırır. Menü: **1) Anahtar oluştur · 2) Anahtarları doğrula · 3) Ayarlar · 4) Yardım · q) Çıkış**.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

Bir anahtar `keys.txt` dosyasına ancak sağlayıcının kendi API'si onunla yanıt verdikten sonra ulaşır:

| Kontrol | Sonuç |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — oluşturulduktan hemen sonra **her** anahtar için otomatik olarak çalıştırılır | **HTTP 200**, `data.object: "usage"` |
| `--verify-only` ile tüm listenin yeniden kontrolü (ayrı hesaplardan anahtarlar) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| Bir `-free` modelde `POST https://api.beatapi.io/v1/chat/completions` | **HTTP 200**, gerçek tamamlama (`deepseek-v4.1-flash-free`) |
| Yeni bir hesapta ücretli model | `402 Insufficient balance` — *anahtar* geçerlidir, *hesabın* krediye ihtiyacı vardır |

> Bir anahtar **yalnızca bir kez**, oluşturulma anında gösterilir: panel maskelenmiş biçimde yanıt verir (`x9ZX**********2erY`) ve gerçek anahtar yalnızca `POST /api/beat/account/keys/{id}/key` üzerinden gelir. Araç bu uç noktayı hemen çağırır ve sonucu doğrudan diske yazar.

> **Kalite kapıları.** Buradaki her anahtar `keys.txt` dosyasına yazılmadan önce canlı bir `chat-200` geçti
> (ölü anahtarlar asla gönderilmez). Yönlendirici kombinasyonları model düzeyinde aynı kuralı izler: bir giriş
> **yalnızca model `chat-200` yanıtı veriyorsa ve araçları çağırabiliyorsa** eklenir — araç desteği olmayan bir model,
> ölü bir anahtar veya ölü bir sağlayıcı eklenmek yerine çıkarılır. Doğrulama adımını istediğiniz zaman yeniden çalıştırın;
> hatalar bildirilir, asla gizlenmez.

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| posta kutusu | `GET /api/verification?email=…` | kodu `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` adresine gönderir |
| kayıt | `POST /api/user/register?turnstile=` | kod + parola |
| giriş anahtarı | `GET /api/user/login/encryption-key` | RSA-OAEP anahtar kimliği |
| giriş | `POST /api/user/login?turnstile=` | `password_encrypted` |
| anahtar oluşturma | `POST /api/beat/account/keys` | **maskelenmiş** bir anahtar döndürür |
| anahtar açığa çıkarma | `POST /api/beat/account/keys/{id}/key` | gerçek anahtar — bir kez gösterilir |
| kanıtla | `GET /v1/usage` | `200`, anahtarın canlı olduğu anlamına gelir |

**Önceden bilmeye değer iki sağlayıcı tarafı notu.** Kayıt adresi `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` posta kutusu olmalıdır ve noktalar yok sayılır (`first.last@` ile `firstlast@` aynı adrestir, bu da *"Email address is already in use"* yanıtını verir) — bir posta kutusu geçin ve noktasız biçiminde kalın. Ve BeatAPI kendi doğrulama postasını gönderir: bir günde çok fazla kayıttan sonra `550 You have reached your daily email sending quota` yanıtını verir, bu da yeni kayıtların ertesi gün devam ettiği anlamına gelir — halihazırda sahip olduğunuz anahtarlar çalışmaya devam eder.

## ⚙️ CLI seçenekleri

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| Seçenek | Varsayılan | Anlamı |
| --- | --- | --- |
| `--count <n>` | `30` | listenin sonunda kaç anahtar olması gerektiği |
| `--out <file>` | `keys.txt` | anahtar listesi, **her satırda bir anahtar** |
| `--accounts <file>` | `<out>.accounts.json` | hesap kayıtları (posta kutusu / kullanıcı / parola) |
| `--prefix <name>` | `beatapi-bulk` | kontrol panelinde gösterilen anahtar adı öneki |
| `--delay <ms>` | `16000` | hesaplar arasındaki duraklama |
| `--proxy <url>` | `$BEATAPI_PROXY` | her istek için tek HTTP(S)/SOCKS proxy |
| `--proxy-file <f>` | — | her satırda bir proxy, **hesap başına döndürülür** |
| `--no-verify` | kapalı | `GET /v1/usage` kontrolünü atla (önerilmez) |
| `--verify-only <f>` | — | bir listedeki her anahtarı yeniden kontrol et ve çık |
| `-h, --help` | | kullanım |

`--out` içinde zaten bulunan anahtarlar `--count` değerine sayılır, böylece yeniden çalıştırma yalnızca eksik olanı ekler.

## 🛰️ Proxy arkasında

**Çalıştırmanın önüne bir çıkış koyun.** Anahtar başına bir hesap, anahtar başına bir kayıt anlamına gelir ve BeatAPI kayıtları adres başına sınırlar (ölçülen: *20 istek / 20 dakika*) — bir proxy listesini döndürmek her hesaba temiz bir çalıştırma sağlar ve araç, limit yine de tetiklendiğinde hesabı yakmak yerine `429 … retry_after_seconds` yanıtını bekler.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | doğrulanmış anahtarlar, her satırda bir tane — git tarafından yok sayılır, asla işlenmez |
| `keys.accounts.json` | hesap kayıtları (posta kutusu / kullanıcı / parola) — git tarafından yok sayılır |
| `proxies.txt` | çıkış havuzunuz, her satırda bir proxy — git tarafından yok sayılır |
| `launcher.config.json` | başlatıcının hatırladıkları — git tarafından yok sayılır |
| `cli.js` · `launcher.js` · `proxy.js` | anahtar oluşturma aracı, etkileşimli menü ve proxy döndürme |

## 🔌 9Router'a bağlanın

[9Router](https://9router.com) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir. BeatAPI, `https://api.beatapi.io/v1` adresinde düz OpenAI sunar, böylece bağlayıcı **bir `openai-compatible` sağlayıcı düğümü** (önek `beatapi`) kaydeder ve `keys.txt` içindeki her anahtarı bir bağlantı olarak ekler — `beatapi-001`, `beatapi-002`, … Yeniden çalıştırmak etkisizdir (idempotent).

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Modeller daha sonra `beatapi/<model id>` olarak sunulur — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — her bağlantı arasında yük dengelenir:

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 OmniRoute'a bağlanın

[OmniRoute](https://omniroute.online) kendi kendine barındırılan, OpenAI uyumlu bir yönlendiricidir. Bağlayıcı orada da aynı işi yapar — bir `openai-compatible` düğümü (önek `beatapi`), `keys.txt` içindeki her anahtar için bir bağlantı:

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Varsayılanlar: `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 Sağlayıcının verdikleri | anahtar başına bir yeni hesap — 43 model, bunların 7'si ücretsiz katman, her anahtar sağlayıcının kendi API'sinde kanıtlanmış |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabına kapsanmış bir API anahtarı: aşağıdaki uç noktada 43 model kimliği, planınızın limitlerinde. Kota **hesapta** bulunur, bu aracın anahtar başına bir hesap oluşturmasının nedeni tam da budur |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca beatapi.io ve yapılandırdığınız posta kutusu arka ucuna bağlanılır; anahtarlar makinenizde kalır |

## 🐞 Sorunlar

BeatAPI tarafında bir şey mi değişti (uç nokta, e-posta kuralları, limitler)? Çalıştırdığınız komut ve tam hata metniyle birlikte **[bir sorun açın](../../issues)**. PR'lar memnuniyetle karşılanır.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey katkıda bulunanlar

</div>