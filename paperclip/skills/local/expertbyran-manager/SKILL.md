---
name: expertbyran-manager
description: "Hantera Expertbyråns monorepo (mattahr/expertbyran) — lägg till och uppdatera experter och expertområden via web-API:et, och håll marketplace-pluginens EXPERT.md och expert-registry i synk via git. Använd denna skill för att underhålla Expertbyrån-pluginen, lägga till nya konsulter, uppdatera profiler eller ändra expertregistret."
---

# Expertbyrån Manager

Du underhåller monorepot `mattahr/expertbyran`. Två spår:

1. **Webbplatsdata (experter, expertområden)** — uppdateras via **web-API:et**.
2. **Marketplace-pluginen** (`marketplace/experts/[slug]/EXPERT.md` och
   `marketplace/skills/konsultchef/expert-registry.md`) — uppdateras via **git-commit/PR**.

## Webbplatsdata via API

API:et är **enda sättet** att mutera experter och områden. För hur API:et fungerar
(autentisering, endpoints, payloads, felkoder, curl-exempel) — **läs mer i skill
`expertbyran-api`**.

Kortfattat:
- Ny expert → `POST /api/v1/experts`. Uppdatera → `PUT /api/v1/experts/{slug}`.
  Ta bort → `DELETE /api/v1/experts/{slug}`.
- Områden (sällan) → `POST /api/v1/areas`, `PUT|DELETE /api/v1/areas/{slug}`.
- Läs nuvarande data → `GET /api/v1/experts`, `GET /api/v1/areas` eller hela snapshoten
  via `GET /api/v1/site-data`.

**Begränsning:** organisation/site/marketplace-config är seed-/fil-författad och kan **inte**
muteras via API — försök inte uppdatera den via API:et.

## Marketplace-pluginen via git

| Källa | Syfte | Metod |
|-------|-------|-------|
| `marketplace/experts/[slug]/EXPERT.md` | Expertens identitet och metodik | Git-commit/PR |
| `marketplace/skills/konsultchef/expert-registry.md` | Kompakt register för routing | Git-commit/PR |

Följ samma validering och PR-process som tidigare för marketplace-filerna (se
`SKILL.md.backup` för den fullständiga EXPERT.md-/registry-processen).

## Arbetsflöde för en ny/ändrad expert

1. Skapa/uppdatera experten via API:et (se skill `expertbyran-api`).
2. Skapa/uppdatera `EXPERT.md` och `expert-registry.md` och committa via PR.
3. Verifiera att slug är konsekvent mellan API-data, EXPERT.md och registret.

## Innehållsregler (skrivregler)

- Vi röjer **aldrig** kunders namn eller identitet.
- Vi skriver aldrig argumenterande, politiskt färgat eller med egen uppfattning — alltid
  transparent, neutralt och balanserat, och belyser flera sidor.
- Alla påståenden och referenser till extern kunskap ska ha en **fotnot med URL**.
- Citat anges i **block quote** med källa (URL).
- **Alla länkar verifieras** innan publicering.
- Svenska med korrekta **å, ä, ö**.

Den fullständiga skrivstilen finns i skill `blog-editor`.
