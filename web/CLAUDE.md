# Expertbyrån — publik webbplats

Denna mapp (`web/`) är **den publika Next.js-webbplatsen** för Expertbyrån. Den är en del av monorepot `mattahr/expertbyran` — se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och förhållandet till `marketplace/` och `paperclip/`.

## Syfte

Publik katalog som presenterar Expertbyråns experter, expertområden och marketplace-metadata. Webbappen exponerar också ett **REST API** som är den enda skrivvägen för innehåll (experter, expertområden, blogginlägg).

## Datamodell

All presentationsdata nås via en **lagringsabstraktion** med tre gränssnitt — `ConfigStore`, `ContentStore` och `BlogStore` — bakom en gemensam kompositionsrot. Implementationerna är filbaserade i dag (data under `DATA_DIR`) men kan bytas mot en databasbackend utan att konsumenterna ändras. Konsumenter rör aldrig filer direkt.

### Skrivväg via REST API

Det **enda** sättet att mutera innehåll (experter, expertområden, blogginlägg) är via REST API:et:

* `GET /api/v1/site-data` - Sammansatt snapshot (config + experter + områden); ingen PUT
* `GET/POST/PUT/DELETE /api/v1/experts/[slug]` - Experthantering
* `GET/POST/PUT/DELETE /api/v1/areas/[slug]` - Expertområden
* `GET/POST/PUT/DELETE /api/v1/blog/posts/[slug]` - Blogginlägg

Konfigurationsdata (site/organization/marketplace) är fil- och seed-hanterad och kan inte muteras via API.

Cachning sker i webblagret via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `blog`). API:et invaliderar med `revalidateTag(tag, "max")` efter skrivningar; `GET /refresh` invaliderar alla innehållstaggar.

Se [API.md](API.md) för fullständig API-dokumentation.

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
| `API_TOKEN` | Bearer-token för autentisering av muterande API-anrop | - (måste sättas) |
| `DATA_DIR` | Katalog där data lagras | `/app/data` (lokalt `data`) |
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
