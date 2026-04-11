---
name: "skill-evolution"
description: "Trestegsprocess för att uppdatera Expertbyråns lokala skills: DRAFT → REVIEW → ADOPT. Triggas när utbildningsledaren ser samma mönster hos flera experter."
slug: "skill-evolution"
metadata:
  paperclip:
    slug: "skill-evolution"
    skillKey: "local/expertbyran/skill-evolution"
  skillKey: "local/expertbyran/skill-evolution"
key: "local/expertbyran/skill-evolution"
---

# Skill-evolution

Expertbyråns lokala skills är **levande dokument**. De uppdateras
över tid baserat på faktiska observationer från experternas arbete.
Denna skill beskriver hur utbildningsledaren driver uppdateringen
genom en trestegs kvalitetssäkrad process.

## Trigger

Utbildningsledaren initierar skill-evolution när samma typ av
mönster dyker upp hos **flera experter** (minst 2):

- Samma lucka i memory-rader
- Samma fråga i fortbildningsdialoger
- Samma typ av brist som kvalitetsgranskaren identifierat vid
  opponent-tillfällen

**En enskild experts behov är INTE en signal för skill-evolution.**
Det hanteras via individuell fortbildningsdialog. Skill-evolution
är för bolagets kollektiva kunskap.

## Steg 1 — DRAFT

Utbildningsledaren skriver ett utkast i
`projects/metodutveckling/drafts/<skill>-<YYYY-MM-DD>.md`.

### DRAFT-formatet

```markdown
---
draft_id: "vetenskapliga-krav-triangulering-2026-04-11"
target_skill: "vetenskapliga-krav-granskningsrapport"
status: "DRAFT"
author: "utbildningsledare"
created: "2026-04-11"
---

# DRAFT — skill-uppdatering

## Motiv

Beskriv **varför** ändringen föreslås:

- Vilka observationer som triggat förslaget (minst 2 experter,
  med memory-rad-referenser)
- Vad den nuvarande skillen saknar
- Vilket konkret problem ändringen löser

## Diff mot befintlig skill

Ange exakt vad som ska ändras:

- **Ny sektion**: var i skillen ska den läggas till?
- **Ändrad text**: före → efter
- **Borttagen text**: vad som ska tas bort och varför

## Föreslagen ny text

Skriv den nya texten (eller ändringen) i fullständig form så att
kvalitetsgranskaren kan bedöma den direkt utan att behöva gissa.

## Förväntat beteende efter ADOPT

Hur ska experter använda den uppdaterade skillen? Ge ett konkret
exempel på hur en typisk situation hanteras efter ändringen.

## Risker och sidoeffekter

Finns det risk att ändringen försämrar något annat i skillen?
Behöver andra skills uppdateras som följd?
```

Efter att DRAFT:en är sparad:

- Skapa task till **kvalitetsgranskaren**:

```
POST /api/companies/{cid}/issues
{
  "title": "Peer-review skill-DRAFT: <skill> — <kort beskrivning>",
  "description": "DRAFT finns i projects/metodutveckling/drafts/<filnamn>. Använd peer-review-metodik-skillen. Utfall: APPROVED, REQUEST CHANGES, eller REJECT.",
  "assigneeAgentId": "kvalitetsgranskare",
  "priority": "low"
}
```

## Steg 2 — REVIEW

Kvalitetsgranskaren läser DRAFT:en och ger ett av tre utfall enligt
`peer-review-metodik`-skillen:

### APPROVED

DRAFT:en är redo för ADOPT. Kvalitetsgranskaren kommenterar tasken
med motivering och utbildningsledaren kan gå vidare.

### REQUEST CHANGES

DRAFT:en behöver justeras. Kvalitetsgranskaren anger konkreta
ändringar. Utbildningsledaren uppdaterar DRAFT-filen och skickar
tillbaka för ny review. Iterera tills APPROVED.

### REJECT

DRAFT:en löser fel problem eller är olämplig som skill-ändring.
Vanliga skäl:

- Problemet är individuellt, inte kollektivt
- Skillen blir för specifik för att vara återanvändbar
- Ändringen strider mot något annat i skillens grundläggande logik

Vid REJECT: DRAFT:en **arkiveras** men raderas inte. Den kan komma
tillbaka senare om mönstret upprepas.

## Steg 3 — ADOPT

När DRAFT är APPROVED:

1. **Skriv in ändringen** i `skills/local/<skill>/SKILL.md`. Följ
   diffen från DRAFT:en exakt.
2. **Logga ändringen** i `projects/metodutveckling/changelog.md`:

```
2026-04-11  vetenskapliga-krav-granskningsrapport  Lade till sektion om triangulering-divergens  Kvalitetsgranskare
```

3. **Arkivera DRAFT:en** genom att markera `status: "ADOPTED"` i
   frontmatter. Lämna filen kvar i `drafts/` som historik.
4. **Stäng review-tasken** med en kommentar som länkar till
   changelog-raden.
5. **Informera berörda experter** — inte via dialog, utan genom att
   uppdatera deras `life/areas/<domän>.md` om det är relevant,
   så att de ser konsekvenserna nästa gång de läser filen.

## När behövs en helt ny skill?

Om en observation inte passar in i en befintlig skill — dvs
ändringen skulle bli större än en sektion — är det **inte**
skill-evolution. Då är det dags för en ny skill.

För helt nya skills, använd `paperclip-create-plugin`-skillen från
paperclipai/paperclip. Det är en annan process än DRAFT → REVIEW →
ADOPT.

## Dokumenthierarki

```
projects/metodutveckling/
├── PROJECT.md         # projektbeskrivning
├── changelog.md       # logg över alla ADOPTs
└── drafts/
    ├── <skill>-<datum>.md  # DRAFT (status: DRAFT/REQUEST_CHANGES/ADOPTED/REJECTED)
    └── ...
```

## Ansvar

| Steg    | Ansvarig             | Utfall                          |
|---------|----------------------|----------------------------------|
| DRAFT   | Utbildningsledaren   | Fil i `drafts/`                 |
| REVIEW  | Kvalitetsgranskaren  | `APPROVED` / `REQUEST CHANGES` / `REJECT` |
| ADOPT   | Utbildningsledaren   | Ändring i `skills/local/` + changelog |

Ingen annan agent ska initiera skill-evolution. Om en expert känner
starkt att en skill borde ändras, nämner hen det i sin memory och
utbildningsledaren plockar upp det i nästa luckanalys.
