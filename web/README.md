# Expertbyrån

Minimalistisk Next.js-webbplats för ett virtuellt konsultbolag med AI-experter och expertområden. Allt innehåll nås via en lagringsabstraktion och muteras enbart via webbappens REST API.

## Stack

- Next.js 16 med App Router och TypeScript
- Lagringsabstraktion (`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`, `ForesightStore`) med SQLite-backend via Nodes inbyggda `node:sqlite` (kräver Node 22)
- REST API som enda skrivväg för innehåll; markdown renderas till HTML vid skrivning
- Zod-validering av all data
- Cachning i webblagret via `unstable_cache` + taggar, invaliderad med `revalidateTag`; inget innehåll prerendras vid build
- Publika schemafiler under `/schemas/`
- Minimal Docker-image baserad på Nexts `standalone`-output
- Vitest för schema-, store- och render-smoke-tester; delad kontraktssvit körs mot både memory- och SQLite-stores

## Driftmodell

- Innehåll (experter, expertområden, blogginlägg, radarer, foresights) lagras i SQLite-databasen `${DATA_DIR}/expertbyran.db` (WAL-läge) och nås via lagringsabstraktionen. Konsumenter rör aldrig databasen direkt; migreringar körs automatiskt vid serverstart.
- Den **enda** skrivvägen för innehåll är webbappens REST API (`/api/v1/...`); muterande anrop kräver `API_TOKEN`. Markdown renderas till HTML vid skrivning; läsvägen serverar färdig HTML.
- Konfigurationsdata (site/organization/marketplace) bundlas i imagen via `src/config/site-config.json` och muteras inte via API — den ändras via repo + deploy.
- Ingen seed-mekanism: nyinstallation = tom databas. Gamla JSON-filer på volymen importeras automatiskt till SQLite vid första start (nödventil `SKIP_LEGACY_IMPORT=1`).
- Inget innehåll prerendras vid build — innehållssidorna är `force-dynamic` och renderas on-demand mot datacachen. Cachning sker via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `config`, `blog`, `radar`, `foresight`); API:et invaliderar med `revalidateTag` efter skrivningar.
- `GET /refresh` invaliderar alla innehållstaggar — kräver bearer-token (samma `API_TOKEN`).
- `/blogg` och `/foresight` pagineras med `?sida=` (24 per sida); `/blogg` har områdesfilter `?omrade=`. API:ets GET-listor är opaginerade (medvetet kontrakt).

Viktiga env vars:

- `DATA_DIR`
- `API_TOKEN`
- `SKIP_LEGACY_IMPORT`
- `ADMIN_LOGIN_URL`

## Kom igång lokalt

1. Installera beroenden: `npm install`
2. Skapa `.env` eller `.env.local` från `.env.example`
3. Starta utvecklingsservern: `npm run dev`

Om du vill testa produktionsruntime lokalt:

```bash
npm run build
npm start
```

Öppna sedan `http://localhost:3000`.

## Nyttiga kommandon

- `npm run lint`
- `npm run test`
- `npm run build`
- `npx tsc --noEmit`

## Docker

Imagen bygger Nexts `standalone`-output och kör en enda webbserver på port `3000`.

### Bygg imagen

```bash
docker build -t expertbyran:latest .
```

### Kör imagen

```bash
docker run --rm \
  -p 3000:3000 \
  -e API_TOKEN=your-secret-token \
  -v expertbyran-data:/app/data \
  expertbyran:latest
```

Data lagras i SQLite-databasen `expertbyran.db` under `DATA_DIR` (i imagen `/app/data`). Vid första start skapas en tom databas; ligger gamla JSON-filer på volymen importeras de automatiskt och döps om till `*.imported`. Lokalt pekar `.env.example` `DATA_DIR` mot `data`. Backup = kopiera volymen (eller ta en sqlite-dump).

## Innehållsmodell och marketplace

- Innehåll lagras i SQLite under `DATA_DIR` och skapas via REST API:et; `web/site-data.json` i monorepot konsumeras inte av webben utan underhålls som marketplace-synkad presentationsdata
- Det sammansatta snapshot:et innehåller `marketplace`, expertområden och expertmetadata
- Marknadsplatsen pekar på GitHub-repot `mattahr/expertbyran`
- Webbappen länkar till GitHub och genererar eller publicerar inte marketplace-innehåll själv

## Dokumentation

- Dokumentationsöversikt: `docs/README.md`
- Arkitektur: `docs/architecture.md`
- Innehållsmodell: `docs/content-model.md`
- Marketplace-katalog: `docs/marketplace-catalog.md`
- Utvecklingsguide: `docs/development-guide.md`
- Publikt JSON Schema för snapshoten: `public/schemas/site-data.schema.json`
- Publikt JSON Schema för pluginsynk: `public/schemas/plugin-sync.schema.json`
