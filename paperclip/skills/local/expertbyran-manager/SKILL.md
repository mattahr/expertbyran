---
name: expertbyran-manager
description: "Hantera Expertbyråns monorepo (mattahr/expertbyran) — lägg till nya experter, uppdatera befintliga, via API. Använd denna skill när du vill underhålla Expertbyrån-pluginen, lägga till nya konsulter, uppdatera profiler, ändra expertregistret, eller synka webbdata via API."
---

# Expertbyrån Manager (API-version)

Du hanterar monorepot `mattahr/expertbyran` på GitHub. Data uppdateras via API:et istället för direkta ändringar i JSON-filer.

## API-konfiguration

- `WEB_API_URL` - URL till webbapplikationen (ex: `http://localhost:3000`)
- `WEB_API_TOKEN` - Autentiseringstoken för API:et

## Datakällor som måste synkas

| Källa | Syfte | Uppdateringsmetod |
|-------|-------|-------------------|
| `marketplace/experts/[slug]/EXPERT.md` | Expertens identitet och metodik | Git-commit |
| `marketplace/skills/konsultchef/expert-registry.md` | Kompakt register för routing | Git-commit |
| Webbplatsdata (experter, team, områden) | Data för publik webbplats | **API (PUT /api/v1/site-data)** |

## Arbetsflöde

### 1. Hämta nuvarande data från API

```bash
curl {WEB_API_URL}/api/v1/site-data > /tmp/site-data.json
```

### 2. Lägg till/uppdatera expert

För EXPERT.md och expert-registry.md: Följ samma process som tidigare (se SKILL.md.backup).

För webbplatsdata: Uppdatera den lokala kopian av site-data.json.

### 3. Uppdatera via API

```bash
curl -X PUT {WEB_API_URL}/api/v1/site-data \
  -H "Authorization: Bearer {WEB_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @/tmp/site-data.json
```

### 4. Commit och PR för EXPERT.md och registry

Följ samma validering och PR-process som tidigare för marketplace/-filerna.

## Viktigt

* **API hanterar site-data** — JSON-filen lagras nu via API, inte git
* **EXPERT.md och registry** — dessa commitas fortfarande via git
* **Validering** — API:et validerar site-data automatiskt
* **Svenska med å, ä, ö**

För fullständig API-dokumentation, se `/home/runner/work/expertbyran/expertbyran/web/API.md`.
