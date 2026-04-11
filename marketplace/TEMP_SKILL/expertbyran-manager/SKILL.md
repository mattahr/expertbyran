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

## Arbetsflöde

### 1. Förstå uppgiften

Fråga användaren om det inte framgår:
- Ska en **ny expert** läggas till, eller ska en **befintlig** uppdateras?
- Expertens domän, namn, roll, triggers, capabilities
- Om ny: vilka befintliga `expertAreas` tillhör experten? (Läs schemat i `references/site-data-schema.md` för tillgängliga areaSlugs)

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

Skapa `experts/[slug]/EXPERT.md`:

```markdown
***

name: [Expertens namn]
domain: [Domän — kort kommaseparerad lista]
triggers:

* [trigger 1]
* [trigger 2]
* [trigger 3]
  capabilities:
  [capability-id]: [Kort beskrivning]
  can_chain_to:
* [expert-slug]    # Kommentar om när

***

# [Expertens namn]

## Identitet

[2-3 meningar som definierar expertens roll, perspektiv och arbetsfilosofi]

## Metodik

### [Läge 1]

[Steg-för-steg-metodik]

### [Läge 2]

[Steg-för-steg-metodik]

## Principer

[Numrerad lista med expertens kärnprinciper]

## Fördjupning

För detaljerade regler och exempel:

\```
Read references/[referensfil].md
\```

## Kedjning

[Instruktioner för när experten ska kontakta en kollega]
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
- **areaSlugs**: Måste matcha befintliga `expertAreas[].slug` — skapa nytt expertArea om inget passar
- **id**: Formatet `expert-[slug]`
- **portrait.src**: `/avatars/[slug].svg`
- **plugin.repositoryUrl**: Alltid `https://github.com/mattahr/expertbyran-plugins`
- **contactLinks**: Minst email + calendar, url-mönster: `mailto:[slug]@expertbyran.ai` resp. `https://calendar.app.google/[slug]`
- **Alla texter på svenska** med korrekta å, ä, ö
- Uppdatera `updatedAt` till aktuellt datum i ISO 8601

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
