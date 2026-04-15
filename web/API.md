# Expertbyrån Web API

API för att hantera experter, team, expertområden och blogginlägg på Expertbyråns webbplats.

## Översikt

API:et tillhandahåller RESTful endpoints för att läsa och skriva data. All data lagras på disk i JSON-format och valideras med Zod-schemas.

## Autentisering

Mutating endpoints (POST, PUT, DELETE) kräver en Bearer token:

```http
Authorization: Bearer <token>
```

Token sätts via miljövariabeln `API_TOKEN`.

## Endpoints

### Site Data

#### GET /api/v1/site-data
Hämtar hela site-data-strukturen (experter, team, expertområden, etc.).

**Response:**
```json
{
  "version": 1,
  "updatedAt": "2026-04-15T10:00:00.000Z",
  "site": { ... },
  "organization": { ... },
  "marketplace": { ... },
  "expertAreas": [ ... ],
  "experts": [ ... ],
  "teams": [ ... ]
}
```

#### PUT /api/v1/site-data
Uppdaterar hela site-data-strukturen. Kräver autentisering.

**Request:**
```json
{
  "version": 1,
  "updatedAt": "2026-04-15T10:00:00.000Z",
  ...
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
      "areaSlugs": ["område1"],
      "excerpt": "Sammanfattning..."
    }
  ]
}
```

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
Tar bort ett blogginlägg (både metadata och markdown-fil). Kräver autentisering.

## Miljövariabler

| Variabel | Beskrivning | Default |
|----------|-------------|---------|
| `API_TOKEN` | Token för autentisering | - (måste sättas) |
| `DATA_DIR` | Katalog där data lagras | `/app/data` |
| `SITE_DATA_URL` | Om satt till `api`, används disklagring | `api` |

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
      - API_TOKEN=your-secret-token
volumes:
  expertbyran-data:
```

## Dataformat

Data lagras i `/app/data/`:
- `site-data.json` - Experter, team, områden, webbplatsinställningar
- `blog-data.json` - Blogginlägg metadata
- `blog/posts/*.md` - Markdown för varje blogginlägg

Vid första start kopieras data från `/app/seed/` till `/app/data/` om data-katalogen är tom.

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
