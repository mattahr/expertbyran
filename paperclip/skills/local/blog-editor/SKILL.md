***

name: blog-editor
description: "Skapa och hantera blogginlägg på Expertbyråns webbplats via API. Använd denna skill när du vill publicera ett nytt blogginlägg, redigera befintliga, eller hantera bloggkatalogen. API:et hanterar både metadata (blog-data.json) och markdown-filer automatiskt."
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Blog Editor — Expertbyråns blogg (API-version)

Du hanterar blogginlägg för Expertbyråns webbplats via API. Ändringar görs direkt via HTTP-anrop till API:et — inga git-commits behövs.

## API-konfiguration

API-bas-URL måste konfigureras i din miljö. För lokal utveckling/testning:

* `WEB_API_URL` - URL till webbapplikationen (ex: `http://localhost:3000`)
* `WEB_API_TOKEN` - Autentiseringstoken för API:et

## API Endpoints

Se `/home/runner/work/expertbyran/expertbyran/web/API.md` för fullständig API-dokumentation.

### Skapa nytt inlägg

```HTTP
POST {WEB_API_URL}/api/v1/blog/posts
Authorization: Bearer {WEB_API_TOKEN}
Content-Type: application/json

{
  "post": {
    "slug": "kebab-case-slug",
    "title": "Inläggets titel",
    "date": "2026-04-15T14:00:00.000Z",
    "authorSlug": "<expert-slug>",
    "areaSlugs": ["<area-slug>"],
    "excerpt": "Kort sammanfattning för listningen."
  },
  "markdown": "# Rubrik\n\nMarkdown-innehåll här..."
}
```

## Viktigt

* **Sluggen måste vara unik** — API:et returnerar 409 Conflict om sluggen redan finns
* **Validering sker vid skrivning** — API:et validerar alla fält med Zod-schema
* **Inga git-commits** — API:et hanterar lagring direkt till disk
* **Svenska med å, ä, ö** i allt innehåll
* **Vi röjer ALDRIG kunders namn eller identitet.**
* Vi skriver aldrig argumenterande, politiskt färgat eller med en egen uppfattning.
* Vi skriver alltid transparent, neutralt, balanserat, belyser flera sidor
* **Alla länkar verifieras** - Innan publicering ska ALLA länkar och referenser som använts in inlägget dubbelkollas.

För detaljer om schema, felhantering och exempel — se web/API.md.
