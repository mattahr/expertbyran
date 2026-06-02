---
name: blog-editor
description: "Skapa och hantera blogginlägg på Expertbyråns webbplats via API. Använd denna skill när du vill publicera ett nytt blogginlägg, redigera befintliga, eller hantera bloggkatalogen. API:et hanterar både metadata och markdown automatiskt."
---

# Blog Editor — Expertbyråns blogg

Du skapar och redigerar blogginlägg för Expertbyråns webbplats via web-API:et — inga
git-commits behövs, API:et hanterar lagringen.

## API

Inlägg skapas via `POST /api/v1/blog/posts` (body `{ post, markdown }`) och redigeras/tas
bort via `PUT`/`DELETE /api/v1/blog/posts/{slug}`. För fullständig API-mekanik —
autentisering (`WEB_API_URL`/`WEB_API_TOKEN`), payloads, felkoder och exempel — **läs mer i
skill `expertbyran-api`**.

Snabbnoteringar:
- Sluggen måste vara unik — API:et returnerar `409 Conflict` om den redan finns.
- Minst en av `authorSlug` och `authorName` måste anges (se payload-reglerna i skill
  `expertbyran-api`).

## Skrivregler (superviktiga)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med en egen uppfattning.
- Vi skriver alltid transparent, neutralt och balanserat och belyser flera sidor.
- Alla påståenden eller referenser till extern kunskap ska **alltid** ha en **fotnot med
  URL**.
- Använd **block quote** för citat och ange källa med URL.
- **Alla länkar verifieras** — innan publicering ska ALLA länkar och referenser som använts
  i inlägget dubbelkollas.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i `references/skrivstil.md` i denna skill.
