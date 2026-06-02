# Designspec: Rund tech-radar i `web/`

> Status: godkänd brainstorm-design · Datum: 2026-06-03 · Projekt: `web/` (Next.js 16)

## Syfte och kontext

Bygga en **rund, interaktiv tech-radar** i den publika webbplatsen (`web/`) som
presenterar foresight-poster ("blips") placerade efter **ringar** (redaktionell
hållning) och **segment** (tematiska tårtbitar). Visuell och interaktiv förebild är
`web/radar_example/teknikradar.html` (struktur, ringar, segment, klickbara punkter,
detaljpanel) — men radarn använder `web/`:s eget designspråk, **inte** exemplets
färger/typsnitt.

Radarn fylls från foresight-vaultet (`/Users/mattias/Documents/_OBSIDIAN/Tech Foresight`)
**via en redaktör**, inte direkt. Redaktören (en separat Claude-skill, se §8) är
uppföljningsarbete och ligger **utanför** denna spec; här bygger vi webb-sidan och det
API redaktören skriver mot.

Featuren speglar den befintliga **blog**-featuren arkitektoniskt (storage-abstraktion,
REST-API som enda skrivväg, Next 16-cache via `unstable_cache` + `revalidateTag`,
lista-sida + detaljsida).

## Beslut från brainstormen

| Fråga | Beslut |
|---|---|
| Ringarnas betydelse | **Redaktionell hållning** (Anta / Pröva / Bevaka / Avvakta), som exemplet — inte rå signalstyrka. |
| Segmentens källa | **Redaktören definierar fritt per radar** (~4–6 namngivna segment). |
| Redaktörsflöde | **Claude-skill** läser vaultet, kurerar, skriver via API. Ad-hoc, ingen stående koppling. Egen spec senare. |
| Scope | **Multi-radar-arkitektur** (speglar blog), men **seeda en radar** nu. |
| Blip-fält | **Beskrivning + Implikationer** (kärnan). Taggar/källor/horisont utelämnas (YAGNI). |
| Designriktning | **Ljus institutionell panel** (vitt kort, konsekvent med resten av sajten). |

## 1. Datamodell

Ringarna är en **global modulkonstant** (samma fyra hållningar på alla radarer).
Segmenten **definieras per radar**. En blip refererar segment + ring och bär två textfält.

```ts
// src/lib/radar/rings.ts — modulkonstant, delas av alla radarer
export const RINGS = [
  { id: "anta",    label: "Anta",    blurb: "I drift, hög mognad",      color: "#0e7c7b" }, // teal
  { id: "prova",   label: "Pröva",   blurb: "Pilot, bygg kompetens",    color: "#1d4e74" }, // accent
  { id: "bevaka",  label: "Bevaka",  blurb: "Följ utvecklingen aktivt", color: "#d4982b" }, // bärnsten/guld
  { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet",   color: "#64718a" }, // slate
] as const;
export type RingId = (typeof RINGS)[number]["id"];
```

```ts
// src/lib/radar/schema.ts — Zod-validerade typer (mönster: src/lib/blog/schema.ts)
type Segment = { id: string; name: string };       // id = slug
type RadarMeta = {
  slug: string;
  title: string;
  subtitle?: string;
  version?: string;
  date: string;                                     // ISO datetime
  segments: Segment[];                              // 4–6, redaktören namnger
};
type Blip = {
  id: string;                                       // slug, unik inom radarn
  name: string;
  segmentId: string;                                // → segments[].id
  ring: RingId;                                     // "anta" | "prova" | "bevaka" | "avvakta"
  description: string;                              // neutral beskrivning (signalens påstående)
  implications: string;                             // "Implikationer" — varför det spelar roll
};
type RadarDetail = RadarMeta & { blips: Blip[] };
type RadarCatalog = { radars: RadarMeta[] };        // lista utan blips
```

**Valideringsregler (Zod):** `slug`/`id` följer befintligt `slugSchema`; `date` följer
`isoDateTimeSchema`; `segments` har 4–6 poster med unika `id`; varje `blip.segmentId`
måste matcha en `segments[].id` (refine på `RadarDetail`); varje `blip.id` unik inom
radarn; `ring` ∈ `RingId`. Validering vid både läsning och skrivning.

## 2. Lagring (speglar `BlogStore`)

```ts
// src/lib/stores/types.ts
export interface RadarStore {
  listRadars(): Promise<RadarMeta[]>;
  getRadar(slug: string): Promise<{ meta: RadarMeta; blips: Blip[] } | null>;
  createRadar(meta: RadarMeta, blips: Blip[]): Promise<RadarMeta>;
  updateRadar(slug: string, patch: { meta?: RadarMeta; blips?: Blip[] }): Promise<RadarMeta>;
  deleteRadar(slug: string): Promise<void>;
}
```

- **`FileRadarStore`** (`src/lib/stores/file-radar-store.ts`): katalog i
  `DATA_DIR/radar-data.json` (`RadarMeta[]` inkl. `segments`); blips per radar i
  `DATA_DIR/radar/{slug}.json` (strukturerad JSON, **inte** markdown). Använder
  befintliga `fs-helpers` för atomiska skrivningar.
- **`InMemoryRadarStore`** (`src/lib/stores/memory-stores.ts`) för tester.
- Registreras i `src/lib/stores/index.ts`; exponeras via `getRadarStore()` och ingår i
  `Stores`-kompositionsroten + `__setStoresForTest()`.

Felhantering följer blog: `ConflictError` (dubblett-slug) → 409, saknad radar → `null`/404.

## 3. REST-API (mönster: `/api/v1/blog/posts`)

```
GET    /api/v1/radars              lista (RadarMeta[])
POST   /api/v1/radars              skapa { meta, blips }          [auth]
GET    /api/v1/radars/[slug]       hämta { meta, blips }
PUT    /api/v1/radars/[slug]       uppdatera { meta?, blips? }    [auth]
DELETE /api/v1/radars/[slug]       radera                         [auth]
```

- Filer: `src/app/api/v1/radars/route.ts` (GET+POST), `src/app/api/v1/radars/[slug]/route.ts`
  (GET+PUT+DELETE).
- Auth via befintlig `requireAuth` (Bearer-token) på muterande verb.
- Zod-validering av body; statuskoder som blog (201/400/401/404/409/500).
- Efter skrivning: `revalidateTag("radar", "max")`.
- Dokumenteras i `web/API.md`; CLAUDE.md-tabellen i `web/CLAUDE.md` uppdateras vid behov.

## 4. Cache & query

```ts
// src/lib/radar/store.ts
export const RADAR_TAGS = ["radar"] as const;
const loadRadarData = unstable_cache(
  async () => { /* getRadarStore().listRadars() + getRadar(slug) per radar */ },
  ["radar-data"],
  { tags: [...RADAR_TAGS] },
);
```

- `src/lib/radar/query.ts`: `getRadarArchive()` (för listan) och `getRadar(slug)`
  (för detalj), analogt med `src/lib/blog/query.ts`.
- `GET /refresh` utökas att invalidera `radar`-taggen.

## 5. Sidor & interaktion

- **Navigation:** lägg till `{ href: "/radar", label: "Radar" }` i `navigation`-arrayen i
  `src/components/site/SiteChrome.tsx` **direkt efter `/blogg`** (gäller både primär nav och
  mobilmenyn, som båda läser samma array). `isNavItemActive` matchar redan `/radar/[slug]`.
- **`/radar`** (`src/app/radar/page.tsx`) — server-komponent. Listar radarer som kort
  (fungerar med en post). `export const metadata`. Samma CSS-modulstrategi som `/blogg`.
- **`/radar/[slug]`** (`src/app/radar/[slug]/page.tsx`) — server-komponent. Hämtar
  `{ meta, blips }` via query-lagret, `generateMetadata()`, `notFound()` vid miss.
  Renderar skal: rubrik (kicker + titel + subtitle), legend (ringar + segment), footer.
- **Klient-ö** (`src/app/radar/[slug]/RadarChart.tsx`, `"use client"`): tar emot
  `segments` + `blips` som props, äger valt-blip-state, renderar SVG-radarn och
  detaljpanelen vid klick.
  - **Geometri** (som exemplet): bakgrundsringar (fyllning = ringfärg ~7% opacitet),
    segment-avdelare, ringetiketter längs vertikalen, segmentetiketter i tårtbitarna.
  - **Blip-placering**: deterministisk — gruppera på `segment+ring`, fördela vinklar
    jämnt inom tårtbitens vinkelspann, variera radie något inom ringbandet för läsbarhet.
  - **Detaljpanel**: ring-chip (färg + hållning), namn, segmentnamn, beskrivning,
    "Implikationer"-block.

## 6. Design (Riktning B — ljus institutionell)

- Vitt kort (`--white`) på `--gray-100`-sida, `--shadow-md`, `--radius-lg`.
- Ringfyllning = ringfärg ~7% opacitet; avdelare/konturer i grått (`--gray`-nyans).
- Blips: ringfärg som fyllning, vit kontur, numrerade (svart/mörk siffra).
- Typografi: Instrument Serif på rubrik + segmentetiketter; DM Sans i övrigt.
- Ringfärger: Anta `#0e7c7b`, Pröva `#1d4e74`, Bevaka `#d4982b`, Avvakta `#64718a`.
- **Responsivt**: radar + sidopanel i grid på desktop; staplas på smal skärm.
- **Tillgänglighet** (inte enbart färg): blips är numrerade och fokuserbara
  (`<button>`/`role`+`tabindex`, Enter/Space väljer, synlig fokusring, `aria-label`
  med namn + hållning + segment); legend har text; ringnamn skrivs ut; detaljpanel
  är textbaserad.

## 7. Seed-data (en radar)

En radar `teknikradar-2026` ("Teknikradar 2026") kurerad från **riktiga
foresight-signaler** i vaultet, ~12–18 blips fördelade över 4 segment (t.ex.
"AI & agenter", "Infrastruktur & data", "Säkerhet & krypto", "Styrning & regelverk").
Varje blip får hållning (ring) och två textfält satta redaktionellt. Lagras i
`web/radar-data.json` (katalog) + `web/data/radar/teknikradar-2026.json` (blips),
analogt med blog-seedens placering.

## 8. Redaktörsflöde (uppföljning — utanför denna spec)

API:et i §3 är skrivvägen. En separat **`expertbyran-radar`**-skill (paperclip) läser
foresight-vaultet, föreslår blips (segment ur `domain/*`, hållning som utgångspunkt ur
`signal/*`-styrka), användaren godkänner/justerar, skillen skriver via `/api/v1/radars`.
**`expertbyran-api`**-referensskillen utökas med radar-endpoints. Skill-referenser sker
via namn, inga fil-länkar (jfr minnet `paperclip-skills-no-cross-links`). Detta byggs
**efter** att webb-sidan är klar och får egen spec/plan.

## 9. Avgränsning & test

**I scope:** schema + ringkonstant, `RadarStore` (fil + memory) + registrering,
API-routes + auth + validering, cache/query + `/refresh`, `/radar` + `/radar/[slug]` +
klient-ö, seed av en radar, nav-länk till `/radar`, docs (`API.md`), tester.

**Utanför scope:** redaktörs-skillen, vault-import/parser, taggar/källor/horisont på
blips, draft/publish-state, multi-radar-UI utöver listan.

**Test (Vitest, TDD enligt projektkonventioner):**
- Schema: giltiga/ogiltiga radarer, segment-referensintegritet, unika id:n.
- Store: CRUD mot `InMemoryRadarStore` (skapa/dubblett-konflikt/uppdatera/radera/hämta).
- API: GET-lista/-detalj, POST/PUT/DELETE med och utan auth, 404/409.
- Render: `/radar/[slug]` renderar blips/segment/legend; klient-ön väljer blip och
  visar detaljpanel.

## Filöversikt (nya/ändrade)

```
web/src/lib/radar/rings.ts            (ny)  ringkonstant
web/src/lib/radar/schema.ts           (ny)  Zod-typer
web/src/lib/radar/store.ts            (ny)  cache (RADAR_TAGS, loadRadarData)
web/src/lib/radar/query.ts            (ny)  getRadarArchive, getRadar
web/src/lib/stores/types.ts           (mod) RadarStore-interface
web/src/lib/stores/file-radar-store.ts (ny) FileRadarStore
web/src/lib/stores/memory-stores.ts   (mod) InMemoryRadarStore
web/src/lib/stores/index.ts           (mod) getRadarStore + komposition
web/src/app/api/v1/radars/route.ts            (ny)  GET+POST
web/src/app/api/v1/radars/[slug]/route.ts     (ny)  GET+PUT+DELETE
web/src/app/refresh/route.ts          (mod) invalidera radar-tagg
web/src/app/radar/page.tsx            (ny)  lista
web/src/app/radar/[slug]/page.tsx     (ny)  detalj (server)
web/src/app/radar/[slug]/RadarChart.tsx (ny) klient-ö (SVG + panel)
web/radar-data.json                   (ny)  seed-katalog
web/data/radar/teknikradar-2026.json  (ny)  seed-blips
web/API.md                            (mod) radar-endpoints
web/CLAUDE.md                         (mod) datamodell/skrivväg-not vid behov
+ motsvarande *.test.ts-filer
```
