---
name: expertbyran-manager
description: "Hantera Expertbyråns GitHub-repo (mattahr/expertbyran-marketplace) — lägg till nya experter, uppdatera befintliga, och håll web/site-data.json i synk. Använd denna skill när du vill underhålla Expertbyrån-pluginen, lägga till nya konsulter, uppdatera profiler, ändra expertregistret, eller synka webbdata. Trigga även vid omnämnanden av Expertbyrån marketplace, expert-registry, site-data.json, eller EXPERT.md-filer."
---

# Expertbyrån Manager

Du hanterar repot `mattahr/expertbyran-marketplace` på GitHub. Repot är en Claude Code-plugin som distribueras via GitHubs plugin-system. Ändringar som pushas till `main` uppdaterar automatiskt alla installerade instanser.

Repot har tre datakällor som **alltid måste hållas i synk**:

| Källa | Syfte |
|-------|-------|
| `experts/[slug]/EXPERT.md` | Expertens identitet och metodik — laddas av subagenter |
| `skills/konsultchef/expert-registry.md` | Kompakt register som konsultchefen läser för routing |
| `web/site-data.json` | Data för publik webbplats — hämtas av statisk server |

## Förutsättningar

- `gh` (GitHub CLI) måste vara installerat och autentiserat (`gh auth status`)
- `python3` för valideringsskripten

## Arbetsflöde

### 1. Förstå uppgiften

Fråga användaren om det inte framgår:
- Ska en **ny expert** läggas till, eller ska en **befintlig** uppdateras?
- Expertens domän, namn, roll, triggers, capabilities
- Om ny: vilka befintliga `expertAreas` tillhör experten? (Läs schemat i `references/site-data-schema.md` för tillgängliga areaSlugs)
- Om ny: ska experten ingå i ett befintligt team? (Kontrollera `teams[]` i site-data.json)

### 2. Klona repot

```bash
WORK_DIR=$(mktemp -d)
gh repo clone mattahr/expertbyran-marketplace "$WORK_DIR"
cd "$WORK_DIR"
git checkout -b expert/[slug]-[add|update]
```

### 3. Läs nuvarande tillstånd

Innan du ändrar något — läs alltid:
- `web/site-data.json` (hela filen, den är ~1200 rader)
- `skills/konsultchef/expert-registry.md`
- Om uppdatering: `experts/[slug]/EXPERT.md`

Det här steget är kritiskt. site-data.json har ett strikt schema och du behöver se befintliga poster för att veta vilka sortOrder, areaSlugs och slug-mönster som redan används.

Läs schemat:
```
Read references/site-data-schema.md
```

### 4a. Lägg till ny expert

#### EXPERT.md

Skapa `experts/[slug]/EXPERT.md`. Sluggen kan vara antingen ett personnamn i kebab-case (`klara-nordin`) eller ett beskrivande namn (`klarsprak`) — det viktiga är att det är unikt och konsekvent med id, portrait och contactLinks.

Följ den befintliga expertens format exakt. Referera till `experts/klarsprak/EXPERT.md` i det klonade repot som mall — den visar exakt hur frontmatter, struktur och kedjning ser ut. Här är en översikt av strukturen:

```
# Strukturöversikt (se befintlig EXPERT.md för exakt format)

Frontmatter (*** som avgränsare):
  name, domain, triggers (som lista), capabilities, can_chain_to

Sektioner:
  # [Expertens namn]
  ## Identitet — 2-3 meningar om roll och arbetsfilosofi
  ## Metodik — Steg-för-steg per arbetsläge
  ## Principer — Numrerad lista med kärnprinciper
  ## Fördjupning — Read-referens till references/
  ## Kedjning — När och hur experten kontaktar kollegor
```

Skapa också `experts/[slug]/references/` (kan vara tom initialt, eller med relevant referensmaterial).

#### Expert-registry

Lägg till i `skills/konsultchef/expert-registry.md`:

```markdown
## [Expertens namn]

* **Domän:** [domän]
* **Triggers:** [kommaseparerade triggers]
* **Capabilities:**
  * **[id]** — [beskrivning]
* **Sökväg:** experts/[slug]/EXPERT.md
* **Kan kedja till:** [expert-slug] (vid [situation])
```

#### site-data.json

Lägg till ett nytt objekt i `experts[]`-arrayen. Följ **exakt** det schema som dokumenteras i `references/site-data-schema.md`.

Viktiga regler:
- **sortOrder**: Använd nästa lediga multipel av 10 (kolla befintliga)
- **areaSlugs**: Måste matcha befintliga `expertAreas[].slug`. Skapa nytt expertArea bara om ingen befintlig kategori rimligt täcker expertens domän — fråga användaren först
- **id**: Formatet `expert-[slug]`
- **portrait.src**: `/avatars/[slug].svg`
- **plugin.repositoryUrl**: Alltid `https://github.com/mattahr/expertbyran-plugins`
- **contactLinks**: Minst email + calendar. Url-mönster för email: `mailto:[förnamn].[efternamn]@expertbyran.ai` (t.ex. `klara.nordin@expertbyran.ai`). Calendar: `https://calendar.app.google/[slug]`
- **Alla texter på svenska** med korrekta å, ä, ö
- **updatedAt**: Sätt till aktuellt datum och tid i ISO 8601 UTC-format, t.ex. `2026-04-12T10:00:00.000Z`
- **Team-tillhörighet**: Om experten ska ingå i ett befintligt team, lägg till expertens slug i teamets `expertSlugs[]`-array i site-data.json

### 4b. Uppdatera befintlig expert

1. Redigera `experts/[slug]/EXPERT.md` med ändringarna
2. Om triggers eller capabilities ändrats → uppdatera `expert-registry.md`
3. Uppdatera motsvarande objekt i `site-data.json` → `experts[]` (matcha på `slug`)
4. Uppdatera `updatedAt`

**Rör aldrig andra experters poster** i site-data.json. Ändra bara den expert som berörs.

### 5. Validera

Innan commit, kontrollera:

```bash
# Validera att site-data.json är giltig JSON
python3 -c "import json; json.load(open('web/site-data.json'))"

# Kontrollera att inga areaSlugs pekar på obefintliga areas
python3 -c "
import json
data = json.load(open('web/site-data.json'))
valid_slugs = {a['slug'] for a in data['expertAreas']}
for e in data['experts']:
    for s in e['areaSlugs']:
        assert s in valid_slugs, f'{e[\"slug\"]}: areaSlugs {s} finns inte i expertAreas'
print('areaSlugs OK')
"

# Kontrollera att inga team-expertSlugs pekar på obefintliga experter
python3 -c "
import json
data = json.load(open('web/site-data.json'))
valid_slugs = {e['slug'] for e in data['experts']}
for t in data['teams']:
    for s in t['expertSlugs']:
        assert s in valid_slugs, f'Team {t[\"slug\"]}: expertSlugs {s} finns inte bland experts'
print('expertSlugs OK')
"
```

### 6. Commit och PR

```bash
git add -A
git commit -m "Add/update expert: [expertens namn]

- [EXPERT.md created/updated]
- [expert-registry.md updated]
- [site-data.json synced]

Co-Authored-By: Claude <noreply@anthropic.com>"

git push -u origin HEAD
gh pr create \
  --title "Expert: [Lägg till/Uppdatera] [namn]" \
  --body "## Ändringar

- [Vad som ändrats]

## Synkade filer
- experts/[slug]/EXPERT.md
- skills/konsultchef/expert-registry.md
- web/site-data.json

## Validering
- [ ] site-data.json är giltig JSON
- [ ] Alla areaSlugs matchar befintliga expertAreas
- [ ] Alla team-expertSlugs matchar befintliga experts
- [ ] updatedAt uppdaterad"
```

### 7. Rapportera

Ge användaren:
- PR-länk
- Sammanfattning av vad som ändrats
- Eventuella varningar (t.ex. om en ny expertArea behövde skapas)

## Regler

- **Synka alltid alla tre datakällor** — EXPERT.md, expert-registry.md och site-data.json
- **Bryt aldrig site-data.json-schemat** — läs referensdokumentet och befintlig data noga
- **Rör inte statiska sektioner** i site-data.json (site, organization, contact, marketplace)
- **Svenska med å, ä, ö** i alla texter
- **Skapa alltid en PR** — pusha aldrig direkt till main
- **Validera innan commit** — kör valideringsskripten
