# Skill-samordning mot enhetligt API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inför en självständig `expertbyran-api` referens-skill och samordna `expertbyran-manager`, `blog-editor` och `webbmaster-publicering` mot det enhetliga web-API:et, utan länkar mellan skills och med skrivreglerna duplicerade inline.

**Architecture:** Fyra fristående SKILL.md-filer under `paperclip/skills/local/`. `expertbyran-api` är den enda, självständiga API-källan; övriga tre hänvisar till den med löptext ("läs mer i skill `expertbyran-api`"). Kritiska skrivregler dupliceras inline i varje innehållsproducerande skill eftersom agenter inte läser andra skills via filsökväg.

**Tech Stack:** Markdown (SKILL.md), YAML-frontmatter. Inga kodtester — verifiering sker via grep-grindar (förbjudna mönster får inte finnas) och genomläsning.

**Spec:** `docs/superpowers/specs/2026-06-03-skill-samordning-enhetligt-api-design.md`

**Bakgrundsfakta (verifierade mot det byggda web-API:et):**
- Endpoints: `GET/POST /api/v1/experts`, `GET/PUT/DELETE /api/v1/experts/[slug]`; `GET/POST /api/v1/areas`, `GET/PUT/DELETE /api/v1/areas/[slug]`; `GET/POST /api/v1/blog/posts`, `GET/PUT/DELETE /api/v1/blog/posts/[slug]`; `GET /api/v1/site-data` (läs-only, ingen PUT); `GET /refresh`.
- Auth: `Authorization: Bearer <WEB_API_TOKEN>` på muterande anrop. Felkoder: `201` skapad, `200` ok, `400` valideringsfel, `401` saknad/fel token, `404` saknas, `409` slug finns.
- Blogg-POST/PUT body: `{ "post": {…metadata}, "markdown": "…" }`.

**Shell-notis:** zsh-profilen kör en `deactivate`-hook på `cd` som skriver `cd:NN: command not found: deactivate` — ofarligt; undvik bart `cd`. Kör git som `git -C /Users/mattias/source/expertbyran ...`. Arbeta från `/Users/mattias/source/expertbyran`.

**Branch:** samma som föregående arbete (`web-uppfraschning-radar`) eller en ny — fråga inte, fortsätt på nuvarande.

---

## Filstruktur

**Skapas:**
- `paperclip/skills/local/expertbyran-api/SKILL.md` — självständig API-referens.
- `paperclip/skills/local/expertbyran-api/references/payloads.md` — fältscheman.

**Ersätts helt:**
- `paperclip/skills/local/expertbyran-manager/SKILL.md` — per-entitet-endpoints + namn-referens.
- `paperclip/skills/local/webbmaster-publicering/SKILL.md` — skarp, API-backad.

**Redigeras:**
- `paperclip/skills/local/blog-editor/SKILL.md` — API-mekanik → namn-referens; skrivregler kvar.

**Återanvänt textblock (skrivregler):** identiskt block dupliceras i Task 1, 2, 3, 4 (avsiktligt — agenter läser inte andra skills).

---

## Task 1: Ny skill `expertbyran-api`

**Files:**
- Create: `paperclip/skills/local/expertbyran-api/SKILL.md`
- Create: `paperclip/skills/local/expertbyran-api/references/payloads.md`

- [ ] **Step 1: Skapa `paperclip/skills/local/expertbyran-api/SKILL.md` med exakt detta innehåll:**

````markdown
---
name: expertbyran-api
description: "Hur Expertbyråns webb-API fungerar och används — den enda källan för att läsa och skriva innehåll (experter, expertområden, blogginlägg) via REST. Använd denna skill när du ska publicera eller uppdatera innehåll på Expertbyråns webbplats via API, slå upp endpoints, payloads, autentisering (WEB_API_URL/WEB_API_TOKEN) eller felkoder. Andra skills hänvisar hit för API-mekaniken."
---

# Expertbyrån API — referens

Detta är den **enda källan** för hur Expertbyråns webb-API fungerar. Andra skills hänvisar
hit ("läs mer i skill `expertbyran-api`") i stället för att duplicera API-mekaniken.

API:et är **enda sättet** att mutera innehåll (experter, expertområden, blogginlägg).
Konfigurationsdata (site/organisation/marketplace) är seed-/fil-författad och kan **inte**
muteras via API.

## Konfiguration

- `WEB_API_URL` — basadress till webbappen (ex: `http://localhost:3000`).
- `WEB_API_TOKEN` — token som skickas som `Authorization: Bearer <token>` vid muterande
  anrop (POST/PUT/DELETE). Läsanrop (GET) kräver ingen token.

## Konventioner

- All data är JSON och valideras med Zod vid skrivning.
- Innehåll skrivs på svenska med korrekta å, ä, ö.
- Slug måste matcha `^[a-z0-9-]+$`.
- Felkoder: `200` OK, `201` skapad, `400` valideringsfel, `401` saknad/fel token,
  `404` finns inte, `409` slug finns redan.

## Endpoints

### Experter
- `GET /api/v1/experts` → `{ "experts": [ … ] }`
- `POST /api/v1/experts` (auth) — body: ett Expert-objekt. `201` / `409` om slug finns.
- `GET /api/v1/experts/{slug}` → Expert-objektet, `404` om saknas.
- `PUT /api/v1/experts/{slug}` (auth) — body: hela Expert-objektet. `404`/`409`.
- `DELETE /api/v1/experts/{slug}` (auth) — `404` om saknas.

### Expertområden
- `GET /api/v1/areas` → `{ "areas": [ … ] }`
- `POST /api/v1/areas` (auth) — body: ett ExpertArea-objekt. `201` / `409`.
- `GET /api/v1/areas/{slug}` → ExpertArea, `404` om saknas.
- `PUT /api/v1/areas/{slug}` (auth) — body: hela ExpertArea-objektet. `404`/`409`.
- `DELETE /api/v1/areas/{slug}` (auth) — `404` om saknas.

### Blogginlägg
- `GET /api/v1/blog/posts` → `{ "posts": [ …metadata ] }`
- `POST /api/v1/blog/posts` (auth) — body: `{ "post": {…metadata}, "markdown": "…" }`.
  `201` / `409`.
- `GET /api/v1/blog/posts/{slug}` → `{ "post": {…}, "markdown": "…" }`, `404` om saknas.
- `PUT /api/v1/blog/posts/{slug}` (auth) — body: `{ "post"?: {…}, "markdown"?: "…" }`
  (metadata, markdown, eller båda). `404`/`409`.
- `DELETE /api/v1/blog/posts/{slug}` (auth) — `404` om saknas.

### Sammansatt snapshot & cache
- `GET /api/v1/site-data` → hela den sammansatta snapshoten (config + experter + områden).
  **Läs-only — ingen PUT.**
- `GET /refresh` → invaliderar cachetaggarna (`experts`, `areas`, `blog`). Behövs sällan,
  eftersom skrivanrop invaliderar cachen automatiskt.

Fältscheman för Expert, ExpertArea och BlogPostEntry finns i `references/payloads.md`.

## Exempel (curl)

Skapa en expert:
```bash
curl -X POST "$WEB_API_URL/api/v1/experts" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @expert.json
```

Uppdatera ett område:
```bash
curl -X PUT "$WEB_API_URL/api/v1/areas/revisionsmetodik" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @area.json
```

Skapa ett blogginlägg:
```bash
curl -X POST "$WEB_API_URL/api/v1/blog/posts" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post": {
      "slug": "mitt-inlagg",
      "title": "Mitt inlägg",
      "date": "2026-04-15T10:00:00.000Z",
      "authorSlug": "effektivitetsrevisor",
      "areaSlugs": ["revisionsmetodik"],
      "excerpt": "Kort sammanfattning."
    },
    "markdown": "# Rubrik\n\nInnehåll…"
  }'
```

Ta bort ett inlägg:
```bash
curl -X DELETE "$WEB_API_URL/api/v1/blog/posts/mitt-inlagg" \
  -H "Authorization: Bearer $WEB_API_TOKEN"
```

## Innehållsregler (skrivregler)

Dessa gäller allt innehåll som publiceras via API:et:

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.
````

- [ ] **Step 2: Skapa `paperclip/skills/local/expertbyran-api/references/payloads.md` med exakt detta innehåll:**

````markdown
# Payloads — fältscheman

Alla skrivanrop validderas med Zod. Slug matchar `^[a-z0-9-]+$`. Datum är ISO 8601
(t.ex. `2026-04-15T10:00:00.000Z`).

## Expert

| Fält | Typ | Not |
|------|-----|-----|
| `id` | string | unikt |
| `slug` | string (slug) | unikt |
| `sortOrder` | heltal ≥ 0 | sorteringsordning |
| `featured` | boolean | utvald på startsidan |
| `name` | string | |
| `role` | string | |
| `location` | string | |
| `availability` | string | |
| `areaSlugs` | string[] (slug), ≥ 1 | måste matcha befintliga områden |
| `summary` | string | |
| `profileQuote` | string | |
| `strengths` | string[] ≥ 3 | |
| `metrics` | `{label, value, description?}`[] ≥ 2 | |
| `selectedEngagements` | `{title, client, period, summary, impact}`[] ≥ 2 | |
| `experience` | `{title, organization, period, summary}`[] ≥ 2 | |
| `knowledge` | string[] ≥ 1 | |
| `capabilities` | string[] ≥ 1 | |
| `tools` | string[] ≥ 3 | |
| `methods` | string[] ≥ 3 | |
| `contactLinks` | `{id, label, type, url, description}`[] ≥ 2 | `type` ∈ email/calendar/linkedin/website; email-url måste börja med `mailto:`, övriga med `http(s)://` |

## ExpertArea

| Fält | Typ | Not |
|------|-----|-----|
| `id` | string | unikt |
| `slug` | string (slug) | unikt |
| `sortOrder` | heltal ≥ 0 | |
| `featured` | boolean | |
| `accent` | string | hex-färg `#rrggbb` |
| `name` | string | |
| `shortDescription` | string | |
| `description` | string | |
| `signals` | string[] ≥ 2 | när området används |
| `deliverables` | string[] ≥ 2 | typiska leverabler |

## BlogPostEntry (metadata)

| Fält | Typ | Not |
|------|-----|-----|
| `slug` | string (slug) | unikt |
| `title` | string | |
| `date` | ISO 8601 | |
| `authorSlug` | string (slug), valfri | om den matchar en expert länkas inlägget till expertsidan |
| `authorName` | string, valfri | visningsnamn; krävs när `authorSlug` saknas/inte matchar |
| `authorRole` | string, valfri | fri roll-text |
| `areaSlugs` | string[] (slug) ≥ 1 | |
| `excerpt` | string | sammanfattning för listningen |

**Författarregel:** minst en av `authorSlug` och `authorName` måste anges. Markdown skickas
separat (fältet `markdown` i POST/PUT-body), inte i metadata-objektet.
````

- [ ] **Step 3: Verifiera att skillen är självständig (inga förbjudna referenser)**

Run: `grep -rn "home/runner\|web/API.md\|](\.\./" paperclip/skills/local/expertbyran-api/`
Expected: NO matches (inga CI-sökvägar, inga `web/API.md`-referenser, inga relativa fil-länkar).

- [ ] **Step 4: Commit**

```bash
git -C /Users/mattias/source/expertbyran add paperclip/skills/local/expertbyran-api/
git -C /Users/mattias/source/expertbyran commit -m "feat(skills): ny självständig expertbyran-api referens-skill"
```

---

## Task 2: Lägg om `expertbyran-manager`

**Files:**
- Modify (ersätt hela filen): `paperclip/skills/local/expertbyran-manager/SKILL.md`

Den nuvarande filen dokumenterar borttagna `PUT /api/v1/site-data` och en CI-filsökväg.
Ersätt hela innehållet.

- [ ] **Step 1: Ersätt `paperclip/skills/local/expertbyran-manager/SKILL.md` med exakt detta innehåll:**

````markdown
---
name: expertbyran-manager
description: "Hantera Expertbyråns monorepo (mattahr/expertbyran) — lägg till och uppdatera experter och expertområden via web-API:et, och håll marketplace-pluginens EXPERT.md och expert-registry i synk via git. Använd denna skill för att underhålla Expertbyrån-pluginen, lägga till nya konsulter, uppdatera profiler eller ändra expertregistret."
---

# Expertbyrån Manager

Du underhåller monorepot `mattahr/expertbyran`. Två spår:

1. **Webbplatsdata (experter, expertområden)** — uppdateras via **web-API:et**.
2. **Marketplace-pluginen** (`marketplace/experts/[slug]/EXPERT.md` och
   `marketplace/skills/konsultchef/expert-registry.md`) — uppdateras via **git-commit/PR**.

## Webbplatsdata via API

API:et är **enda sättet** att mutera experter och områden. För hur API:et fungerar
(autentisering, endpoints, payloads, felkoder, curl-exempel) — **läs mer i skill
`expertbyran-api`**.

Kortfattat:
- Ny expert → `POST /api/v1/experts`. Uppdatera → `PUT /api/v1/experts/{slug}`.
  Ta bort → `DELETE /api/v1/experts/{slug}`.
- Områden (sällan) → `POST /api/v1/areas`, `PUT|DELETE /api/v1/areas/{slug}`.
- Läs nuvarande data → `GET /api/v1/experts`, `GET /api/v1/areas` eller hela snapshoten
  via `GET /api/v1/site-data`.

**Begränsning:** organisation/site/marketplace-config är seed-/fil-författad och kan **inte**
muteras via API — försök inte uppdatera den via API:et.

## Marketplace-pluginen via git

| Källa | Syfte | Metod |
|-------|-------|-------|
| `marketplace/experts/[slug]/EXPERT.md` | Expertens identitet och metodik | Git-commit/PR |
| `marketplace/skills/konsultchef/expert-registry.md` | Kompakt register för routing | Git-commit/PR |

Följ samma validering och PR-process som tidigare för marketplace-filerna (se
`SKILL.md.backup` för den fullständiga EXPERT.md-/registry-processen).

## Arbetsflöde för en ny/ändrad expert

1. Skapa/uppdatera experten via API:et (se skill `expertbyran-api`).
2. Skapa/uppdatera `EXPERT.md` och `expert-registry.md` och committa via PR.
3. Verifiera att slug är konsekvent mellan API-data, EXPERT.md och registret.

## Innehållsregler (skrivregler)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.
````

- [ ] **Step 2: Verifiera att förbjudna mönster är borta**

Run: `grep -n "PUT /api/v1/site-data\|home/runner\|web/API.md" paperclip/skills/local/expertbyran-manager/SKILL.md`
Expected: NO matches.

- [ ] **Step 3: Commit**

```bash
git -C /Users/mattias/source/expertbyran add paperclip/skills/local/expertbyran-manager/SKILL.md
git -C /Users/mattias/source/expertbyran commit -m "fix(skills): expertbyran-manager använder per-entitet-endpoints + hänvisar till expertbyran-api"
```

---

## Task 3: Avduplicera `blog-editor`

**Files:**
- Modify (ersätt hela filen): `paperclip/skills/local/blog-editor/SKILL.md`

Behåll skrivreglerna (de är superviktiga) och `references/skrivstil.md` (orörd). Ersätt
endast API-mekaniken och CI-filsökvägen med en namn-referens.

- [ ] **Step 1: Ersätt `paperclip/skills/local/blog-editor/SKILL.md` med exakt detta innehåll:**

````markdown
---
name: blog-editor
description: "Skapa och hantera blogginlägg på Expertbyråns webbplats via API. Använd denna skill när du vill publicera ett nytt blogginlägg, redigera befintliga, eller hantera bloggkatalogen. API:et hanterar både metadata och markdown automatiskt."
---

# Blog Editor — Expertbyråns blogg

Du skapar och redigerar blogginlägg för Expertbyråns webbplats via web-API:et — inga
git-commits behövs, API:et hanterar lagringen.

## API

Inlägg skapas via `POST /api/v1/blog/posts` (body `{ post, markdown }`) och redigeras/tas
bort via `PUT`/`DELETE /api/v1/blog/posts/{slug}`. För fullständig API-mekanik —
autentisering (`WEB_API_URL`/`WEB_API_TOKEN`), payloads, felkoder och exempel — **läs mer i
skill `expertbyran-api`**.

Snabbnoteringar:
- Sluggen måste vara unik — API:et returnerar `409 Conflict` om den redan finns.
- Minst en av `authorSlug` och `authorName` måste anges (se payload-reglerna i skill
  `expertbyran-api`).

## Skrivregler (superviktiga)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med en egen uppfattning.
- Vi skriver alltid transparent, neutralt och balanserat och belyser flera sidor.
- Alla påståenden eller referenser till extern kunskap ska **alltid** ha en **fotnot med
  URL**.
- Använd **block quote** för citat och ange källa med URL.
- **Alla länkar verifieras** — innan publicering ska ALLA länkar och referenser som använts
  i inlägget dubbelkollas.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i `references/skrivstil.md` i denna skill.
````

- [ ] **Step 2: Verifiera att `skrivstil.md` är orörd och förbjudna mönster är borta**

Run: `ls paperclip/skills/local/blog-editor/references/skrivstil.md && grep -n "home/runner\|web/API.md" paperclip/skills/local/blog-editor/SKILL.md`
Expected: `skrivstil.md` listas; INGA grep-matchningar.

- [ ] **Step 3: Commit**

```bash
git -C /Users/mattias/source/expertbyran add paperclip/skills/local/blog-editor/SKILL.md
git -C /Users/mattias/source/expertbyran commit -m "refactor(skills): blog-editor hänvisar API-mekanik till expertbyran-api, behåller skrivregler"
```

---

## Task 4: Skarp omskrivning av `webbmaster-publicering`

**Files:**
- Modify (ersätt hela filen): `paperclip/skills/local/webbmaster-publicering/SKILL.md`

Ersätt placeholder-stuben med en skarp, API-backad skill. Behåll `publicerat.md`-state och
idempotensmodellen, men med riktiga API-anrop. Ta bort alla stub-sektioner.

- [ ] **Step 1: Ersätt `paperclip/skills/local/webbmaster-publicering/SKILL.md` med exakt detta innehåll:**

````markdown
---
name: webbmaster-publicering
description: "Webbmasterns publicering till Expertbyråns webbplats via API. Använd denna skill för att publicera och uppdatera expert-CV:n och blogginlägg på den publika webbplatsen och hålla webbmasterns publicerat.md-tillstånd i synk. Operationerna är idempotenta."
---

# Webbmaster-publicering

Du publicerar webbmasterns innehåll till Expertbyråns publika webbplats via web-API:et.
För hur API:et fungerar (autentisering `WEB_API_URL`/`WEB_API_TOKEN`, endpoints, payloads,
felkoder, curl-exempel) — **läs mer i skill `expertbyran-api`**.

Alla operationer är **idempotenta**: samma operation två gånger ska vara en no-op. Tillstånd
hålls i `agents/webbmaster/publicerat.md`.

## Kontraktsoperationer → API

| Operation | API-anrop |
|-----------|-----------|
| `publish-cv` (ny expert) | `POST /api/v1/experts` |
| `publish-cv` (ändrad expert) | `PUT /api/v1/experts/{slug}` |
| `delete-cv` | `DELETE /api/v1/experts/{slug}` |
| `publish-blog` | `POST /api/v1/blog/posts` |
| `update-blog` | `PUT /api/v1/blog/posts/{slug}` |
| `delete-blog` | `DELETE /api/v1/blog/posts/{slug}` |
| `get-status` | `GET /api/v1/site-data` + `GET /api/v1/blog/posts` |

## Idempotens

### publish-cv
1. Bygg expertens CV-payload (se fältschema i skill `expertbyran-api`).
2. Beräkna en hash av CV-innehållet (normalisera whitespace, exkludera `senast_uppdaterad`).
3. Jämför med `cv_hashar[<slug>]` i `publicerat.md`.
4. Oförändrad hash → skip (no-op).
5. Ny/ändrad hash:
   - Finns experten redan (`GET /api/v1/experts/{slug}` ≠ 404)? → `PUT`. Annars → `POST`.
   - Uppdatera `cv_hashar[<slug>]` och lägg rad i `publiceringshistorik` i `publicerat.md`.

### publish-blog / update-blog
1. Kontrollera om sluggen finns via `get-status` (`GET /api/v1/blog/posts`).
2. Finns den inte → `POST /api/v1/blog/posts`. Finns den → `PUT /api/v1/blog/posts/{slug}`.
3. Lägg/uppdatera raden i `publicerade_inlagg` och `publiceringshistorik`.

### delete-cv / delete-blog
1. `DELETE` mot rätt endpoint. `404` behandlas som redan borttaget (no-op).
2. Ta bort posten ur `publicerat.md` och logga i `publiceringshistorik`.

## Felhantering

- `401` → token saknas/fel; avbryt och logga i webbmasterns memory.
- `409` (slug finns) vid `POST` → byt till `PUT` mot samma slug.
- `404` vid `PUT`/`DELETE` → posten finns inte; för delete = no-op, för put = skapa via POST.
- `400` → valideringsfel; logga fältfelen och korrigera payloaden.

Logga varje skarp operation i `agents/webbmaster/memory/YYYY-MM-DD.md`.

## publicerat.md-format

Webbmastern underhåller `agents/webbmaster/publicerat.md`:

```yaml
---
type: "webmaster-state"
senast_uppdaterad: "2026-04-12T14:32:00"
---

# Publicerat tillstånd

cv_hashar:
  effektivitetsrevisor: "a1b2c3d4…"

publicerade_inlagg:
  - id: "blog-2026-04-12-lss-triangulering"
    titel: "Ny specialisering: LSS-triangulering"
    datum: "2026-04-12"
    författare: "Dr Karin Bergström"

publiceringshistorik:
  - datum: "2026-04-12T14:32:00"
    operation: "publish-cv"
    target: "expert-valfard"
```

(Fältet `stub: true` används inte längre för skarpa publiceringar; äldre historik-rader får
stå kvar.)

## Innehållsregler (skrivregler)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.

## Referenser (webbmasterns egna filer)

- `agents/webbmaster/AGENTS.md` — webbmasterns roll
- `agents/webbmaster/SOUL.md` — redaktionell röst
- `agents/webbmaster/publicerat.md` — state-fil
````

- [ ] **Step 2: Verifiera att stub-sektioner och förbjudna mönster är borta**

Run: `grep -n "STUB\|stub-beteende\|placeholder\|home/runner\|web/API.md\|skarpa skillen" paperclip/skills/local/webbmaster-publicering/SKILL.md`
Expected: NO matches (möjligt undantag: ordet "skarp" i annan kontext är OK; det får INTE stå "skarpa skillen", "STUB", "placeholder" eller "stub-beteende").

- [ ] **Step 3: Commit**

```bash
git -C /Users/mattias/source/expertbyran add paperclip/skills/local/webbmaster-publicering/SKILL.md
git -C /Users/mattias/source/expertbyran commit -m "feat(skills): skarp webbmaster-publicering via API (ersätter placeholder-stub)"
```

---

## Task 5: Holistisk verifiering över alla fyra skills

**Files:** (ingen ändring — endast verifiering; ev. fixar committas)

- [ ] **Step 1: Inga fil-länkar/CI-sökvägar mellan skills**

Run:
```bash
grep -rn "home/runner\|web/API.md" paperclip/skills/local/expertbyran-api paperclip/skills/local/expertbyran-manager paperclip/skills/local/blog-editor paperclip/skills/local/webbmaster-publicering
```
Expected: NO matches.

- [ ] **Step 2: Inga markdown-länkar till andra skills (endast namn-referenser tillåtna)**

Run:
```bash
grep -rnE "\]\(\.\.|\]\([^)]*SKILL\.md|läs mer i skill" paperclip/skills/local/expertbyran-manager/SKILL.md paperclip/skills/local/blog-editor/SKILL.md paperclip/skills/local/webbmaster-publicering/SKILL.md
```
Expected: Endast träffar på `läs mer i skill` (löptext). INGA `](..`- eller `](…SKILL.md`-länkar.

- [ ] **Step 3: `PUT /api/v1/site-data` finns ingenstans**

Run: `grep -rn "PUT /api/v1/site-data\|PUT.*site-data" paperclip/skills/local/`
Expected: NO matches.

- [ ] **Step 4: Skrivreglernas kärna finns i alla fyra**

Run: `grep -rln "röjer .*aldrig.*kunders\|aldrig.*kunders identitet\|röjer ALDRIG\|röjer aldrig" paperclip/skills/local/expertbyran-api paperclip/skills/local/expertbyran-manager paperclip/skills/local/blog-editor paperclip/skills/local/webbmaster-publicering`
Expected: alla fyra SKILL.md-filer listas (skrivregeln om kundidentitet finns i var och en).

- [ ] **Step 5: Manuell genomläsning**

Läs varje SKILL.md och bekräfta: (a) en agent med bara den skillen + `expertbyran-api` kan
utföra sina uppgifter; (b) endpoints stämmer med skill `expertbyran-api`; (c) svenska
å/ä/ö är korrekt; (d) inga kvarvarande hänvisningar till borttagen funktionalitet.

- [ ] **Step 6: Commit (om någon fix gjordes)**

```bash
git -C /Users/mattias/source/expertbyran add paperclip/skills/local/
git -C /Users/mattias/source/expertbyran commit -m "chore(skills): verifiering av skill-samordning mot expertbyran-api"
```

---

## Self-review (utförd vid planskrivning)

**Spec-täckning:**
- `expertbyran-api` (ny, självständig, endpoints + payloads + innehållsregler) → Task 1.
- `expertbyran-manager` fix (per-entitet-endpoints, begränsningsnotis, namn-referens,
  EXPERT.md/registry kvar) → Task 2.
- `blog-editor` avduplicering (namn-referens, skrivregler + skrivstil.md kvar) → Task 3.
- `webbmaster-publicering` skarp omskrivning (6 operationer → API, idempotens/publicerat.md,
  stub borttaget) → Task 4.
- Skrivregler på flera ställen → Task 1, 2, 3, 4 (inline) + verifiering Task 5 Step 4.
- Inga länkar mellan skills / inga `home/runner`/`web/API.md`/`PUT site-data` → verifiering
  Task 5 Steps 1–3.

**Placeholder-scan:** Inga TBD/TODO; allt skill-innehåll är komplett och inklistringsbart.

**Konsistens:** Endpoints, payload-fält och felkoder är identiska mellan `expertbyran-api`
(Task 1) och hänvisningarna i Task 2–4. Skrivregel-blocket är identiskt formulerat i Task
1, 2, 4 och i blog-editor-varianten (Task 3) som dessutom pekar på `skrivstil.md`.
