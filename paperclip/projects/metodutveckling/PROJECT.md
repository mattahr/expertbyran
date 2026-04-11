---
name: "Metodutveckling"
description: "Utbildningsledarens arbetsyta för skill-evolution, kurerade retrospektiv och kollektivt lärande."
---

# Metodutveckling

Detta projekt ägs av utbildningsledaren och är den centrala platsen
för Expertbyråns skill-evolution. Här samlas DRAFT till
skill-uppdateringar, kurerade retrospektiv från avslutade uppdrag,
och en logg över antagna ändringar.

## Struktur

- **`drafts/`** — utkast till skill-uppdateringar som utbildningsledaren
  skrivit och som väntar på peer-review från kvalitetsgranskaren.
  Filnamnsmönster: `<skill>-<datum>.md`.
- **`changelog.md`** — logg över alla antagna skill-ändringar. En rad
  per ändring med datum, skill och kort motivering.

## Skill-evolution-processen

Tre steg enligt `skills/local/skill-evolution/SKILL.md`:

1. **DRAFT** — utbildningsledaren skriver utkast i `drafts/`
2. **REVIEW** — kvalitetsgranskaren peer-reviewar via
   `peer-review-metodik`
3. **ADOPT** — antagen ändring skrivs in i
   `skills/local/<skill>/SKILL.md` och en rad läggs i
   `changelog.md`

## När ska en skill-evolution startas?

Utbildningsledaren initierar en DRAFT när hen sett samma mönster hos
**flera** experter:

- Samma lucka dyker upp i flera experters memory
- Samma fråga kommer upp i flera fortbildningsdialoger
- Samma bristtyp identifierad av kvalitetsgranskaren vid opponent-
  tillfällen

En enskild experts lucka är **inte** en signal för skill-evolution —
den hanteras via individuell fortbildningsdialog.

## Arbetsregler

- Inga DRAFT skrivs utan att utbildningsledaren sett mönstret hos
  minst 2 experter
- Varje DRAFT innehåller: motiv, diff mot befintlig skill, förväntat
  beteende efter ADOPT
- Varje ADOPT loggar endast en rad i `changelog.md` — detaljer finns
  i commit-historiken om repot är versionshanterat
- Kvalitetsgranskarens utlåtande är auktoritativt. REJECT betyder
  att DRAFT:en arkiveras, inte raderas.
