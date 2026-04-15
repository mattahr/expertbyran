# Expertbyrån — publik webbplats

Denna mapp (`web/`) är **den publika Next.js-webbplatsen** för Expertbyrån. Den är en del av monorepot `mattahr/expertbyran` — se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och förhållandet till `marketplace/` och `paperclip/`.

## Syfte

Publik katalog som presenterar Expertbyråns experter, team, expertområden och marketplace-metadata. Webbappen exponerar också ett **REST API** för att hantera innehåll (experter, team, blogginlägg).

## Datamodell

All presentationsdata hanteras via två mekanismer:

### 1. API-läge (default i Docker)
Data lagras på disk i `/app/data/` och hanteras via REST API:
* `GET/PUT /api/v1/site-data` - Hela site-data-strukturen
* `GET/POST/PUT/DELETE /api/v1/experts/[slug]` - Experthantering
* `GET/POST/PUT/DELETE /api/v1/blog/posts/[slug]` - Blogginlägg

Se [API.md](API.md) för fullständig API-dokumentation.

### 2. URL-läge (bakåtkompatibelt)
När `SITE_DATA_URL` pekar på en HTTP-URL hämtas data från GitHub raw:
* **Källa vid runtime**: `SITE_DATA_URL` (default: `raw.githubusercontent.com`)
* **Snapshot-modell**: webbappen cachar senaste giltiga snapshot i minnet

## Stack

* **Next.js 16** med App Router, TypeScript, `output: "standalone"`
* **Zod** för schemavalidering
* **Vitest** för enhet- och render-tester
* **Docker** via minimal distroless-runner — se [Dockerfile](Dockerfile)

## Driftsättning

Docker-imagen publiceras till GHCR via GitHub Actions — workflow: [../.github/workflows/publish-web-container.yml](../.github/workflows/publish-web-container.yml).

### Viktiga miljövariabler

| Variabel | Beskrivning | Default |
|----------|-------------|---------|
| `API_TOKEN` | Token för autentisering av API-anrop | - (måste sättas för API-läge) |
| `DATA_DIR` | Katalog där data lagras | `/app/data` |
| `SITE_DATA_URL` | `api` för disklagring, annars HTTP URL | `api` |
| `SITE_DATA_REVALIDATE_SECONDS` | Pollintervall | 300 |
| `SITE_DATA_FETCH_TIMEOUT_MS` | Timeout per hämtning | 10000 |
| `HOSTNAME`, `PORT` | Serverbindning | `0.0.0.0`, `3000` |

### Docker Compose exempel

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - expertbyran-data:/app/data
    environment:
      - API_TOKEN=your-secret-token
volumes:
  expertbyran-data:
```

## Konventioner

* **Svenska med korrekta å, ä, ö** i all UI-text, docs, kommentarer.
* **API för mutationer** — använd API:et för att uppdatera experter och blogginlägg.
* **Validera alltid** — data valideras med Zod vid både läsning och skrivning.

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
* [API.md](API.md) — REST API-dokumentation
* [docs/architecture.md](docs/architecture.md) — arkitektur och dataflöde
* [docs/content-model.md](docs/content-model.md) — snapshot-schema
* [docs/marketplace-catalog.md](docs/marketplace-catalog.md) — förhållande till extern marketplace
* [docs/development-guide.md](docs/development-guide.md) — lokal utveckling
