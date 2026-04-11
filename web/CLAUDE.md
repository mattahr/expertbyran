# Expertbyrån — publik webbplats

Denna mapp (`web/`) är **den publika Next.js-webbplatsen** för Expertbyrån. Den är en del av monorepot `mattahr/expertbyran` — se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och förhållandet till `marketplace/` och `paperclip/`.

## Syfte

Read-only katalog som presenterar Expertbyråns experter, team, expertområden och marketplace-metadata. Webbappen skriver inte data, har inget admin-API, och innehåller ingen autentisering.

## Datamodell

All presentationsdata ligger i **en enda JSON-fil**: [site-data.json](site-data.json). Den valideras med Zod vid inläsning och exponeras via `public/schemas/` för externa verktyg.

* **Källa vid runtime**: `SITE_DATA_URL` (default: hämtas från GitHub via `raw.githubusercontent.com`) — se [src/lib/content/store.ts](src/lib/content/store.ts).
* **Källa vid utveckling**: samma fil lokalt i repot (`web/site-data.json`). Fungerar som test-fixture och som det kanoniska innehållet som driftsatta containrar hämtar.
* **Snapshot-modell**: webbappen cachar senaste giltiga snapshot i minnet och pollar med `SITE_DATA_REVALIDATE_SECONDS`. Om hämtning misslyckas används cachen; om ingen cache finns svarar appen med fel.

`site-data.json` uppdateras av [expertbyran-manager-skillen](../paperclip/skills/local/expertbyran-manager/) när nya experter läggs till i `marketplace/`-pluginen.

## Stack

* **Next.js 16** med App Router, TypeScript, `output: "standalone"`
* **Zod** för schemavalidering av snapshoten
* **Vitest** för enhet- och render-tester
* **Docker** via minimal distroless-runner — se [Dockerfile](Dockerfile)

## Driftsättning

Docker-imagen publiceras till GHCR via GitHub Actions — workflow: [../.github/workflows/publish-web-container.yml](../.github/workflows/publish-web-container.yml). Triggas manuellt (`workflow_dispatch`). Build context är `./web`.

Viktiga miljövariabler för containern:

* `SITE_DATA_URL` — var snapshoten hämtas ifrån
* `SITE_DATA_REVALIDATE_SECONDS` — pollintervall (default 300)
* `SITE_DATA_FETCH_TIMEOUT_MS` — timeout per hämtning (default 10000)
* `HOSTNAME`, `PORT` — serverbindning

## Konventioner

* **Svenska med korrekta å, ä, ö** i all UI-text, docs, kommentarer.
* **Ingen write-path** — webbplatsen är avsiktligt read-only. Lägg inte till endpoint, form, eller API som muterar data.
* **Validera alltid** — snapshoten får aldrig användas utan att ha passerat Zod-schemat.

## Vanliga kommandon

```bash
npm run dev          # utvecklingsläge
npm run build        # produktionsbuild (standalone)
npm run test         # Vitest
npm run lint
npx tsc --noEmit
```

## Vidare läsning

* [README.md](README.md) — översikt och getting started
* [docs/architecture.md](docs/architecture.md) — arkitektur och dataflöde
* [docs/content-model.md](docs/content-model.md) — snapshot-schema
* [docs/marketplace-catalog.md](docs/marketplace-catalog.md) — förhållande till extern marketplace
* [docs/development-guide.md](docs/development-guide.md) — lokal utveckling
