# Planering och förankring — detaljguide

Detta är fördjupningen till steg 2–3 i kompetensutveckling-skillen.

## Steg 2 — Planering

### Hur man bryter ner en lucka

En lucka ska bli **2–5 subtasks**. Färre än 2 betyder att luckan
troligen kan lösas direkt utan plan. Fler än 5 betyder att luckan
är för bred — avgränsa den.

Varje subtask ska svara på:

1. **Vad ska sökas/läsas?** — specifikt nog att du kan formulera
   en sökfråga
2. **Förväntat resultat** — vad vet du efteråt som du inte visste
   innan?
3. **Vilken fil ska uppdateras?** — var landar den nya kunskapen?

### Mall för plan-issue

```markdown
## Nuläge

<2–3 meningar om vad du kan idag inom detta område och varför
det inte räcker>

## Mål

<1–2 meningar om vad du vill kunna efter genomförd plan>

## Planerade uppgifter

1. <uppgift 1 — kort beskrivning>
2. <uppgift 2>
3. <uppgift 3>

Varje uppgift har en egen subtask med detaljer.
```

### Mall för subtask

```markdown
## Vad ska sökas

<Specifika sökfrågor eller dokument att leta efter>

## Förväntat resultat

<Vad jag förväntar mig lära mig>

## Uppdatera fil

<Vilken sektion i vilken fil som ska uppdateras>
```

### Exempel — domänexpert som vill fördjupa sig

Lucka: "Jag refererar ofta till generella statsbidrag men har inte
läst den senaste utvärderingen av riktade bidrag."

**Plan-issue:**

```
Fortbildningsplan: Riktade statsbidrag — effektivitet och styrning
```

**Subtasks:**

1. "Fortbildning: Sök Riksrevisionens och ESV:s senaste rapporter
   om riktade statsbidrag" → uppdatera life/areas med nya
   referensgranskningar

2. "Fortbildning: Läs SOU om bidragssystemets utformning" →
   utvidga sektionen om statsbidrag i life/areas

3. "Fortbildning: Jämför svenska och nordiska modeller för riktade
   bidrag" → ny sektion i life/areas om internationell jämförelse

### Vanliga misstag

- **Subtask utan tydlig sökfråga** — "Lär mig mer om X" är inte
  sökbart. Formulera vad du faktiskt ska söka efter.
- **Subtask som uppdaterar fel fil** — expertens kunskapsbas finns
  i `life/areas/`, inte i `AGENTS.md` (som definierar rollen, inte
  kunskapen).
- **Subtask som är för stor** — "Läs allt om LSS" är inte en
  subtask, det är en plan. Bryt ner.

---

## Steg 3 — Förankring

### Varför förankring?

Konsultchefen har översikt över teamets samlade kompetens och vet
vilka luckor som är mest affärskritiska. Utbildningsledaren har
helikopterperspektiv på hela bolagets lärande och kan se om din
plan duplicerar något som redan finns, eller om den borde
prioriteras annorlunda.

Deras input är värdefull men **inte blockerande**. Du behöver inte
vänta på godkännande.

### Välj rätt konsultchef

- **Metodexperter** (effektivitetsrevisor, kvantitativ-analytiker,
  kvalitativ-metodexpert, rattslig-utredare, kvalitetsgranskare):
  → `konsultchef-metod`

- **Domänexperter** (expert-finanser, expert-digitalisering,
  expert-rattsvasende, expert-valfard):
  → `konsultchef-doman`

### Formulera FYI-tasken

Kort och konkret. Konsultchefen och utbildningsledaren ska kunna
bedöma planen på 30 sekunder:

```markdown
Jag planerar att fortbilda mig inom riktade statsbidrag.
Bakgrund: jag refererar ofta till generella bidrag men saknar
uppdaterad kunskap om riktade.
Plan: issue #<id> med 3 subtasks.
Kommentera om du har input eller förslag.
```

### Asynkronitetsprincipen

Förankring sker asynkront via issue-trackern:

1. Du skapar FYI-tasks och går vidare med annat arbete
2. Vid nästa heartbeat: kolla om konsultchef/utbildningsledare har
   kommenterat
3. Om feedback finns: läs och justera planen vid behov — lägg
   till/ta bort/ändra subtasks
4. Om ingen feedback: tolka det som tyst godkännande, fortsätt

**Vänta aldrig synkront.** Din heartbeat-tid är för värdefull.

### Om utbildningsledaren redan har definierat planen

Om du fått en task där utbildningsledaren redan har brutit ner
luckan i specifika uppgifter — du behöver inte göra steg 2–3.
Skapa subtasks baserat på utbildningsledarens förslag och gå
direkt till steg 4.
