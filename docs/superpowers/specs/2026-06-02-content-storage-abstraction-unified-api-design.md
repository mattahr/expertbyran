# Design: Lagringsabstraktion + enhetligt innehålls-API (web/)

**Datum:** 2026-06-02
**Status:** Godkänd design — redo för implementationsplan
**Scope:** `web/` (Expertbyråns publika Next.js-webbplats)

## Sammanfattning

Vi inför ett **lagringsabstraktionslager** som helt döljer att innehåll idag lagras i
JSON- och markdown-filer, och gör **REST-API:et till enda vägen att skriva innehåll**.
Konsumenter (sidor, query-helpers, API-routes) talar bara mot tydliga gränssnitt och vet
inte vilken backend som används. Fil-backend behålls nu; en riktig databas kan kopplas in
senare **utan att röra någon konsument**.

Detta var ursprungligen tänkt som en databasmigrering, men vi landade i att det verkliga
värdet är *abstraktion + en enda skrivväg*, inte databasen i sig. Databasen blir ett
framtida, inkapslat implementationsval.

## Bakgrund: nuläget

- **Innehåll = filer på disk** i `DATA_DIR`:
  - `site-data.json` — `version`, `updatedAt`, `site`, `organization`, `marketplace`,
    `expertAreas[]`, `experts[]`.
  - `blog-data.json` — inläggsmetadata (katalog).
  - `blog/posts/*.md` — markdown per inlägg.
- **Två läslägen** (spretigt): `api` (läs från disk via `disk-storage.ts`) **eller** URL
  (hämta `site-data.json`/`blog-data.json`/markdown från GitHub raw). Default i koden är
  faktiskt GitHub-raw-URL:en.
- **Skrivflöde:** API-routes (`/api/v1/...`) läser hela `site-data.json`, muterar i minnet
  och skriver tillbaka **hela filen** (read-modify-write på hela blobben). Auth via
  `API_TOKEN` (Bearer).
- **Cache:** in-memory i `content/store.ts` och `blog/store.ts` med TTL
  (`SITE_DATA_REVALIDATE_SECONDS`), plus fallback till senast cacheade snapshot.
- **Seeding:** `instrumentation.ts` → `seed.ts` kopierar seed-filer till `DATA_DIR` om tomt.
- **Drift:** en Docker-container (standalone, distroless) med en monterad volym för data.
- **Validering:** Zod överallt; publika JSON-schemafiler exponeras under `/schemas/`.
- **Författande idag:** experter/områden underhålls av `expertbyran-manager`-skillen som
  redigerar `site-data.json` **direkt** (git). Blogg skapas via API:et av `blog-editor`-skillen.

## Mål

1. **Total abstraktion** av lagringen bakom tydliga gränssnitt — inga konsumenter rör filer.
2. **API:et är enda skrivvägen** för innehåll (experter, områden, blogg).
3. **En läsväg** — pensionera GitHub-raw/URL-läget.
4. **Bytbar backend** — en DB-implementation ska kunna kopplas in senare utan att röra
   konsumenter.
5. **Förbered för Radar** så att en framtida radar-funktion slottar in som en upprepning av
   bloggmönstret.

## Icke-mål (uttryckligen utanför denna spec)

- Att faktiskt byta till en databas (filer förblir backend nu).
- Att bygga Radar-funktionaliteten (endast förbereda).
- Site/`organization`/`marketplace`-config flyttas **inte** — den förblir JSON (config,
  inte "content").
- Att bygga ett admin-UI.
- Skill-arbetet (`expertbyran-api` m.fl.) — se "Följdarbete"; egna specar.

## Arkitektur

### Tre gränssnitt (+ ett förberett)

Placeras i `src/lib/stores/`. Typerna `Expert`, `ExpertArea` kommer från
`@/lib/content/schema`; `BlogPostMeta`, `BlogCatalog` från `@/lib/blog/schema`.

#### `ConfigStore` (read-only)

Den del av `site-data.json` som **stannar** som JSON.

```ts
interface ConfigStore {
  getSiteConfig(): Promise<SiteConfig>; // { version, updatedAt, site, organization, marketplace }
}
```

#### `ContentStore` (läs + skriv) — experter och områden

De delar fil och hör domänmässigt ihop.

```ts
interface ContentStore {
  listExperts(): Promise<Expert[]>;
  getExpert(slug: string): Promise<Expert | null>;
  createExpert(expert: Expert): Promise<Expert>;           // 409 om slug finns
  updateExpert(slug: string, expert: Expert): Promise<Expert>;
  deleteExpert(slug: string): Promise<void>;

  listAreas(): Promise<ExpertArea[]>;
  getArea(slug: string): Promise<ExpertArea | null>;
  createArea(area: ExpertArea): Promise<ExpertArea>;
  updateArea(slug: string, area: ExpertArea): Promise<ExpertArea>;
  deleteArea(slug: string): Promise<void>;
}
```

#### `BlogStore` (läs + skriv)

Markdown lagras rått; HTML-rendering ligger i query-lagret ovanpå, inte i storen.

```ts
interface BlogStore {
  listPosts(): Promise<BlogPostMeta[]>;
  getPost(slug: string): Promise<{ meta: BlogPostMeta; markdown: string } | null>;
  createPost(meta: BlogPostMeta, markdown: string): Promise<BlogPostMeta>; // 409 om slug finns
  updatePost(slug: string, patch: { meta?: BlogPostMeta; markdown?: string }): Promise<BlogPostMeta>;
  deletePost(slug: string): Promise<void>;
}
```

#### `RadarStore` (förberett — implementeras senare)

Skissas i specen (se "Radar-förberedelse"), byggs inte nu:

```ts
interface RadarStore {
  listRadars(): Promise<RadarMeta[]>;
  getRadar(slug: string): Promise<Radar | null>;
  createRadar(radar: Radar): Promise<RadarMeta>;
  updateRadar(slug: string, radar: Radar): Promise<RadarMeta>;
  deleteRadar(slug: string): Promise<void>;
}
```

### Fil-implementationer

Behåller dagens filformat — ingen omstrukturering av data behövs; abstraktionen döljer
mekaniken. Nuvarande `disk-storage.ts` blir den **interna motorn** bakom implementationerna:

- `FileContentStore` läser/skriver `experts[]` och `expertAreas[]` inuti `site-data.json`
  (read-modify-write inkapslat; `site`/`organization`/`marketplace`/`version`/`updatedAt`
  rörs inte vid innehållsskrivningar, utom `updatedAt` som bumpas).
- `FileBlogStore` läser/skriver `blog-data.json` + `blog/posts/*.md`.
- `FileConfigStore` läser config-delen av `site-data.json`.

Storarna är **rena** (ingen egen cache) — caching sköts i web-lagret (se nedan).

### Composition root + konsumtion

En enda plats — `src/lib/stores/index.ts` — väljer implementation (fil nu; DB senare via
flagga/env) och exponerar `getContentStore()`, `getBlogStore()`, `getConfigStore()`.

Befintliga query-helpers skrivs om till att **komponera** från storarna och bevarar sina
signaturer och typer, så att **sidorna ändras minimalt**:
- `getSiteData()` = `ConfigStore.getSiteConfig()` + `ContentStore.listExperts()/listAreas()`
  satt i samma `SiteData`-form som idag.
- `getOrderedSiteData`, `getAreasForExpert`, `getFeaturedExperts`,
  `getFeaturedExpertAreas` — oförändrade signaturer, byggda ovanpå storarna.
- `getBlogData()` / bloggens query-lager — läser via `BlogStore`, renderar markdown→HTML
  som idag.

### Cache & invalidering

- **Cachen flyttas ut ur lagret** och in i **web-lagret**: query-helpers wrappar läsningar i
  Next 16:s cache (`'use cache'`/`unstable_cache`) med en **tagg per innehållstyp**:
  `experts`, `areas`, `blog` (och senare `radar`).
- **Invalideringen ägs av API:et** (enda skrivvägen): efter varje lyckad write anropar
  API-routen `revalidateTag('experts')` / `'areas'` / `'blog'`. Detta ger
  "cache-invalidering så nära API:et som möjligt", medan själva cachen bor i web.
- `SITE_DATA_REVALIDATE_SECONDS`/TTL och fallback-till-cache-vid-fetchfel **utgår**
  (ingen fjärrhämtning kvar). `/refresh` görs om till en endpoint som invaliderar alla
  innehållstaggar (`experts`, `areas`, `blog`) — en manuell cache-bust.
- `vitest.setup.ts` mockar redan `next/cache` (`unstable_cache` passthrough,
  `revalidateTag` stub) — cache-lagret är därmed testbart.

### API = enda skrivvägen

- Alla API-routes pekas om till storarna istället för `disk-storage` direkt.
- Experter har redan CRUD-endpoints. **Nya `/api/v1/areas`-endpoints läggs till**
  (GET lista, POST, GET/PUT/DELETE `[slug]`) så områden muteras likadant — idag går de
  bara via bulk-PUT.
- `GET /api/v1/site-data` finns kvar och returnerar den **komponerade** snapshoten
  (config + experter/områden) för konsumenter/export.
- `PUT /api/v1/site-data` begränsas till **config-delen** (eller tas bort), eftersom
  experter/områden nu har egna endpoints. Beslut: behåll en config-PUT för
  site/organization/marketplace; ta bort möjligheten att bulk-skriva experter/områden.
- Auth (`API_TOKEN`/Bearer) oförändrad; gäller alla muterande endpoints.

### Bort med URL-läget

- Ta bort GitHub-raw-hämtning och `SITE_DATA_URL`/timeout-logik i `content/store.ts` och
  `blog/store.ts`. `github.ts` tas bort om den bara används av URL-läget.
- Ta bort env-variabler som blir döda: `SITE_DATA_URL`, `SITE_DATA_REVALIDATE_SECONDS`,
  `SITE_DATA_FETCH_TIMEOUT_MS`.
- Uppdatera docs: `web/docs/architecture.md`, `web/API.md`, `web/CLAUDE.md`, `web/README.md`
  (samt `.env.example`).

### Seeding & källa (source of truth)

- De incheckade filerna i repot förblir **seed**: `seed.ts` kopierar dem till `DATA_DIR` vid
  tom volym (oförändrat beteende).
- Därefter är **volymkopian levande sanning**, muterad **endast via API:et**.
- Konsekvens: levande innehåll divergerar från den incheckade seeden. `GET /site-data` och
  `GET /blog/posts` fungerar som export/backup. (Backup-/export-rutin utanför scope men
  möjliggjord.)

### Testning

- En **in-memory-implementation** av varje gränssnitt (`InMemoryContentStore`,
  `InMemoryBlogStore`, `InMemoryConfigStore`) för snabba, isolerade enhetstester.
- URL-lägestesterna i `content/store.test.ts` / motsv. ersätts med tester mot den nya
  abstraktionen.
- Render-smoke och query-tester använder in-memory-storar eller fixtures.
- Befintlig miljökänslighet (test som beror på att `web/data` saknas på disk) försvinner när
  URL-läget och disk-fallbacken tas bort.

## Radar-förberedelse (framåtblick — byggs inte nu)

En "Teknikradar" (jfr `web/radar_example/teknikradar.html`) är rikare än ett blogginlägg:

- **Meta:** titel, kicker, beskrivning, version, datum, källor.
- **Segment** (kvadranter): namn + färg.
- **Ringar** (beredskapsgrad): namn + färg + beskrivning.
- **Items/blips:** namn, segment, ring, beskrivning, påverkan, kopplade lagar/taggar.

Datamodellskiss:

```ts
type RadarMeta = { slug; title; kicker?; description?; version?; date; sources?: string[] };
type Radar = RadarMeta & {
  segments: { key: string; label: string; color: string }[];
  rings:    { key: string; label: string; color: string; description?: string }[];
  items:    { name: string; segment: string; ring: string; description: string;
              impact?: string; tags?: string[] }[];
};
```

**Sidmönster (som bloggen):** `/radar` listar alla radarer, `/radar/[slug]` visar en radar
(blips är interaktiva i en sidopanel — inte egna sidor). Varje radar = ett "inlägg".

**Hur det slottar in:** `RadarStore` byggs som en upprepning av `BlogStore` — egen seed-fil
(`radar-data.json`), egna endpoints (`/api/v1/radars`), egen cache-tagg (`radar`), och
list+detalj-sidmönstret. Ingen del av denna spec implementerar Radar; vi säkerställer bara
att mönstret generaliserar.

## Följdarbete (egna specar — inte denna)

Sekvens: **denna spec (web-API)** → **följdspec (skills)** → **senare (radar)**.

1. **`expertbyran-api` (NY skill)** — ren referens-skill: enda källan för hur det enhetliga
   API:et fungerar (auth via `WEB_API_URL`/`WEB_API_TOKEN`, endpoints för experter, områden,
   blogg, senare radar; payloads, fel, exempel). Ersätter duplicerad API-dokumentation i
   andra skillar.
2. **`blog-editor` (befintlig)** — behåller sina superviktiga redaktionella regler +
   `references/skrivstil.md`; API-mekaniken ersätts med en länk till `expertbyran-api`
   (avduplicering). Använder redan API:et.
3. **`expertbyran-manager` (befintlig)** — läggs om från **direkt filredigering** av
   `site-data.json` till experter/områden-**endpoints**; länkar till `expertbyran-api`;
   behåller domänkunskap (`references/site-data-schema.md`, registry-synk).
4. **`expertbyran-radar` (framtida)** — refererar `expertbyran-api`; när Radar byggts i
   `web/` utökas `expertbyran-api` med radar-endpoints.

## Risker & avvägningar

- **Versionshantering av levande innehåll:** när sanning flyttar till volymen är innehållet
  inte längre i git. Mildras av att `GET`-endpoints fungerar som export; ev. backup-rutin
  senare.
- **Författarflödet bryts tills skillarna lagts om:** efter att API:et blivit enda skrivväg
  kommer `expertbyran-manager` (som redigerar filer) bara påverka seeden tills den lagts om.
  Måste samordnas (följdspec 2) nära i tid efter denna leverans.
- **Single-writer-antagande:** fil-backend antar en container-instans. Vid flera repliker
  krävs DB-backend (möjliggjort av abstraktionen, men inte byggt nu).
- **Next-cache-semantik:** korrekt taggning/invalidering måste verifieras (en write → rätt
  tagg invalideras → sidorna ser ny data).

## Acceptanskriterier

- Inga konsumenter (sidor, query-helpers) importerar `disk-storage` eller fil-API direkt —
  endast storarna via composition root.
- Det går inte att skriva innehåll annat än via API:et.
- URL/GitHub-raw-läget och dess env-variabler är borttagna; docs uppdaterade.
- Experter, områden och blogg läses via cachelagret i web; en write invaliderar rätt tagg.
- Områden har egna API-endpoints likt experter.
- In-memory-storar finns och används i tester; hela sviten grön i ren miljö.
- `tsc`, `lint`, `vitest` och produktionsbuild är gröna.
- Radar-mönstret är dokumenterat så att en framtida `RadarStore` är en ren upprepning.
