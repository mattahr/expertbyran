# Expertbyrån

Minimalistisk Next.js-webbplats för ett virtuellt konsultbolag med AI-experter och kuraterade team. Webbplatsen är read-only i drift och läser `site-data.json` från en publik URL, normalt ett GitHub-monorepo.

## Stack

- Next.js 16 med App Router och TypeScript
- Remote snapshot via `SITE_DATA_URL`
- Zod-validering av inkommande snapshot
- Publika schemafiler under `/schemas/`
- Minimal Docker-image baserad på Nexts `standalone`-output
- Vitest för schema-, store- och render-smoke-tester

## Driftmodell

- Backend-agenten äger `site-data.json` i ert monorepo.
- Webbplatsen hämtar snapshoten från en publik URL, t.ex. `raw.githubusercontent.com`.
- Webbplatsen cachar senaste giltiga snapshot i minnet och uppdaterar med tidsstyrd polling.
- `GET /refresh` tvingar en omhämtning av snapshoten och kan användas från t.ex. GitHub Actions.
- Om fjärrläsningen misslyckas används senast cacheade snapshot i minnet. Om ingen cache finns ännu svarar webbplatsen med fel tills källfilen går att läsa igen.

Viktiga env vars:

- `SITE_DATA_URL`
- `SITE_DATA_REVALIDATE_SECONDS`
- `SITE_DATA_FETCH_TIMEOUT_MS`
- `DATA_DIR`
- `API_TOKEN` när `SITE_DATA_URL=api`

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

Exempel med fjärrdata från GitHub:

```bash
docker run --rm \
  -p 3000:3000 \
  expertbyran:latest
```

För lokal utveckling använder `.env.example` `SITE_DATA_URL=api` och lagrar data under `DATA_DIR`. Om du vill peka mot en extern snapshot-URL sätter du bara `SITE_DATA_URL` till den adressen.

## Innehållsmodell och marketplace

- `site-data.json` läses direkt från `mattahr/expertbyran` (`web/site-data.json` i monorepot)
- Snapshoten innehåller `marketplace`, `teams` och pluginmetadata på experter och team
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
