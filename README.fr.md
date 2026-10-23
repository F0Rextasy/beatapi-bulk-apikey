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

**Créez en masse des comptes BeatAPI avec des clés API générées automatiquement — inférence compatible OpenAI (43 modèles, 7 en offre gratuite) + point de terminaison prêt pour 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-43%20served-412991?style=for-the-badge)](https://beatapi.io/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-43-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## 🎁 Offre gratuite — ce que vous obtenez

**Chaque nouveau compte BeatAPI obtient les 7 modèles `-free` — sans carte ; les modèles payants nécessitent des crédits sur ce même compte.**

| Quoi | Valeur |
| --- | --- |
| Modèles de l'offre gratuite | **7 des 43** identifiants listés répondent sur un compte tout neuf et non approvisionné |
| Limite des modèles gratuits (mesurée) | **une requête réussie par modèle gratuit par fenêtre** — l'appel suivant répond `429 this model allows at most 1 successful requests …` |
| Modèles payants | répondent `402 Insufficient balance` jusqu'à ce que vous approvisionniez le compte |
| Carte requise | **Non** pour s'inscrire |
| Boîte mail d'inscription | `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` uniquement — et les points sont ignorés (`first.last@` est la même adresse que `firstlast@`) |
| L'unité qui s'adapte | **un compte = une clé** → `--count N` vous donne N comptes, chacun avec sa propre fenêtre de modèles gratuits et son propre solde de crédits |

**Les identifiants des modèles de l'offre gratuite**

| Modèle | Remarques |
| --- | --- |
| `deepseek-v4.1-flash-free` | le modèle utilisé pour la vérification en direct ici |
| `deepseek-v4-flash-0731-free` | DeepSeek flash |
| `gemini-3.8-flash-free` | identifiant de la famille Google servi par la passerelle |
| `glm-5.3-free`, `glm-5.3-flash-free` | famille GLM 5.3 |
| `gpt-6.1-sol-free` | identifiant de la famille OpenAI |
| `jev-1.13-free` | Jev |

> 💡 Les montants et les fenêtres sont définis par BeatAPI et peuvent changer (sa page de tarifs mentionne aussi un crédit d'inscription donnant accès à 48 modèles, et les 7 modèles gratuits fonctionnant « pour une durée limitée »). Revérifiez votre propre fichier à tout moment :

```bash
node cli.js --verify-only keys.txt   # re-check a whole list
```

> 💡 L'offre gratuite est définie par BeatAPI et peut changer. Consultez les chiffres en direct sur [beatapi.io](https://beatapi.io) — et laissez le contrôle de l'outil lui-même décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 43

`GET https://api.beatapi.io/v1/models` avec une clé générée renvoie **43 modèles**, **dont 7 dans l'offre gratuite**. Les 36 restants répondent `402 Insufficient balance` sur un compte non approvisionné — la clé est valide, le compte n'a pas de crédits.

```bash
curl https://api.beatapi.io/v1/models -H "Authorization: Bearer <one of your keys>"
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

**Vous voulez plus de catalogue ?** Approvisionnez le compte, ou créez plus de comptes : chaque clé apporte sa propre fenêtre de modèles gratuits et son propre solde.

## 🧪 Comment utiliser l'API

L'URL de base est **`https://api.beatapi.io/v1`** — compatible OpenAI, donc tout ce qui parle OpenAI fonctionne (SDK, Cursor, OpenCode, Kilo Code, …).

```bash
curl https://api.beatapi.io/v1/chat/completions \
  -H "Authorization: Bearer <one of your keys>" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}],"max_tokens":8}'
```

Les propres compteurs du compte sont aussi un point de terminaison au format OpenAI :

```bash
curl https://api.beatapi.io/v1/usage -H "Authorization: Bearer <one of your keys>"
```

## 🛠 Démarrage rapide

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

`keys.txt` n'est écrit **qu'** après que `GET /v1/usage` a répondu 200 avec la nouvelle clé, donc chaque ligne qu'il contient est une clé qui s'est authentifiée auprès de l'API du fournisseur lui-même.

### 🖱️ Le lanceur

```bash
node launcher.js
```

Il demande combien de clés vous voulez, le fichier de sortie, le préfixe du nom de clé, la pause entre les comptes et un proxy / une liste de proxys facultatif, mémorise les réponses dans `launcher.config.json`, puis exécute l'outil. Menu : **1) Générer des clés · 2) Vérifier les clés · 3) Paramètres · 4) Aide · q) Quitter**.

## ✅ Vérifié fonctionnel — chaque clé est testée

Une clé n'atteint `keys.txt` qu'après que l'API du fournisseur a répondu avec elle :

| Vérification | Résultat |
| --- | --- |
| `GET https://api.beatapi.io/v1/usage` — exécuté automatiquement pour **chaque** clé juste après sa création | **HTTP 200**, `data.object: "usage"` |
| Revérification de toute la liste avec `--verify-only` (clés de comptes distincts) | **8/8 → 200** (`PSofZD…d4Cu`, `25Mcg6…FLhU`, `FIBhQQ…3f2d`, `Due4H4…ISxD`, …) |
| `POST https://api.beatapi.io/v1/chat/completions` sur un modèle `-free` | **HTTP 200**, vraie complétion (`deepseek-v4.1-flash-free`) |
| Modèle payant sur un compte neuf | `402 Insufficient balance` — la *clé* est valide, le *compte* a besoin de crédits |

> Une clé n'est affichée **qu'une seule fois**, à sa création : le panneau répond avec la forme masquée (`x9ZX**********2erY`) et la vraie clé ne provient que de `POST /api/beat/account/keys/{id}/key`. L'outil appelle ce point de terminaison immédiatement et écrit le résultat directement sur le disque.

> **Contrôles qualité.** Chaque clé ici a passé un `chat-200` en direct avant d'être écrite dans `keys.txt`
> (les clés mortes ne sont jamais livrées). Les combinaisons du routeur suivent la même règle au niveau du modèle : une entrée n'est
> ajoutée **que si le modèle répond `chat-200` et peut appeler des outils** — un modèle sans prise en charge des outils,
> une clé morte ou un fournisseur mort est écarté au lieu d'être ajouté. Relancez l'étape de vérification à tout moment ;
> les échecs sont signalés, jamais cachés.

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: BeatAPI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.beatapi.io/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| boîte mail | `GET /api/verification?email=…` | envoie le code à une adresse `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com` |
| inscription | `POST /api/user/register?turnstile=` | code + mot de passe |
| clé de connexion | `GET /api/user/login/encryption-key` | identifiant de clé RSA-OAEP |
| connexion | `POST /api/user/login?turnstile=` | `password_encrypted` |
| création de clé | `POST /api/beat/account/keys` | renvoie une clé **masquée** |
| révélation de clé | `POST /api/beat/account/keys/{id}/key` | la vraie clé — affichée une seule fois |
| preuve | `GET /v1/usage` | `200` signifie que la clé est active |

**Deux remarques côté fournisseur à connaître d'emblée.** L'adresse d'inscription doit être une boîte `gmail.com` / `qq.com` / `yahoo.com` / `icloud.com`, et les points sont ignorés (`first.last@` est la même adresse que `firstlast@`, ce qui répond *« Email address is already in use »*) — passez une boîte mail et restez sur sa forme sans points. Et BeatAPI envoie son propre mail de vérification : après beaucoup d'inscriptions en une journée, il répond `550 You have reached your daily email sending quota`, ce qui signifie simplement que les nouvelles inscriptions reprendront le lendemain — les clés que vous avez déjà continuent de fonctionner.

## ⚙️ Options de la CLI

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt
node cli.js --verify-only keys.txt    # re-check a whole list
node cli.js --help
```

| Option | Défaut | Signification |
| --- | --- | --- |
| `--count <n>` | `30` | combien de clés la liste doit finir par contenir |
| `--out <file>` | `keys.txt` | liste de clés, **une clé par ligne** |
| `--accounts <file>` | `<out>.accounts.json` | enregistrements de comptes (boîte mail / utilisateur / mot de passe) |
| `--prefix <name>` | `beatapi-bulk` | préfixe du nom de clé affiché dans le tableau de bord |
| `--delay <ms>` | `16000` | pause entre les comptes |
| `--proxy <url>` | `$BEATAPI_PROXY` | proxy HTTP(S)/SOCKS unique pour chaque requête |
| `--proxy-file <f>` | — | un proxy par ligne, **alterné à chaque compte** |
| `--no-verify` | désactivé | ignore la vérification `GET /v1/usage` (non recommandé) |
| `--verify-only <f>` | — | revérifie chaque clé d'une liste et quitte |
| `-h, --help` | | aide |

Les clés déjà présentes dans `--out` comptent pour `--count`, donc une réexécution n'ajoute que ce qui manque.

## 🛰️ Derrière un proxy

**Placez une sortie devant l'exécution.** Un compte par clé signifie une inscription par clé, et BeatAPI limite les inscriptions par adresse (mesuré : *20 requêtes / 20 minutes*) — alterner une liste de proxys donne à chaque compte une exécution propre, et l'outil attend la fin d'un `429 … retry_after_seconds` au lieu de brûler le compte lorsque la limite est tout de même atteinte.

```bash
node cli.js --count 30 --out keys.txt --proxy-file proxies.txt   # one proxy per line, rotated
node cli.js --count 1  --out keys.txt --proxy socks5://127.0.0.1:1080
```

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | clés vérifiées, une par ligne — ignoré par git, jamais commité |
| `keys.accounts.json` | enregistrements de comptes (boîte mail / utilisateur / mot de passe) — ignoré par git |
| `proxies.txt` | votre pool de sorties, un proxy par ligne — ignoré par git |
| `launcher.config.json` | ce que le lanceur mémorise — ignoré par git |
| `cli.js` · `launcher.js` · `proxy.js` | l'outil de génération, le menu interactif et la rotation de proxys |

## 🔌 Connexion à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI. BeatAPI sert du pur OpenAI à `https://api.beatapi.io/v1`, donc le connecteur enregistre **un nœud fournisseur `openai-compatible`** (préfixe `beatapi`) et attache chaque clé de `keys.txt` comme connexion — `beatapi-001`, `beatapi-002`, … Le relancer est idempotent.

```bash
node src/connect-9router.js                    # every key in keys.txt
node src/connect-9router.js --model <id>       # pin the connection's default model
```

Valeurs par défaut : `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`. Les modèles sont alors servis sous la forme `beatapi/<model id>` — `beatapi/deepseek-v4.1-flash-free`, `beatapi/gemini-3.8-flash-free`, `beatapi/glm-5.3-free`, `beatapi/gpt-6.1-sol-free` — répartis en équilibre de charge sur chaque connexion :

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<9router client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔌 Connexion à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI. Le connecteur fait le même travail ici — un nœud `openai-compatible` (préfixe `beatapi`), une connexion par clé dans `keys.txt` :

```bash
node src/connect-omniroute.js                  # every key in keys.txt
node src/connect-omniroute.js --model <id>     # pin the connection's default model
```

Valeurs par défaut : `--base http://localhost:20128`, `--password 123456`, `--name "BeatAPI"`, `--prefix beatapi`, `--base-url https://api.beatapi.io/v1`, `--model deepseek-v4.1-flash-free`.

```bash
curl http://localhost:20128/v1/chat/completions \
  -H "Authorization: Bearer sk-<omniroute client key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"beatapi/deepseek-v4.1-flash-free","messages":[{"role":"user","content":"hi"}]}'
```

## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **BeatAPI** — [beatapi.io](https://beatapi.io) |
| 🎁 Ce que le fournisseur donne | un compte neuf par clé — 43 modèles, dont 7 dans l'offre gratuite, chaque clé prouvée sur l'API du fournisseur lui-même |
| 🔑 Ce qu'une clé vous apporte | une clé API limitée à son propre compte : les 43 identifiants de modèles sur le point de terminaison ci-dessous, aux limites de votre offre. Le quota vit sur le **compte**, ce qui explique précisément pourquoi cet outil crée un compte par clé |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.beatapi.io/v1/chat/completions` |
| 🔒 Vos données | seuls beatapi.io et le backend de boîte mail que vous configurez sont contactés ; les clés restent sur votre machine |

## 🐞 Problèmes

Quelque chose a changé du côté de BeatAPI (point de terminaison, règles d'e-mail, limites) ? **[Ouvrez un ticket](../../issues)** avec la commande que vous avez exécutée et le texte exact de l'erreur. Les PR sont bienvenues.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 beatapi-bulk-apikey contributors

</div>