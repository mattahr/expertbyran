# Designspec: Foresights som innehållstyp + relaterat innehåll i radarn

> Status: godkänd brainstorm-design · Datum: 2026-06-03 · Projekt: `web/` (Next.js 16)

## Syfte och kontext

Bygga vidare på den nyss byggda tech-radarn (se
`docs/superpowers/specs/2026-06-03-radar-tech-radar-design.md`) med två saker:

1. **Foresights som en förstklassig innehållstyp** på webben — egna sidor och API, byggd
   precis som bloggen (meta + markdown). Foresights kommer från Tech Foresight-vaultet
   (`/Users/mattias/Documents/_OBSIDIAN/Tech Foresight`, `40 Foresights/`), där varje
   foresight är en flerdelad analys (Brief/Signals/Gaps/Scenarios/Implications/Report).
2. **Relaterat innehåll i radarns detaljpanel** — när en blip väljs visas länkar till
   foresights och blogginlägg som delar **tema** med blippen.

Tema matchas på **expertområden** (`areaSlugs`) — sajtens befintliga, gemensamma
taxonomi som bloggen redan använder och som har slug + accentfärg + egna sidor. Blips och
foresights får `areaSlugs`; relaterat = delar minst ett område. Radar-redaktören (skillen
`expertbyran-radar`) mappar vaultets `domain/topic`-taggar till närmaste expertområde vid
kuratering.

Featuren speglar **blog**-arkitekturen genomgående (storage-abstraktion, REST-API som enda
skrivväg, Next 16-cache via `unstable_cache` + `revalidateTag`, lista- + detaljsida).

## Beslut från brainstormen

| Fråga | Beslut |
|---|---|
| Foresight på webben | **Förstklassig innehållstyp som bloggen** (egen store, API, sidor, cache-tagg). |
| Tema-vokabulär | **Återanvänd expertområden (`areaSlugs`)** — gemensamt för blips, foresights, bloggar. |
| Relaterat-logik | **Automatiskt via delat expertområde** (ingen per-blip-kuratering). |
| Blip-djup | **Lätt blip** (description + implications + areaSlugs); djup nås via länkade foresights/bloggar — ingen markdown-body på blips. |
| Skill | `expertbyran-radar` **breddas** till radar + foresights (behåller namnet). |

## 1. Datamodell

### Blip (utökas — `web/src/lib/radar/schema.ts`)

Ett nytt valfritt fält läggs till `blipSchema`:

```ts
type Blip = {
  id: string; name: string;
  segmentId: string; ring: RingId;
  description: string; implications: string;
  areaSlugs?: string[];          // NYTT — slugs, valfritt; tema-nyckel för relaterat
};
```

`areaSlugs` är valfritt (en blip utan områden visar ingen relaterat-sektion). När angivet
valideras varje slug med `slugSchema`. `assertRadarIntegrity` ändras **inte** (områden
valideras inte mot en lista här — okända slugs matchar bara inget och är ofarliga).

### Foresight (ny — `web/src/lib/foresight/schema.ts`)

Speglar `BlogPostEntry` med ett extra `horizon`-fält:

```ts
type ForesightEntry = {
  slug: string;                  // unik
  title: string;
  date: string;                  // ISO 8601
  authorSlug?: string;           // vaultets "owner"; länkar till expertsida om den matchar
  authorName?: string;           // visningsnamn; krävs när authorSlug saknas/inte matchar
  authorRole?: string;
  areaSlugs: string[];           // ≥1 (som bloggen)
  excerpt: string;
  horizon?: string;              // foresight-specifikt, t.ex. "2026–2030"
};
type ForesightCatalog = { foresights: ForesightEntry[] };
// body = markdown (separat fil)
```

Författarregel som bloggen: minst en av `authorSlug`/`authorName`. Unika slugs
(superRefine). Inget `status`-fält — endast publicerbara foresights skrivs till webben.

## 2. Lagring (speglar `BlogStore`)

```ts
// web/src/lib/stores/types.ts
export interface ForesightStore {
  listForesights(): Promise<ForesightEntry[]>;
  getForesight(slug: string): Promise<{ meta: ForesightEntry; markdown: string } | null>;
  createForesight(meta: ForesightEntry, markdown: string): Promise<ForesightEntry>;
  updateForesight(slug: string, patch: { meta?: ForesightEntry; markdown?: string }): Promise<ForesightEntry>;
  deleteForesight(slug: string): Promise<void>;
}
```

- **`FileForesightStore`** (`web/src/lib/stores/file-foresight-store.ts`): katalog i
  `DATA_DIR/foresight-data.json`, markdown per foresight i `DATA_DIR/foresight/{slug}.md`.
  Återanvänder `fs-helpers`. **Exakt** samma struktur som `FileBlogStore` (inklusive
  slug-byte-hantering vid update).
- **`InMemoryForesightStore`** (`memory-stores.ts`) + smoke-test.
- Registreras i `index.ts`: `radar` finns redan; lägg `foresight` i `Stores` +
  `getForesightStore()`.
- Spårad seed på repo-roten: `web/foresight-data.json` + `web/foresight/{slug}.md`
  (samma mönster som `web/blog-data.json` + `web/blog/posts/`; `web/data/` är gitignorerad).

## 3. REST-API (mönster: `/api/v1/blog/posts`)

```
GET    /api/v1/foresights              lista (ForesightEntry[])
POST   /api/v1/foresights              skapa { foresight, markdown }   [auth]
GET    /api/v1/foresights/[slug]       hämta { foresight, markdown }
PUT    /api/v1/foresights/[slug]       uppdatera { foresight?, markdown? }   [auth]
DELETE /api/v1/foresights/[slug]       radera   [auth]
```

Bearer-auth på mutationer (`requireAuth`), Zod-validering, `revalidateTag("foresight","max")`,
statuskoder som blog (201/400/401/404/409/500). `export const dynamic = "force-dynamic"`.
Body-formen `{ foresight, markdown }` speglar bloggens `{ post, markdown }`.

## 4. Cache & query

```ts
// web/src/lib/foresight/store.ts
export const FORESIGHT_TAGS = ["foresight"] as const;
// loadForesightData via unstable_cache(fn, ["foresight-data"], { tags: [...FORESIGHT_TAGS] })
// returnerar { catalog, rendered: [slug, html][] } — som blog/store.ts
```

- `web/src/lib/foresight/markdown.ts` — `renderForesightMarkdown` (återanvänder samma
  `marked`-baserade rendering som `web/src/lib/blog/markdown.ts`; om bloggens renderare är
  generell återanvänds den direkt i stället för en kopia).
- `web/src/lib/foresight/query.ts` — `getForesightArchive()` (lista + använda områden,
  som `getBlogArchive`), `getForesight(slug)` (full med renderad HTML), `formatForesightDate`.
- `/refresh` (`web/src/app/refresh/route.ts`) utökas med `"foresight"` i `TAGS`.

## 5. Relaterat innehåll (radarns detaljpanel)

### Query — `web/src/lib/radar/related.ts`

```ts
type RelatedItem = { kind: "foresight" | "blog"; slug: string; title: string; areaSlugs: string[] };
// getRelatedByArea(areaSlugs: string[]): Promise<RelatedItem[]>
//  - hämtar foresight-arkiv + blogg-arkiv (cachade)
//  - filtrerar till poster som delar ≥1 areaSlug
//  - sorterar nyast först, kapar till max 5 totalt
```

### Detaljsidan beräknar per blip

`web/src/app/radar/[slug]/page.tsx` bygger en map `relatedByBlip: Record<blipId, RelatedItem[]>`
(endast för blips som har `areaSlugs`) och skickar in den som prop till `RadarChart`. Detta
håller klient-ön självförsörjande (ingen klient-fetch).

### `RadarChart` visar "Relaterat"

`RadarChart` tar emot `relatedByBlip?: Record<string, RelatedItem[]>`. När en blip med
relaterade poster väljs renderas en **"Relaterat"-sektion** sist i detaljpanelen: en lista
med länkar till `/foresight/{slug}` respektive `/blogg/{slug}`, varje rad med en liten
etikett ("Foresight"/"Blogg") och titel. Blips utan relaterat visar ingen sektion.
Tangentbordsnåbart (vanliga `<a>`-länkar). `relatedByBlip` är valfritt, så befintliga
render-test fortsätter fungera utan propen.

## 6. Foresight-sidor + navigation

- **`/foresight`** (`web/src/app/foresight/page.tsx`) — lista, server-komponent, speglar
  `/blogg` (featured-först + grid, områdes-chip). `export const dynamic = "force-dynamic"`.
- **`/foresight/[slug]`** (`web/src/app/foresight/[slug]/page.tsx`) — detalj, `generateMetadata`,
  `notFound()`, renderad markdown + sidofält (datum, författare, horisont, expertområden).
- **Navigation:** lägg `{ href: "/foresight", label: "Foresight" }` i `navigation`-arrayen
  i `web/src/components/site/SiteChrome.tsx` **direkt efter `/radar`**.
- Återanvänder befintliga `site.module.css`-klasser (samma som bloggsidorna).

## 7. Seed

- **Blips:** de 16 blipsen i `web/radar/teknikradar-2026.json` får `areaSlugs` (mappade från
  vaultets domain/topic till närmaste expertområden — verifiera mot `GET /api/v1/areas`/
  `web/site-data.json` att varje slug finns).
- **Foresights:** 1–2 exempel kuraterade ur vaultet (t.ex. *Digital suveränitet i svensk
  statsförvaltning 2026–2030* och *Agentiska organisationer utan governance-skikt*),
  syntetiserade till markdown, taggade med samma expertområden som relevanta blips, lagrade
  i `web/foresight-data.json` + `web/foresight/{slug}.md`. Detta ger relaterat-länkarna
  faktiskt innehåll att peka på.

## 8. Skill + API-referens (paperclip)

- **`expertbyran-radar`** breddas (behåller namnet) till två redaktionella flöden:
  1. **Radar** (som idag) — kurera vault-signaler till blips; **nytt:** tagga varje blip med
     expertområden genom att mappa vaultets `domain/topic` → närmaste område (slå upp
     tillgängliga områden via API:et).
  2. **Foresights** — läs en vault-foresight-mapp (`40 Foresights/<namn>/`), syntetisera
     Brief + Scenarios + Implications + Report till ett markdown-dokument, sätt `excerpt`,
     `horizon` och `areaSlugs`, och publicera via `/api/v1/foresights`.
  Skrivregler och neutralitet som tidigare; API-mekanik hänvisas till skill `expertbyran-api`;
  skrivstil till skill `blog-editor`. Inga fil-länkar mellan skills (jfr minnet
  `paperclip-skills-no-cross-links`).
- **`expertbyran-api`** + dess `references/payloads.md` utökas med foresight-endpoints och
  `ForesightEntry`-schema (samt en not om `areaSlugs` på blips).

## 9. Avgränsning & test

**I scope:** blip-`areaSlugs`, hela foresight-innehållstypen (schema, store fil+memory,
API, cache/query, sidor, nav), relaterat-query + "Relaterat"-sektion i panelen, seed
(blip-taggning + 1–2 foresights), skill- + API-ref-uppdatering.

**Utanför scope:** per-blip markdown/sidor, explicit kuraterade relaterat-länkar,
foresight-statusflöde (draft/review), automatisk vault-import, ändringar i vaultet.

**Test (Vitest, TDD):**
- Foresight-schema (giltig/ogiltig, författarregel, unika slugs).
- `FileForesightStore` CRUD + `InMemoryForesightStore` smoke.
- API `/api/v1/foresights` (GET/POST/PUT/DELETE, auth, 404/409/400).
- `getRelatedByArea` (delar område → matchar; inga delade → tomt; kap till 5; sortering).
- Render: `/foresight/[slug]` renderar markdown; `RadarChart` visar "Relaterat"-länkar när
  `relatedByBlip` har poster för vald blip, och ingen sektion annars.

## 10. Implementeringsordning (två etapper)

1. **Etapp 1 — Foresight-innehållstyp:** schema → store (fil+memory) → registrering → cache
   → query → API (list/create + [slug]) → `/refresh` → sidor `/foresight` + `/foresight/[slug]`
   → nav → seed-foresights → `expertbyran-api` + `expertbyran-radar` (foresight-flödet).
2. **Etapp 2 — Relaterat i radarn:** `blip.areaSlugs` i schemat → `getRelatedByArea` →
   `relatedByBlip` i detaljsidan → "Relaterat"-sektion i `RadarChart` → seed-blippar får
   `areaSlugs` → `expertbyran-radar` (blip-områdestaggning).

Etapp 2 förutsätter att foresights finns, därav ordningen. Båda etapperna kan bli var sin
implementationsplan, eller en plan med två faser.

## Filöversikt (nya/ändrade)

```
web/src/lib/foresight/schema.ts            (ny)
web/src/lib/foresight/markdown.ts          (ny, ev. återanvänd blog/markdown)
web/src/lib/foresight/store.ts             (ny)  cache
web/src/lib/foresight/query.ts             (ny)
web/src/lib/radar/related.ts               (ny)  getRelatedByArea + RelatedItem
web/src/lib/radar/schema.ts                (mod) blip.areaSlugs
web/src/lib/stores/types.ts                (mod) ForesightStore
web/src/lib/stores/file-foresight-store.ts (ny)
web/src/lib/stores/memory-stores.ts        (mod) InMemoryForesightStore
web/src/lib/stores/index.ts                (mod) getForesightStore + komposition
web/src/app/api/v1/foresights/route.ts         (ny)  GET+POST
web/src/app/api/v1/foresights/[slug]/route.ts  (ny)  GET+PUT+DELETE
web/src/app/refresh/route.ts               (mod) foresight-tagg
web/src/app/foresight/page.tsx             (ny)  lista
web/src/app/foresight/[slug]/page.tsx      (ny)  detalj
web/src/app/radar/[slug]/page.tsx          (mod) bygg relatedByBlip
web/src/app/radar/[slug]/RadarChart.tsx    (mod) "Relaterat"-sektion + prop
web/src/app/radar/[slug]/RadarChart.module.css (mod) relaterat-stilar
web/src/components/site/SiteChrome.tsx     (mod) nav-länk /foresight
web/foresight-data.json                    (ny)  seed-katalog
web/foresight/{slug}.md                    (ny)  seed-markdown (1–2)
web/radar/teknikradar-2026.json            (mod) blips får areaSlugs
web/API.md                                 (mod) foresight-endpoints
+ motsvarande *.test.ts
paperclip/skills/local/expertbyran-radar/SKILL.md      (mod) foresight-flöde + blip-områden
paperclip/skills/local/expertbyran-api/SKILL.md        (mod) foresight-endpoints
paperclip/skills/local/expertbyran-api/references/payloads.md (mod) ForesightEntry
```
