---
name: "peer-review-metodik"
description: "Opponentmetodik för kvalitetsgranskaren. Används både externt vid Riksrevisionens seminarier och internt vid Expertbyråns egen skill-evolution."
slug: "peer-review-metodik"
metadata:
  paperclip:
    slug: "peer-review-metodik"
    skillKey: "local/expertbyran/peer-review-metodik"
  skillKey: "local/expertbyran/peer-review-metodik"
key: "local/expertbyran/peer-review-metodik"
---

# Peer-review-metodik

Denna skill beskriver hur kvalitetsgranskaren (och i nödfall andra
metodexperter) ska genomföra peer-review. Den används i två
sammanhang:

1. **Externt** — som opponent vid Riksrevisionens upplägg- och
   rapportseminarier (steg 2.8 och 3.4 i processen)
2. **Internt** — som peer-reviewer för skill-DRAFT:er som
   utbildningsledaren skickar i skill-evolution-processen

Båda sammanhangen använder samma grundmetod: den samlade
vetenskapliga checklistan från
`vetenskapliga-krav-granskningsrapport`-skillen.

## Roller och förhållningssätt

**Som opponent är du inte motståndare — du är kvalitetsgaranti.**
Ditt jobb är inte att "sänka" rapporten utan att säkerställa att
den håller för den kritiska läsaren. Bra opponentskap är välgrundat
och konstruktivt.

**Principer:**

- Läs först hela utkastet innan du börjar kommentera
- Separera substantiella invändningar från redaktionella
  kommentarer
- Ge konkreta referenser (sida, avsnitt) till varje invändning
- Formulera som frågor eller observationer, inte som anklagelser
- Prioritera — ta upp de 3–5 viktigaste sakerna först

## Extern opponentmetodik (Riksrevisionen)

### Inför uppläggsseminarium (steg 2.8)

Fokus: är revisionsfrågorna och bedömningsgrunderna hållbara?

Genomgång:

1. **Revisionsfrågornas logik** — nedbrytning, täckningslogik,
   falsifierbarhet
2. **Bedömningsgrundernas ursprung** — explicit källhänvisning,
   rättslig grund
3. **Datakällor** — specificerade, tillgängliga, relevanta
4. **Urvalslogik** — representativitet, motivering
5. **Metodval** — passar det frågan?
6. **Genomförbarhet** — har granskningen tillräckliga resurser?

Leverans: skriftligt opponentutlåtande (3–5 sidor) + muntlig
presentation vid seminariet.

### Inför rapportseminarium (steg 3.4)

Fokus: håller slutsatserna för bevisen?

Genomgång enligt den samlade checklistan i
`vetenskapliga-krav-granskningsrapport`-skillen (avsnitt 9):

- Metodredovisning
- Iakttagelser (deskriptiva, källbelagda, representativa)
- Slutsatser och rekommendationer (logisk härledning, hedging,
  kausalitet, mandat)
- Språk och form
- Sammanfattning

**Särskilt fokus på de systematiska vetenskapliga brister som är
vanligast:**

1. Bekräftelsebias (utelämnade motbevis)
2. Cirkulär argumentation
3. Ekologisk felslutning
4. Övertolkning av intervjudata
5. Selektiv precisering
6. Post hoc ergo propter hoc
7. Oproportionerliga rekommendationer

Leverans: skriftligt opponentutlåtande + muntlig presentation.

## Intern peer-review (skill-DRAFT)

När utbildningsledaren skickar dig en task "Peer-review skill-DRAFT:
\<skill\>":

### Steg 1 — Läs DRAFT

- Läs hela filen i `projects/metodutveckling/drafts/`
- Läs den nuvarande skillen i `skills/local/<skill>/SKILL.md`
- Jämför diffen

### Steg 2 — Bedöm mot kriterier

- **Motivation**: är ändringen motiverad av faktisk observation
  (inte bara utbildningsledarens gissning)?
- **Ny insikt**: tillför den något utöver omformulering?
- **Förenlighet**: är den förenlig med de fem grundkriterierna och
  processen?
- **Generaliserbarhet**: kommer den att vara tillämplig i fler än
  ett framtida uppdrag?
- **Tydlighet**: kan en expert läsa och tillämpa den utan tolkning?

### Steg 3 — Utfall

Kommentera tasken med ett av tre utfall:

**`APPROVED`** — skriv en rad motivering och föreslå att
utbildningsledaren går vidare till ADOPT.

```markdown
APPROVED. DRAFT:en tillför konkret vägledning för divergens-hantering
som inte finns i nuvarande skill. Förenlig med kraven 2.2 (triangulering)
och 5.2 (hedging).
```

**`REQUEST CHANGES`** — ange konkreta ändringar som måste göras.

```markdown
REQUEST CHANGES.

1. Stycket om "följ starkaste metod" är otydligt — vad räknas som
   "starkast"? Behöver kriterier.
2. Exemplet på sida 2 strider mot hedging-skalan i
   vetenskapliga-krav-skillen — kalibrera.

Efter ändringarna är jag beredd att godkänna.
```

**`REJECT`** — ange varför och föreslå alternativ.

```markdown
REJECT. DRAFT:en försöker lösa ett problem som inte är en skill-fråga
utan en individuell fortbildningsfråga för kvalitativ-metodexpert.
Arkivera och initiera istället en fortbildningsdialog.
```

REJECT betyder **inte** att DRAFT:en raderas — den arkiveras i
`drafts/` och kan återkomma senare om mönstret upprepas.

## Kvalitetsmarkörer för en god peer-review

- **Specifik**: refererar till sida, rad, stycke
- **Välgrundad**: hänvisar till kriterium eller bristtyp
- **Konstruktiv**: visar vägen framåt, inte bara vad som är fel
- **Proportionerlig**: substantiella frågor före redaktionella
- **Avgränsad**: ta inte upp allt — prioritera

## När du är osäker

Om du inte är säker på om en invändning är substantiell eller bara
"stilfråga", fråga dig:

> "Skulle en kritisk utomstående läsare hålla med?"

Om svaret är "kanske" — lämna kommentaren men markera den som
sekundär. Om svaret är "nej" — hoppa över den.

## Referenser

- `vetenskapliga-krav-granskningsrapport` — den samlade checklistan
  i avsnitt 9
- `effektivitetsrevision-process` — var seminarierna hamnar i
  processen
- `skill-evolution` — den interna processen där peer-review används
