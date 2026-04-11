---
area: "Vetenskaplig kvalitetsgranskning"
description: "Kunskapsbas om de fem grundkriterierna, systematiska bristtyper och opponentmetodik."
senast_uppdaterad: "2026-04-11"
---

# Vetenskaplig kvalitetsgranskning — kunskapsbas

## De fem grundkriterierna

Alla fem måste vara uppfyllda — de är inte hierarkiska.

1. **Intern validitet** — slutsatserna följer logiskt av iakttagelserna,
   alternativa förklaringar har prövats
2. **Extern validitet** — generaliserbarhet i den utsträckning rapporten
   påstår
3. **Reliabilitet** — konsistenta och reproducerbara mätningar
4. **Transparens** — fullständig redovisning av metod, datakällor, urval
5. **Falsifierbarhet** — revisionsfrågan och slutsatserna kan i princip
   motbevisas

## Systematiska vetenskapliga brister att leta efter

| Brist                           | Symptom                                            |
|---------------------------------|----------------------------------------------------|
| Bekräftelsebias                 | Avvikande fynd nämns knappt eller utelämnas        |
| Cirkulär argumentation          | "X är dåligt eftersom det gick dåligt"             |
| Ekologisk felslutning           | Individslutsatser från aggregerad data             |
| Övertolkning av intervjudata    | "3 av 30 intervjuer visar att..."                  |
| Selektiv preciseringsnivå       | Starka påståenden vaga, osäkra iakttagelser preciserade |
| Post hoc ergo propter hoc       | Temporal succession = kausalitet                   |
| Oproportionerliga rekommendationer | Stark rekommendation från försiktig slutsats    |
| Utelämnande av metodbegränsningar | Metodavsnittet beskriver bara vad som gjorts     |

## Hedging-skalan

| Evidensnivå        | Typisk formulering                       |
|--------------------|------------------------------------------|
| Stark slutsats     | "Granskningen visar att..."              |
| Måttlig slutsats   | "Granskningen indikerar att..."          |
| Försiktig slutsats | "Granskningen ger anledning att ifrågasätta om..." |
| Öppen fråga        | "Granskningen kan inte avgöra om..."     |

Vid opponentläsning: kontrollera att formuleringen matchar
bevisunderlagets faktiska styrka.

## Kausalitetskrav

Fyra komponenter — alla måste vara uppfyllda:

1. Temporal ordning
2. Kovariation
3. Eliminering av alternativa förklaringar
4. Beskriven och belagd mekanism

## Peer-review av skill-DRAFT (intern process)

När utbildningsledaren skickar DRAFT till en skill-uppdatering:

1. Läs DRAFT-filen i `projects/metodutveckling/drafts/`
2. Jämför mot befintlig `skills/local/<skill>/SKILL.md`
3. Kontrollera:
   - Är ändringen motiverad av faktisk observation?
   - Innehåller den ny insikt eller bara omformulering?
   - Är den förenlig med de fem grundkriterierna?
   - Är den applicerbar i fler än ett framtida uppdrag?
4. Utfall:
   - **APPROVED** — skriv en rad motivering
   - **REQUEST CHANGES** — ange konkreta ändringar
   - **REJECT** — ange varför, föreslå alternativ väg
