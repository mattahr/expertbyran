# Design: Skill-samordning mot enhetligt innehålls-API

**Datum:** 2026-06-03
**Status:** Godkänd design — redo för implementationsplan
**Scope:** `paperclip/skills/local/` (fyra skills)
**Föregående spec:** `docs/superpowers/specs/2026-06-02-content-storage-abstraction-unified-api-design.md` (web-API:et som dessa skills konsumerar — nu byggt och verifierat).

## Sammanfattning

Web-appens innehålls-API är nu enda skrivvägen för experter, expertområden och
blogginlägg. Det här arbetet samordnar paperclip-skillarna med det API:et: vi inför **en
enda självständig referens-skill `expertbyran-api`** och lägger om de tre konsumerande
skillarna att hänvisa dit (med namn, inte fil-länk) istället för att duplicera eller
felaktigt dokumentera API-mekaniken.

**Akut driver:** `expertbyran-manager` dokumenterar idag `PUT /api/v1/site-data`, som
**togs bort** i föregående arbete — skillen är därmed trasig och måste läggas om oavsett.

## Bakgrund: nuläget

- **`expertbyran-api`** — finns inte.
- **`expertbyran-manager`** — "API-version" men använder borttagna `PUT /api/v1/site-data`
  för webbdata; refererar `web/API.md` via en CI-filsökväg (`/home/runner/.../web/API.md`)
  som agenter inte kan läsa. Hanterar även `marketplace/.../EXPERT.md` och
  `expert-registry.md` via git (separat, kvar).
- **`blog-editor`** — använder `POST /api/v1/blog/posts` korrekt; refererar samma
  CI-filsökväg. Bär **superviktiga skrivregler** + `references/skrivstil.md`.
- **`webbmaster-publicering`** — placeholder-stub som definierar publiceringskontraktet
  (6 operationer) och loggar till `agents/webbmaster/publicerat.md` med idempotens via
  hashning. Väntar på en "skarp" implementation.

**Skill-upptäckt:** `.paperclip.yaml` registrerar inte enskilda skills; `skills/local/`
auto-upptäcks via SKILL.md-frontmatter (`name` + `description`). Ny skill behöver alltså
bara en korrekt SKILL.md — ingen yaml-ändring.

## Hård regel: inga länkar mellan skills

Agenterna läser **inte** andra skills via mappstruktur/filsökväg. Alla korsreferenser
uttrycks som löptext: **"läs mer i skill `<namn>`"**. `expertbyran-api` måste därför vara
**helt självständig** (kan inte hänvisa till `web/API.md`). Kritiskt återkommande innehåll
(skrivreglerna) **dupliceras inline** där det behövs snarare än länkas.

## Mål

1. En självständig, auktoritativ API-referens-skill (`expertbyran-api`).
2. `expertbyran-manager` lagad och pekad mot per-entitet-endpoints.
3. `blog-editor` avduplicerad (API-mekanik → namn-referens) med skrivreglerna bevarade.
4. `webbmaster-publicering` omskriven till en skarp, API-backad skill.
5. **Skrivreglerna lyfts på flera ställen** (se nedan).

## Skrivreglerna (kanon + spridning)

Kärnreglerna (från `blog-editor`) är:

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt, balanserat; belyser flera sidor.
- Alla påståenden/externa referenser ska ha **fotnot + URL**.
- Citat i **block quote** med angiven källa (URL).
- **Alla länkar verifieras** före publicering.
- Svenska med korrekta **å, ä, ö**.

**Spridning (duplicerat inline, eftersom agenter inte läser andra skills):**

| Skill | Skrivregler |
|-------|-------------|
| `blog-editor` | Full uppsättning + `references/skrivstil.md` (kanonisk djupversion) |
| `webbmaster-publicering` | Full kärnuppsättning inline (publicerar blogg + CV) |
| `expertbyran-manager` | Kärnuppsättning inline (skriver expertprofiler) |
| `expertbyran-api` | Koncis "Innehållsregler"-sektion (alla skribenter passerar denna) |

Var och en får en kort rad: *"Den fullständiga skrivstilen finns i skill `blog-editor`."*
(namn-referens, för djup — men kärnreglerna står inline så agenten aldrig är beroende av
att hämta dem.)

## Komponenter

### 1. `expertbyran-api` (NY)

**Plats:** `paperclip/skills/local/expertbyran-api/SKILL.md` (+ `references/payloads.md`).
**Frontmatter:** `name: expertbyran-api`, beskrivning som triggar på "hur fungerar
Expertbyråns API", "publicera till webben via API", "WEB_API_URL/WEB_API_TOKEN",
"experter/områden/blogg via API". Följer minimal frontmatter-konvention (som blog-editor).

**SKILL.md-innehåll (självständigt):**

- **Konfiguration:** `WEB_API_URL` (bas), `WEB_API_TOKEN` (Bearer för muterande anrop).
- **Konventioner:** JSON; Zod-validering vid skrivning; svenska i innehåll; felkoder
  `200/201` ok, `400` valideringsfel, `401` saknad/fel token, `404` saknas, `409` slug
  finns redan.
- **Endpoints (med curl-exempel):**
  - Experter: `GET /api/v1/experts`, `POST /api/v1/experts`,
    `GET/PUT/DELETE /api/v1/experts/[slug]`.
  - Områden: `GET /api/v1/areas`, `POST /api/v1/areas`,
    `GET/PUT/DELETE /api/v1/areas/[slug]`.
  - Blogg: `GET /api/v1/blog/posts`, `POST /api/v1/blog/posts` (body `{ post, markdown }`),
    `GET/PUT/DELETE /api/v1/blog/posts/[slug]`.
  - `GET /api/v1/site-data` — sammansatt **läs-only** snapshot (config + experter +
    områden). **Ingen PUT** (config är seed-/fil-författad, ej API-muterbar).
  - `GET /refresh` — invaliderar cachetaggar (sällan nödvändigt; skrivningar invaliderar
    själva).
- **Innehållsregler:** koncis version av skrivreglerna (se ovan) + rad om `blog-editor`.

**`references/payloads.md`:** fältscheman för `Expert`, `ExpertArea`, `BlogPostEntry`
(inkl. författarreglerna: minst en av `authorSlug`/`authorName`; `authorSlug` länkar till
expertsida; `authorRole` valfri). Detta är skillens egen referensfil (laddas av agenten som
använder skillen).

### 2. `expertbyran-manager` (FIX)

- **Ersätt** `PUT /api/v1/site-data`-flödet med per-entitet:
  - Ny expert → `POST /api/v1/experts`; uppdatera → `PUT /api/v1/experts/[slug]`;
    ta bort → `DELETE /api/v1/experts/[slug]`.
  - Områden vid behov → `POST /api/v1/areas` / `PUT|DELETE /api/v1/areas/[slug]`.
  - Ta bort "hämta hela site-data, redigera, PUT tillbaka"-mönstret.
- **Datakällor-tabellen:** raden för webbplatsdata pekar nu på per-entitet-API:et.
- **API-mekanik:** ersätt CI-filsökvägen (`/home/runner/.../web/API.md`) med *"läs mer i
  skill `expertbyran-api`"*.
- **Behåll:** `EXPERT.md` + `expert-registry.md` via git (oförändrat).
- **Ny begränsningsnotis:** organisation/site/marketplace-config är **inte** API-muterbar
  (seed/fil-författad) — skillen ska inte försöka uppdatera den via API.
- **Skrivregler:** kärnuppsättning inline + rad om `blog-editor`.

### 3. `blog-editor` (LÄNK-FIX)

- **Behåll** skrivreglerna (full) + `references/skrivstil.md` — kanonisk källa.
- **Ersätt** den inline-dokumenterade endpoint-mekaniken och CI-filsökvägen med en kort
  beskrivning (inlägg skapas via `POST /api/v1/blog/posts`) + *"läs mer i skill
  `expertbyran-api`"* för fullständig API-mekanik, payloads och fel.
- Behåll `WEB_API_URL`/`WEB_API_TOKEN`-omnämnande.

### 4. `webbmaster-publicering` (SKARP OMSKRIVNING)

Ersätt stub-skillen med en skarp som utför de 6 kontraktsoperationerna via API:et
(mekanik via *"läs mer i skill `expertbyran-api`"*):

| Operation | API-anrop |
|-----------|-----------|
| `publish-cv` (ny/ändrad expert) | `POST /api/v1/experts` (ny) eller `PUT /api/v1/experts/[slug]` |
| `delete-cv` | `DELETE /api/v1/experts/[slug]` |
| `publish-blog` | `POST /api/v1/blog/posts` |
| `update-blog` | `PUT /api/v1/blog/posts/[slug]` |
| `delete-blog` | `DELETE /api/v1/blog/posts/[slug]` |
| `get-status` | `GET /api/v1/site-data` + `GET /api/v1/blog/posts` |

- **Behåll** `agents/webbmaster/publicerat.md`-state och idempotensmodellen (hash-jämför
  CV-innehåll; skip no-ops; för blogg jämför mot publicerade slugs/`get-status`; logga
  `publiceringshistorik`) — men med **riktiga API-anrop** istället för stub-loggning.
- `stub: true` sätts **inte** för nya, skarpa publiceringar (befintliga historik-rader får
  stå kvar).
- **Ta bort** sektionerna "Stub-beteende", "När den skarpa skillen levereras" och
  "Instruktion till framtida implementerare".
- **Behåll** referenser till webbmasterns **egna** filer (`AGENTS.md`, `SOUL.md`,
  `publicerat.md`) — det är agentens egen domän, inte korsreferens till andra skills.
- **Skrivregler:** full kärnuppsättning inline + rad om `blog-editor`.
- Felhantering: hantera `401/404/409/400` från API:et och logga strukturerat i
  webbmasterns memory; idempotens innebär att en upprepad operation är en no-op.

## Icke-mål

- Ingen ändring i web-appen (API:et är klart).
- Ingen API-muterbar config (organisation/site/marketplace förblir seed-författad).
- Ingen `expertbyran-radar`-skill ännu (kommer när radar byggts).
- Ingen ändring i `.paperclip.yaml` (skills auto-upptäcks).

## Verifiering / acceptanskriterier

- `expertbyran-api/SKILL.md` finns, är självständig (inga hänvisningar till `web/API.md`
  eller externa filsökvägar), och dokumenterar alla endpoints ovan korrekt.
- Inga av de fyra skillarna innehåller `/home/runner`-sökvägar, `web/API.md`-referenser,
  fil-länkar till andra skills, eller `PUT /api/v1/site-data`.
- Alla korsreferenser är på formen "läs mer i skill `<namn>`".
- Skrivreglernas kärnuppsättning finns inline i `blog-editor`, `webbmaster-publicering`,
  `expertbyran-manager` och (koncist) `expertbyran-api`.
- `webbmaster-publicering` innehåller inga "stub"-sektioner och mappar de 6 operationerna
  till API-anrop.
- Svenska med korrekta å/ä/ö i allt innehåll.
- (Manuellt) En genomläsning bekräftar att en agent som *bara* har respektive skill +
  `expertbyran-api` kan utföra sina uppgifter utan att läsa någon annan skill-fil.

## Följdarbete (egna specar)

- `expertbyran-radar`-skill + utökning av `expertbyran-api` med radar-endpoints — när radar
  byggts i `web/`.
- Eventuell genomgång av övriga `paperclip/skills/local/`-skills som rör publicering (utöver
  dessa fyra) om sådana dyker upp.
