# Designspec: Redigerbara ringar per radar (web/)

**Datum:** 2026-07-01
**Projekt:** `web/` (Next.js 16, node:sqlite)
**Status:** Godkänd, redo för implementationsplan

## Bakgrund och mål

I `web/`-adminpanelen kan en redaktör idag hantera en radars **segment** fritt
(lägga till, ta bort, byta namn — 4–6 stycken per radar). Segmenten är per-radar-data
och lagras som JSON i kolumnen `radars.segments`.

**Ringarna** (Anta, Pröva, Bevaka, Avvakta) är däremot **globala hårdkodade konstanter**
i `src/lib/radar/rings.ts` och delas av alla radarer. En blip refererar en ring via en
enum (`ringSchema = z.enum(RING_IDS)`), och den visuella radarn (`RadarChart.tsx`)
hårdkodar `RING_EDGES = [0, 110, 205, 300, 400]` — exakt fyra ringar.

**Målet** är att ringar ska kunna hanteras per radar precis som segment: läggas till,
tas bort, byta namn/beskrivning/färg och ordnas om — och att den visuella radarn ritas
för ett variabelt antal ringar.

## Beslut (bekräftade med användaren)

1. **Variabelt antal** — ringar kan läggas till/tas bort per radar (gräns **2–6**).
   Olika radarer kan ha olika många ringar.
2. **Redigerbara egenskaper:** namn (label), beskrivning (blurb) **och** färg
   (färgväljare per ring). Beskrivning är **obligatorisk** (håller teckenförklaringen meningsfull).
3. **Omordningsbar** — ↑/↓-knappar. Listans ordning = inre → yttre (inre = mest mogen).

## Arkitekturval

**Ringar blir per-radar-JSON, exakt parallellt med segment** (vald approach):

* Ny JSON-kolumn `rings` på `radars`-tabellen, speglar `segments`.
* `radarMetaSchema` får ett `rings`-fält; därmed flödar det automatiskt genom
  `radarInputSchema`/`radarPatchSchema` → API → store → integritetskontroll utan
  strukturella ändringar i API-rutterna.

Avvisade alternativ: (B) globala ringar med per-radar-overrides — två källor till sanning;
(C) normaliserad `radar_rings`-tabell — överarbetat för en kodbas som medvetet lagrar
segment/blips som JSON-blobbar.

## Datamodell

En ring blir per-radar-data med samma form som dagens `Ring`:

```ts
type Ring = { id: string; label: string; blurb: string; color: string };
// color: hex "#rrggbb"
```

Zod:

```ts
const ringDefSchema = z.object({
  id: slugSchema,
  label: z.string().min(1),
  blurb: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
```

`radarMetaSchema` utökas med:

```ts
rings: z.array(ringDefSchema).min(2).max(6),
```

…plus en `superRefine` som kräver **unika ring-id inom radarn** (samma mönster som
segmenten redan har).

### Blip refererar ring via slug, inte enum

Idag är `blip.ring` en `z.enum(RING_IDS)`. Den blir en vanlig `slugSchema` som refererar
en ring **inom den radarn** — precis som `blip.segmentId` refererar ett segment.
Korsreferenskontrollen flyttar in i `assertRadarIntegrity`:

* Varje `blip.segmentId` måste matcha ett segment-id i `meta.segments` (oförändrat).
* **Nytt:** varje `blip.ring` måste matcha ett ring-id i `meta.rings`.
  Felmeddelande: `Blip '<id>' refererar okänd ring '<ring>'.`

## `rings.ts` — globalt → standarduppsättning

* `RINGS` byter namn till **`DEFAULT_RINGS`** (de fyra anta/prova/bevaka/avvakta med
  nuvarande label/blurb/color). Används endast för: scaffolding av nya radarer i admin,
  legacy-import och migrations-backfill.
* `RING_BY_ID` och `RING_IDS` (globala) tas bort. Uppslag blir per-radar via en hjälpare,
  t.ex. `ringsById(rings: Ring[]): Record<string, Ring>`.
* `RingId`-typen (literal union) blir `string` (en slug). `Ring`-typen behålls.
* En liten färgpalett `RING_COLORS` behålls/införs som default-färg för nya ringar i admin
  (användaren kan ändra). De fyra standardringarnas färger ligger först i paletten så att
  backfilade radarer ser identiska ut mot idag.

## Renderare (`RadarChart.tsx`) — antalsoberoende

* Komponenten tar emot en ny prop `rings: Ring[]` (från `radar.meta.rings`).
* `RING_EDGES` beräknas dynamiskt från ringantalet N: N+1 kanter, lika breda band från
  centrum till `R_MAX` (`edge_i = (i / N) * R_MAX`).
* Ringcirklar, ringetiketter, teckenförklaring, blip-färger och aria-etiketter läses från
  `rings`-propen i stället för de globala konstanterna. Ring-index-mappen och
  ring-by-id-uppslaget byggs per render från propen.
* Den dekorativa mittkorsmarkeringen (`[0, 90, 180, 270]`) rör segment/axlar, inte ringar,
  och lämnas orörd.
* `src/app/radar/[slug]/page.tsx` skickar in `rings={radar.meta.rings}`.

## Adminpanel (`RadarAdmin.tsx`)

Ny under-editor **"Ringar"** bredvid "Segment". Per ring:

* **label**-input, **blurb**-input, **färgväljare** (`<input type="color">`),
* skrivskyddad **id-tagg**,
* **↑/↓**-knappar för omordning,
* **✕**-knapp för att ta bort.
* **+ Lägg till ring** (inaktiv vid 6 ringar).

Tillstånd/handlers speglar segmenten plus omordning:

* `updateRing(i, patch)`, `addRing()`, `removeRing(i)`, `moveRing(i, dir)`.
* Nytt ring-id via `nextId("ring", usedIds)`. Ny ring får default-färg från `RING_COLORS`
  efter index.
* Blip-ringväljaren (idag från globala `RINGS`) fylls nu från `draft.meta.rings`.
* Default-ring för en ny blip = radarns mittersta ring (`rings[Math.floor(rings.length/2)]`).
* När en **ny radar** skapas i admin seedas `rings` med `DEFAULT_RINGS`.

Klientvalidering `validate(draft)` får, parallellt med segmentreglerna:

* 2–6 ringar,
* icke-tomma label och blurb,
* giltig hex-färg,
* unika ring-id,
* varje `blip.ring` refererar en befintlig ring.

CSS: ny `.ringRow` i `admin.module.css` (grid för label/blurb/färg/id/omordning/ta bort),
återanvänder befintliga knapp-/taggklasser där möjligt.

## Migration och bakåtkompatibilitet

* Ny migration som lägger till kolumnen `rings` på `radars` och **backfillar** varje
  befintlig radar med `DEFAULT_RINGS`. Default-ringarnas **id behålls**
  (`anta/prova/bevaka/avvakta`) så att befintliga blips förblir giltiga.
* `rowToMeta` parsar `rings`; saknas värdet (NULL) faller den tillbaka på `DEFAULT_RINGS`
  defensivt.
* `META_COLUMNS`-listan i SQLite-storen utökas med `rings`; `createRadar`/`updateRadar`
  `JSON.stringify`:ar `meta.rings`.
* Minnesstoren (`memory-radar-store`) hanterar `rings` via samma schema (validerar meta).
* `import-legacy.ts` sätter `rings: DEFAULT_RINGS` på importerade radarer.

## Tester

* `schema.test.ts`: META-fixturen får `rings`. Nya tester: ringantal-gräns (min 2 / max 6),
  unika ring-id, samt att `assertRadarIntegrity` avvisar en blip med okänd ring. Giltigt fall.
* `store-contract.ts`: radar-fixturer får `rings`; round-trip-test att ringar persisteras;
  test att blip med okänd ring avvisas.
* `route.test.ts`: radar-payloads får `rings`.
* Migrationstest (om mönster finns): befintlig radar-rad utan `rings` backfillas till
  `DEFAULT_RINGS`.

## Filer som berörs

`schema.ts`, `rings.ts`, `migrations.ts`, `sqlite-radar-store.ts`, minnesstoren,
`RadarChart.tsx`, `radar/[slug]/page.tsx`, `RadarAdmin.tsx`, `admin.module.css`,
`import-legacy.ts`, samt testfilerna. **API-rutterna kräver inga strukturella ändringar**
— de ärver schemat.

## Avgränsningar / medvetna val

* Ringantal: **2–6**. Lika breda ringband. Blurb obligatorisk. Default-ny-blip-ring =
  mittersta ringen.
* Mittkorsmarkeringen i renderaren är ett befintligt segment-/axelproblem och ingår inte.
* Ingen ändring av den publika läs-API-formen utöver det nya `rings`-fältet i meta.
