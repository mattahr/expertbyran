# Expertbyrån — publik webbplats

Denna mapp (`web/`) är **den publika Next.js-webbplatsen** för Expertbyrån. Den är en del av monorepot `mattahr/expertbyran` — se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och förhållandet till `marketplace/` och `paperclip/`.

## Syfte

Publik katalog som presenterar Expertbyråns experter, expertområden och marketplace-metadata. Webbappen exponerar också ett **REST API** som är den enda skrivvägen för innehåll (experter, expertområden, blogginlägg).

## Datamodell

All presentationsdata nås via en **lagringsabstraktion** med fem gränssnitt — `ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore` och `ForesightStore` — bakom en gemensam kompositionsrot. Innehållet lagras i **SQLite** via Nodes inbyggda `node:sqlite` (DB-fil `${DATA_DIR}/expertbyran.db`, WAL-läge); migreringar körs automatiskt vid serverstart (`src/lib/db/migrations.ts` via `src/instrumentation.ts`). Konsumenter rör aldrig databasen direkt.

Det finns **ingen seed-mekanism**: en nyinstallation startar med tom databas och sidorna visar tomlägen. Vid första start mot en volym med det gamla filbaserade formatet (`site-data.json`, `blog-data.json` + `blog/posts/*.md`, `foresight-data.json` + `foresight/*.md`, `radar-data.json` + `radar/*.json`) importeras innehållet automatiskt till SQLite (validera → rendera → importera → verifiera antal → döp om källfilerna till `*.imported`); misslyckas importen avbryts uppstarten. Nödventil: `SKIP_LEGACY_IMPORT=1`. Repots [site-data.json](site-data.json) konsumeras **inte** av webben längre — den underhålls enbart som marketplace-synkad presentationsdata.

### Skrivväg via REST API

Det **enda** sättet att mutera innehåll (experter, expertområden, blogginlägg) är via REST API:et:

* `GET /api/v1/site-data` - Sammansatt snapshot (config + experter + områden); ingen PUT
* `GET/POST/PUT/DELETE /api/v1/experts/[slug]` - Experthantering
* `GET/POST/PUT/DELETE /api/v1/areas/[slug]` - Expertområden
* `GET/POST/PUT/DELETE /api/v1/blog/posts/[slug]` - Blogginlägg
* `GET/POST/PUT/DELETE /api/v1/radars/[slug]` - Radarer
* `GET/POST/PUT/DELETE /api/v1/foresights/[slug]` - Foresights

Sajtconfig (site/organization/marketplace) bor i [src/config/site-config.json](src/config/site-config.json) och **bundlas i imagen** — den kan inte muteras via API utan ändras via repo + deploy.

Markdown renderas till HTML **vid skrivning** (i API:t) och lagras i en `html`-kolumn med `renderer_version`; läsvägen serverar färdig HTML. `POST /api/v1/rerender` (bearer-auth) renderar om rader med äldre renderarversion — serverstarten loggar en varning om sådana finns.

Cachning sker i webblagret via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `config`, `blog`, `radar`, `foresight`). API:et invaliderar med `revalidateTag(tag, "max")` efter skrivningar — det finns ingen separat refresh-endpoint (out-of-band-ändringar i databasen kräver omstart av containern). **Inget innehåll prerendras vid build** — alla innehållssidor är `force-dynamic` och renderas on-demand mot datacachen.

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
| `API_TOKEN` | Bearer-token för muterande API-anrop, `GET /refresh` och `POST /api/v1/rerender` | - (måste sättas) |
| `ADMIN_LOGIN_URL` | Mål-URL för "Logga in"-knappen i notisbannern | `https://admin.expertbyran.se` |
| `DATA_DIR` | Katalog (volym) där SQLite-databasen `expertbyran.db` ligger | `/app/data` (lokalt `data`) |
| `SKIP_LEGACY_IMPORT` | Sätt till `1` för att hoppa över automatisk import av gamla JSON-filer vid start | - |
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
      # Krävs för skrivanrop, GET /refresh och POST /api/v1/rerender
      - API_TOKEN=your-secret-token
volumes:
  expertbyran-data:
```

Databasen är en fil på volymen — backup = kopiera volymen (eller ta en sqlite-dump). Runnern är distroless; inspektera databasen från hosten, t.ex. `docker run --rm -v <volym>:/data alpine sh -c "apk add sqlite && sqlite3 /data/expertbyran.db ..."`.

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
