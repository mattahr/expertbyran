# Expertbyrån Web API

API för att hantera experter, expertområden, blogginlägg, radarer och foresights på Expertbyråns webbplats.

## Översikt

All data nås via en lagringsabstraktion (`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`, `ForesightStore`). Lagringen är **SQLite** via Nodes inbyggda `node:sqlite` (DB-fil `${DATA_DIR}/expertbyran.db`), men API-kontraktet är oberoende av backend. API:et är den **enda skrivvägen** för innehåll (experter, expertområden, blogginlägg, radarer, foresights) — konsumenter rör aldrig databasen direkt.

Markdown renderas till HTML **vid skrivning** och lagras tillsammans med en renderarversion; webbplatsens läsväg serverar färdig HTML. API:ets GET-svar returnerar markdown (källan), inte HTML.

GET-listorna (`/api/v1/experts`, `/api/v1/blog/posts`, `/api/v1/foresights` m.fl.) är **opaginerade — det är ett medvetet kontrakt** mot skills och andra klienter. (Webbplatsens listsidor pagineras internt, men det påverkar inte API:et.) Innehållslistorna (blogg, foresights, radars) är sorterade **nyast först** (datum fallande, slug som tiebreaker); experter/områden behåller insättningsordningen. `GET /api/v1/site-data` returnerar `updatedAt` från den bundlade sajtconfigen — den ändras vid deploy, **inte** vid innehållsmutationer, och ska inte användas för förändringsdetektion. Vid tom databas (nyinstallation) svarar snapshotten 200 med tomma `experts`/`expertAreas`-arrayer.

Konfigurationsdata (site/organization/marketplace) bundlas i imagen via `src/config/site-config.json` och kan inte muteras via API — den ändras via repo + deploy.

## Autentisering

Mutating endpoints (POST, PUT, DELETE) samt `GET /refresh` och `POST /api/v1/rerender` kräver en Bearer token:

```http
Authorization: Bearer <token>
```

Token sätts via miljövariabeln `API_TOKEN`. Oautentiserat anrop ger `401`.

## Endpoints

### Site Data

#### GET /api/v1/site-data
Hämtar det sammansatta snapshot:et (config + experter + expertområden).

**Response:**
```json
{
  "version": 1,
  "updatedAt": "2026-04-15T10:00:00.000Z",
  "site": { ... },
  "organization": { ... },
  "marketplace": { ... },
  "expertAreas": [ ... ],
  "experts": [ ... ]
}
```

### Experter

#### GET /api/v1/experts
Hämtar lista av alla experter.

**Response:**
```json
{
  "experts": [
    {
      "id": "expert-klarsprak",
      "slug": "klarsprak",
      "name": "Klarspråk",
      ...
    }
  ]
}
```

#### POST /api/v1/experts
Skapar en ny expert. Kräver autentisering.

**Request:**
```json
{
  "id": "expert-slug",
  "slug": "slug",
  "name": "Expert Name",
  "areaSlugs": ["område1"],
  ...
}
```

#### GET /api/v1/experts/[slug]
Hämtar en specifik expert.

#### PUT /api/v1/experts/[slug]
Uppdaterar en expert. Kräver autentisering.

#### DELETE /api/v1/experts/[slug]
Tar bort en expert. Kräver autentisering.

### Expertområden

#### GET /api/v1/areas

Hämtar lista av alla expertområden.

**Response:**
```json
{
  "areas": [ ... ]
}
```

#### POST /api/v1/areas

Skapar ett nytt expertområde. Kräver autentisering.

**Request:** Ett ExpertArea-objekt. Returnerar 409 om slug redan finns.

#### GET /api/v1/areas/[slug]

Hämtar ett specifikt expertområde. Returnerar 404 om det inte finns.

#### PUT /api/v1/areas/[slug]

Uppdaterar ett expertområde. Kräver autentisering.

#### DELETE /api/v1/areas/[slug]

Tar bort ett expertområde. Kräver autentisering.

### Blogginlägg

#### GET /api/v1/blog/posts
Hämtar metadata för alla blogginlägg.

**Response:**
```json
{
  "posts": [
    {
      "slug": "inlagg-slug",
      "title": "Titel",
      "date": "2026-04-15T10:00:00.000Z",
      "authorSlug": "expert-slug",
      "authorName": "Visningsnamn",
      "authorRole": "Roll (valfri)",
      "areaSlugs": ["område1"],
      "excerpt": "Sammanfattning..."
    }
  ]
}
```

**Författarfält:** Minst en av `authorSlug` och `authorName` måste anges.

- `authorSlug` (valfri): om den matchar en befintlig expert används expertens data och en länk till `/experter/<slug>` skapas på detaljsidan.
- `authorName` (valfri): visningsnamn. Används alltid om det är satt och fallbackas till expertens namn när bara `authorSlug` finns. Krävs när `authorSlug` saknas eller inte matchar någon expert.
- `authorRole` (valfri): fri text för roll. Visas endast om satt — för matchande expert används expertens roll om `authorRole` saknas.

#### POST /api/v1/blog/posts
Skapar ett nytt blogginlägg. Kräver autentisering.

**Request:**
```json
{
  "post": {
    "slug": "mitt-inlagg",
    "title": "Mitt Inlägg",
    "date": "2026-04-15T10:00:00.000Z",
    "authorSlug": "expert-slug",
    "areaSlugs": ["område1"],
    "excerpt": "Sammanfattning..."
  },
  "markdown": "# Innehåll\n\nMarkdown-text..."
}
```

För gästförfattare utan egen expertsida, använd `authorName` (och ev. `authorRole`) istället för `authorSlug`:

```json
{
  "post": {
    "slug": "gastinlagg",
    "title": "Gästinlägg",
    "date": "2026-04-15T10:00:00.000Z",
    "authorName": "Anna Andersson",
    "authorRole": "Gästskribent, Lunds universitet",
    "areaSlugs": ["revisionsmetodik"],
    "excerpt": "..."
  },
  "markdown": "..."
}
```

#### GET /api/v1/blog/posts/[slug]
Hämtar metadata och markdown för ett blogginlägg.

**Response:**
```json
{
  "post": { ... },
  "markdown": "# Innehåll\n\nMarkdown-text..."
}
```

#### PUT /api/v1/blog/posts/[slug]
Uppdaterar ett blogginlägg. Kräver autentisering.

Kan uppdatera metadata (`post`), markdown (`markdown`), eller båda.

**Request:**
```json
{
  "post": { ... },   // Valfritt
  "markdown": "..."  // Valfritt
}
```

#### DELETE /api/v1/blog/posts/[slug]
Tar bort ett blogginlägg (metadata, markdown och renderad HTML). Kräver autentisering.

### Radarer

En radar består av metadata (`meta`, inkl. namngivna `segments`) och en lista `blips`. Ringarna (`anta`/`prova`/`bevaka`/`avvakta`) är fasta för alla radarer; segmenten definieras per radar.

#### GET /api/v1/radars

Hämtar metadata för alla radarer (utan blips).

**Response:**
```json
{ "radars": [ { "slug": "teknikradar-2026", "title": "Teknikradar 2026", "date": "2026-06-03T00:00:00.000Z", "segments": [ { "id": "ai-agenter", "name": "AI & agenter" } ] } ] }
```

#### POST /api/v1/radars

Skapar en radar. Kräver autentisering. Body: `{ "meta": {…}, "blips": [ … ] }`. `201` vid skapad, `409` om slug finns, `400` vid valideringsfel (inkl. blip mot okänt segment).

#### GET /api/v1/radars/[slug]

Hämtar `{ "meta": {…}, "blips": [ … ] }`. `404` om radarn saknas.

#### PUT /api/v1/radars/[slug]

Uppdaterar metadata, blips, eller båda. Kräver autentisering. Body: `{ "meta"?: {…}, "blips"?: [ … ] }`. `404`/`409`/`400`.

#### DELETE /api/v1/radars/[slug]

Tar bort en radar (metadata + blips). Kräver autentisering. `404` om saknas.

### Foresights

En foresight är en strategisk framsynsanalys: metadata + markdown, precis som ett blogginlägg, med ett extra `horizon`-fält.

#### GET /api/v1/foresights

Hämtar metadata för alla foresights.

#### POST /api/v1/foresights

Skapar en foresight. Kräver autentisering. Body: `{ "foresight": {…metadata}, "markdown": "…" }`. `201` / `409` / `400`.

#### GET /api/v1/foresights/[slug]

Hämtar `{ "foresight": {…}, "markdown": "…" }`. `404` om saknas.

#### PUT /api/v1/foresights/[slug]

Uppdaterar metadata, markdown, eller båda. Kräver autentisering. Body: `{ "foresight"?: {…}, "markdown"?: "…" }`. `404`/`409`.

#### DELETE /api/v1/foresights/[slug]

Tar bort en foresight (metadata, markdown och renderad HTML). Kräver autentisering. `404` om saknas.

### Underhåll

Skrivanrop invaliderar cachen automatiskt — det finns ingen separat refresh-endpoint. Vid out-of-band-ändringar (t.ex. direkt i databasen): starta om containern.

#### POST /api/v1/rerender

Underhållsendpoint som renderar om lagrad HTML för blogginlägg och foresights vars `renderer_version` avviker från den aktuella renderarversionen (markdown är källan, HTML är härledd). Kräver autentisering. Körs efter deploy av en ny renderarversion — serverstarten loggar en varning om sådana rader finns.

**Response:**
```json
{ "ok": true, "rerendered": { "blog": 12, "foresights": 2 }, "rendererVersion": 1 }
```

## Miljövariabler

| Variabel             | Beskrivning                                                        | Default          |
|----------------------|--------------------------------------------------------------------|------------------|
| `API_TOKEN`          | Token för autentisering                                            | - (måste sättas) |
| `DATA_DIR`           | Katalog (volym) där SQLite-databasen `expertbyran.db` ligger       | `/app/data`      |
| `SKIP_LEGACY_IMPORT` | Sätt till `1` för att hoppa över automatisk legacy-import vid start | -                |

## Docker

Exempel docker-compose.yml:

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

## Lagring

Allt innehåll lagras i SQLite-databasen `${DATA_DIR}/expertbyran.db` (WAL-läge). Tabeller: `blog_posts`, `blog_post_areas`, `foresights`, `radars`, `experts`, `expert_areas`, `schema_migrations`. Migreringar körs automatiskt vid serverstart.

Det finns ingen seed-mekanism — en nyinstallation startar med tom databas. Vid första start mot en volym med det gamla filbaserade formatet (`site-data.json`, `blog-data.json` + `blog/posts/*.md`, `foresight-data.json` + `foresight/*.md`, `radar-data.json` + `radar/*.json`) importeras innehållet automatiskt till SQLite och källfilerna döps om till `*.imported`. Misslyckas importen avbryts uppstarten (inga halvimporter); `SKIP_LEGACY_IMPORT=1` hoppar över importen.

Backup: databasen är en fil på volymen — kopiera volymen eller ta en sqlite-dump.

## Exempel med curl

### Hämta alla experter
```bash
curl http://localhost:3000/api/v1/experts
```

### Skapa ny expert
```bash
curl -X POST http://localhost:3000/api/v1/experts \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "expert-test",
    "slug": "test",
    "name": "Test Expert",
    "areaSlugs": ["digitalisering"],
    ...
  }'
```

### Skapa nytt blogginlägg
```bash
curl -X POST http://localhost:3000/api/v1/blog/posts \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "post": {
      "slug": "mitt-inlagg",
      "title": "Mitt Inlägg",
      "date": "2026-04-15T10:00:00.000Z",
      "authorSlug": "effektivitetsrevisor",
      "areaSlugs": ["revisionsmetodik"],
      "excerpt": "En kort sammanfattning..."
    },
    "markdown": "# Rubrik\n\nInnehåll här..."
  }'
```
