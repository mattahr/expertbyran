---
name: webbmaster-publicering
description: "Webbmasterns publicering till Expertbyråns webbplats via API. Använd denna skill för att publicera och uppdatera expert-CV:n och blogginlägg på den publika webbplatsen och hålla webbmasterns publicerat.md-tillstånd i synk. Operationerna är idempotenta."
---

# Webbmaster-publicering

Du publicerar webbmasterns innehåll till Expertbyråns publika webbplats via web-API:et.
För hur API:et fungerar (autentisering `WEB_API_URL`/`WEB_API_TOKEN`, endpoints, payloads,
felkoder, curl-exempel) — **läs mer i skill `expertbyran-api`**.

Alla operationer är **idempotenta**: samma operation två gånger ska vara en no-op. Tillstånd
hålls i `agents/webbmaster/publicerat.md`.

## Kontraktsoperationer → API

| Operation | API-anrop |
|-----------|-----------|
| `publish-cv` (ny expert) | `POST /api/v1/experts` |
| `publish-cv` (ändrad expert) | `PUT /api/v1/experts/{slug}` |
| `delete-cv` | `DELETE /api/v1/experts/{slug}` |
| `publish-blog` | `POST /api/v1/blog/posts` |
| `update-blog` | `PUT /api/v1/blog/posts/{slug}` |
| `delete-blog` | `DELETE /api/v1/blog/posts/{slug}` |
| `get-status` | `GET /api/v1/site-data` + `GET /api/v1/blog/posts` |

## Idempotens

### publish-cv
1. Bygg expertens CV-payload (se fältschema i skill `expertbyran-api`).
2. Beräkna en hash av CV-innehållet (normalisera whitespace, exkludera `senast_uppdaterad`).
3. Jämför med `cv_hashar[<slug>]` i `publicerat.md`.
4. Oförändrad hash → skip (no-op).
5. Ny/ändrad hash:
   - Finns experten redan (`GET /api/v1/experts/{slug}` ≠ 404)? → `PUT`. Annars → `POST`.
   - Uppdatera `cv_hashar[<slug>]` och lägg rad i `publiceringshistorik` i `publicerat.md`.

### publish-blog / update-blog
1. Kontrollera om sluggen finns via `get-status` (`GET /api/v1/blog/posts`).
2. Finns den inte → `POST /api/v1/blog/posts`. Finns den → `PUT /api/v1/blog/posts/{slug}`.
3. Lägg/uppdatera raden i `publicerade_inlagg` och `publiceringshistorik`.

### delete-cv / delete-blog
1. `DELETE` mot rätt endpoint. `404` behandlas som redan borttaget (no-op).
2. Ta bort posten ur `publicerat.md` och logga i `publiceringshistorik`.

## Felhantering

- `401` → token saknas/fel; avbryt och logga i webbmasterns memory.
- `409` (slug finns) vid `POST` → byt till `PUT` mot samma slug.
- `404` vid `PUT`/`DELETE` → posten finns inte; för delete = no-op, för put = skapa via POST.
- `400` → valideringsfel; logga fältfelen och korrigera payloaden.

Logga varje skarp operation i `agents/webbmaster/memory/YYYY-MM-DD.md`.

## publicerat.md-format

Webbmastern underhåller `agents/webbmaster/publicerat.md`:

```yaml
---
type: "webmaster-state"
senast_uppdaterad: "2026-04-12T14:32:00"
---

# Publicerat tillstånd

cv_hashar:
  effektivitetsrevisor: "a1b2c3d4…"

publicerade_inlagg:
  - id: "blog-2026-04-12-lss-triangulering"
    titel: "Ny specialisering: LSS-triangulering"
    datum: "2026-04-12"
    författare: "Dr Karin Bergström"

publiceringshistorik:
  - datum: "2026-04-12T14:32:00"
    operation: "publish-cv"
    target: "expert-valfard"
```

(Fältet `stub: true` används inte längre för skarpa publiceringar; äldre historik-rader får
stå kvar.)

## Innehållsregler (skrivregler)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.

## Referenser (webbmasterns egna filer)

- `agents/webbmaster/AGENTS.md` — webbmasterns roll
- `agents/webbmaster/SOUL.md` — redaktionell röst
- `agents/webbmaster/publicerat.md` — state-fil
