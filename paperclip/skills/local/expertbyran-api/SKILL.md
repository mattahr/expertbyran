---
name: expertbyran-api
description: "Hur Expertbyråns webb-API fungerar och används — den enda källan för att läsa och skriva innehåll (experter, expertområden, blogginlägg) via REST. Använd denna skill när du ska publicera eller uppdatera innehåll på Expertbyråns webbplats via API, slå upp endpoints, payloads, autentisering (WEB_API_URL/WEB_API_TOKEN) eller felkoder. Andra skills hänvisar hit för API-mekaniken."
---

# Expertbyrån API — referens

Detta är den **enda källan** för hur Expertbyråns webb-API fungerar. Andra skills hänvisar
hit ("läs mer i skill `expertbyran-api`") i stället för att duplicera API-mekaniken.

API:et är **enda sättet** att mutera innehåll (experter, expertområden, blogginlägg).
Konfigurationsdata (site/organisation/marketplace) är seed-/fil-författad och kan **inte**
muteras via API.

## Konfiguration

- `WEB_API_URL` — basadress till webbappen (ex: `http://localhost:3000`).
- `WEB_API_TOKEN` — token som skickas som `Authorization: Bearer <token>` vid muterande
  anrop (POST/PUT/DELETE). Läsanrop (GET) kräver ingen token.

## Konventioner

- All data är JSON och valideras med Zod vid skrivning.
- Innehåll skrivs på svenska med korrekta å, ä, ö.
- Slug måste matcha `^[a-z0-9-]+$`.
- Felkoder: `200` OK, `201` skapad, `400` valideringsfel, `401` saknad/fel token,
  `404` finns inte, `409` slug finns redan.

## Endpoints

### Experter
- `GET /api/v1/experts` → `{ "experts": [ … ] }`
- `POST /api/v1/experts` (auth) — body: ett Expert-objekt. `201` / `409` om slug finns.
- `GET /api/v1/experts/{slug}` → Expert-objektet, `404` om saknas.
- `PUT /api/v1/experts/{slug}` (auth) — body: hela Expert-objektet. `404`/`409`.
- `DELETE /api/v1/experts/{slug}` (auth) — `404` om saknas.

### Expertområden
- `GET /api/v1/areas` → `{ "areas": [ … ] }`
- `POST /api/v1/areas` (auth) — body: ett ExpertArea-objekt. `201` / `409`.
- `GET /api/v1/areas/{slug}` → ExpertArea, `404` om saknas.
- `PUT /api/v1/areas/{slug}` (auth) — body: hela ExpertArea-objektet. `404`/`409`.
- `DELETE /api/v1/areas/{slug}` (auth) — `404` om saknas.

### Blogginlägg
- `GET /api/v1/blog/posts` → `{ "posts": [ …metadata ] }`
- `POST /api/v1/blog/posts` (auth) — body: `{ "post": {…metadata}, "markdown": "…" }`.
  `201` / `409`.
- `GET /api/v1/blog/posts/{slug}` → `{ "post": {…}, "markdown": "…" }`, `404` om saknas.
- `PUT /api/v1/blog/posts/{slug}` (auth) — body: `{ "post"?: {…}, "markdown"?: "…" }`
  (metadata, markdown, eller båda). `404`/`409`.
- `DELETE /api/v1/blog/posts/{slug}` (auth) — `404` om saknas.

### Sammansatt snapshot & cache
- `GET /api/v1/site-data` → hela den sammansatta snapshoten (config + experter + områden).
  **Läs-only — ingen PUT.**
- `GET /refresh` → invaliderar cachetaggarna (`experts`, `areas`, `blog`). Behövs sällan,
  eftersom skrivanrop invaliderar cachen automatiskt.

Fältscheman för Expert, ExpertArea och BlogPostEntry finns i `references/payloads.md`.

## Exempel (curl)

Skapa en expert:
```bash
curl -X POST "$WEB_API_URL/api/v1/experts" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @expert.json
```

Uppdatera ett område:
```bash
curl -X PUT "$WEB_API_URL/api/v1/areas/revisionsmetodik" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @area.json
```

Skapa ett blogginlägg:
```bash
curl -X POST "$WEB_API_URL/api/v1/blog/posts" \
  -H "Authorization: Bearer $WEB_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "post": {
      "slug": "mitt-inlagg",
      "title": "Mitt inlägg",
      "date": "2026-04-15T10:00:00.000Z",
      "authorSlug": "effektivitetsrevisor",
      "areaSlugs": ["revisionsmetodik"],
      "excerpt": "Kort sammanfattning."
    },
    "markdown": "# Rubrik\n\nInnehåll…"
  }'
```

Ta bort ett inlägg:
```bash
curl -X DELETE "$WEB_API_URL/api/v1/blog/posts/mitt-inlagg" \
  -H "Authorization: Bearer $WEB_API_TOKEN"
```

## Innehållsregler (skrivregler)

Dessa gäller allt innehåll som publiceras via API:et:

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.
