---
name: "Kompetenskatalog"
description: "Aggregat av alla experters CV (expertise.md). Uppdateras av utbildningsledaren, läses av klientkoordinatorn vid matchning."
---

# Kompetenskatalog

Detta är det centrala projektet som binder ihop alla experters CV:er
och fungerar som index vid klientkoordinatorns matchning mot
kundförfrågningar.

## Innehåll

Detta projekt är en översikt — själva innehållet lever i varje experts
egen `agents/<expert>/expertise.md`. Syftet med projektet är att:

1. Ge klientkoordinatorn en enda plats att börja matchningen från
2. Ge utbildningsledaren en enda plats att föra loggbok över
   uppdateringar
3. Ge webbmastern en enda källa att diffa mot vid publicering

## Nuvarande experter

### Metodexperter (under Konsultchef Metod & process)

| Agent                     | Namn              | Specialisering                                       |
| ------------------------- | ----------------- | ---------------------------------------------------- |
| effektivitetsrevisor      | Dr Anders Lindstam| Projektledning, designmatris, bedömningsgrunder      |
| kvantitativ-analytiker    | Dr Maria Forsberg | Registerdata, statistik, kausalinferens             |
| kvalitativ-metodexpert    | Dr Elin Kvist     | Intervjumetodik, fallstudier, triangulering         |
| rattslig-utredare         | Fredrik Lindén    | Regleringsbrev, författningstolkning, mandat         |
| kvalitetsgranskare        | Dr Ingrid Sjöberg | Opponentmetodik, vetenskaplig stringens              |

### Domänexperter (under Konsultchef Domänexpertis)

| Agent                     | Namn                 | Domän                                             |
| ------------------------- | -------------------- | ------------------------------------------------- |
| expert-finanser           | Dr Henrik Ahlgren    | Offentliga finanser och styrning                  |
| expert-digitalisering     | Dr Sara Lundqvist    | Statlig digitalisering och IT                     |
| expert-rattsvasende       | Dr Gustav Nordstrand | Rättsväsende och civilt försvar                   |
| expert-valfard            | Dr Karin Bergström   | Välfärd och social omsorg                         |

## Underhåll

Utbildningsledaren uppdaterar de individuella `expertise.md`-filerna
direkt. Den här filen behöver inte redigeras efter varje fortbildning
— den uppdateras när en ny expert hyrs in eller när en expert lämnar.

När klientkoordinatorn söker efter en expert, läser hen:

1. Den här filen för att se spektrat
2. Kandidatens `agents/<slug>/expertise.md` för detaljer
3. Vid behov kandidatens `life/areas/<domän>.md` för teknisk kunskap

## Loggbok

(Utbildningsledaren kan lägga in stora förändringar här som en kort rad
med datum och agent.)

- 2026-04-11 — Första versionen av katalogen vid import.
