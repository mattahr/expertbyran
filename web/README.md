# Expertbyrån

Minimalistisk Next.js-webbplats för ett virtuellt konsultbolag med AI-experter och expertområden. Allt innehåll nås via en lagringsabstraktion och muteras enbart via webbappens REST API.

## Stack

- Next.js 16 med App Router och TypeScript
- Lagringsabstraktion (`ConfigStore`, `ContentStore`, `BlogStore`) — filbaserad i dag, DB-utbytbar senare
- REST API som enda skrivväg för innehåll
- Zod-validering av all data
- Cachning i webblagret via `unstable_cache` + taggar, invaliderad med `revalidateTag`
- Publika schemafiler under `/schemas/`
- Minimal Docker-image baserad på Nexts `standalone`-output
- Vitest för schema-, store- och render-smoke-tester

## Driftmodell

- Innehåll (experter, expertområden, blogginlägg) lagras under `DATA_DIR` och nås via lagringsabstraktionen. Konsumenter rör aldrig filer direkt.
- Den **enda** skrivvägen för innehåll är webbappens REST API (`/api/v1/...`); muterande anrop kräver `API_TOKEN`.
- Konfigurationsdata (site/organization/marketplace) är fil- och seed-hanterad och muteras inte via API.
- Cachning sker i webblagret via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `blog`). API:et invaliderar med `revalidateTag` efter skrivningar.
- `GET /refresh` invaliderar alla innehållstaggar.

Viktiga env vars:

- `DATA_DIR`
- `API_TOKEN`

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

Data lagras under `DATA_DIR` (i imagen `/app/data`). Vid första start kopieras seed-data dit om katalogen är tom. Lokalt pekar `.env.example` `DATA_DIR` mot `data`.

## Innehållsmodell och marketplace

- Innehåll lagras under `DATA_DIR` och seedas från `web/site-data.json` i monorepot `mattahr/expertbyran`
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
