# Arkitektur

## Översikt

Expertbyrån är en enkel Next.js-applikation med en enda roll:

- publik webb på port `3000`

Allt innehåll nås via en lagringsabstraktion och valideras med Zod. Innehåll muteras enbart via webbappens REST API; en autentiserad route (`GET /refresh`) finns för att tvinga cacheinvalidering.

## Huvuddelar

### 1. Publik katalog

Publika sidor renderar:

- startsida
- om-sida
- expertområden
- expertsidor
- marknadsplatssida

Katalogen visar både mänsklig information och pluginmetadata.

### 2. Innehållslager

Innehåll nås via en **lagringsabstraktion** med fem gränssnitt bakom en gemensam kompositionsrot:

- `ConfigStore` — site/organization/marketplace (bundlad i imagen via `src/config/site-config.json`, ej muterbar via API)
- `ContentStore` — experter och expertområden
- `BlogStore` — blogginlägg (metadata + markdown + renderad HTML)
- `RadarStore` — radarer (metadata + blips)
- `ForesightStore` — foresights (metadata + markdown + renderad HTML)

Innehållet lagras i **SQLite** via Nodes inbyggda `node:sqlite` — DB-fil `${DATA_DIR}/expertbyran.db` i WAL-läge med tabellerna `blog_posts`, `blog_post_areas`, `foresights`, `radars`, `experts`, `expert_areas` och `schema_migrations`. Migreringar körs automatiskt vid serverstart (`src/lib/db/migrations.ts` via `src/instrumentation.ts`). Konsumenter rör aldrig databasen direkt. All data valideras med Zod.

Markdown renderas till HTML **vid skrivning** och lagras i en `html`-kolumn med `renderer_version`; läsvägen serverar färdig HTML. `POST /api/v1/rerender` (bearer-auth) renderar om rader med äldre renderarversion — serverstarten loggar en varning om sådana finns.

Den **enda** skrivvägen för innehåll är REST API:et (`/api/v1/...`). Cachning sker i webblagret via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `config`, `blog`, `radar`, `foresight`); API:et invaliderar berörda taggar med `revalidateTag(tag, "max")` efter skrivningar.

Det finns **inga seeds**: en nyinstallation startar med tom databas och sidorna visar tomlägen. Vid första start mot en volym med det gamla filbaserade formatet importeras innehållet automatiskt till SQLite (validera → rendera → importera → verifiera antal → döp om källfilerna till `*.imported`); misslyckas importen avbryts uppstarten. Nödventil: `SKIP_LEGACY_IMPORT=1`.

### 3. Marketplace-källor

Snapshoten `site-data.json` ligger i samma monorepo som webbappen (`mattahr/expertbyran`) under `web/site-data.json`. Marknadsplatsreferensen pekar också på samma repo:

- snapshot repository: `https://github.com/mattahr/expertbyran` (monorepo — webbapp, marketplace-plugin och snapshot)
- marketplace repository: `https://github.com/mattahr/expertbyran`
- marketplace.json: `https://raw.githubusercontent.com/mattahr/expertbyran/main/.claude-plugin/marketplace.json`

Webbappen håller bara referenser till dessa källor — den läser inte `web/site-data.json`; filen underhålls som marketplace-synkad presentationsdata medan webbens innehåll bor i SQLite och muteras via API:et.

## Dataflöde

**Inget innehåll prerendras vid build.** Alla innehållssidor (`/`, `/blogg`, `/blogg/[slug]`, `/foresight`, `/foresight/[slug]`, `/radar`, `/radar/[slug]`, `/experter`, `/experter/[slug]`, `/expertomraden`, `/expertomraden/[slug]`, `/marknadsplats`) är `force-dynamic` och renderas on-demand mot datacachen — det eliminerar stale build-snapshots efter containeromstart. `/blogg` och `/foresight` pagineras med `?sida=` (24 per sida); `/blogg` har områdesfilter `?omrade=` (SQL-baserat).

Läsväg:

1. En request kommer in till webbappen.
2. Sidan läser innehåll via lagringsabstraktionen, inpackad i `unstable_cache` med taggar (`experts`, `areas`, `config`, `blog`, `radar`, `foresight`).
3. Vid cache-träff returneras cachat resultat; annars läser stores från SQLite-databasen och resultatet valideras med Zod. Blogg- och foresight-sidor serverar färdigrenderad HTML från databasen.
4. Sidan renderas.

Skrivväg:

1. Ett muterande anrop går till REST API:et (`/api/v1/...`) med `API_TOKEN`.
2. Markdown renderas till HTML; stores skriver till SQLite efter Zod-validering.
3. API:et invaliderar berörda taggar med `revalidateTag(tag, "max")`.

`GET /refresh` invaliderar alla innehållstaggar och tvingar därmed omläsning vid nästa request. Den kräver bearer-token (samma `API_TOKEN` som skrivvägen); taggarna härleds från modulernas konstanter.

## Publika schemafiler

Webbappen exponerar två publika schemafiler under `/schemas/`:

- `/schemas/site-data.schema.json`
- `/schemas/plugin-sync.schema.json`

De genereras från samma Zod-källa som webbappen använder vid runtime.
