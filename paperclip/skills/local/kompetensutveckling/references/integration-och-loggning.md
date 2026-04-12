# Integration och loggning — detaljguide

Detta är fördjupningen till steg 5–6 i kompetensutveckling-skillen.

## Steg 5 — Integration

### Grundprincip

**Läs filen först.** Förstå vad som redan finns innan du skriver.
Det viktigaste är att ny kunskap *bygger på* befintlig, inte
duplicerar den.

Vad du skriver beror på din roll. Expertbyrån har två typer av
lärande — och det påverkar vad som hamnar i dina filer.

---

### Om du är domänexpert — bygg referenskartan

Ditt värde som domänexpert är att du vet **var** kunskap finns.
Precis som en mänsklig expert sparar bokmärken, klipper artiklar,
och organiserar anteckningar — bygger du en kuraterad källsamling
som gör dig snabb och träffsäker i ditt arbete.

#### Kuraterade källsamlingar i life/areas/<domän>.md

**Källkort med annotationer** — varje källa du hittar som är
relevant bör få en kort post:

```markdown
### <Tematisk rubrik>

**<Författare>, *<Titel>*, <Dokumenttyp>, <År>.**
Relevanta avsnitt: <avsnitt/sidor>
Användbart för: <kort beskrivning av när denna källa är värdefull>
Nyckelinsikt: <1–2 meningar om det viktigaste>
```

**Organisera tematiskt**, inte kronologiskt. Gruppera källor under
rubriker som speglar de frågor du behöver svara på i ditt arbete.

**Uppdatera "Externa källor jag bevakar"** om du hittar en ny
återkommande källa (myndighet, rapportserie, tidskrift) som du
vill följa.

**Kort kontext** — skriv gärna en inledande mening per sektion
som sätter källorna i sammanhang, men försök inte destillera hela
rapporter till prosa. Det är referenskartan som är värdet, inte
sammanfattningen.

#### Exempel — domänexpert

```markdown
## Riktade statsbidrag — utvärdering och effektivitet

Riktade statsbidrag har ökat kraftigt sedan 2015 och är ett
återkommande granskningsområde. Tre nyckelkällor:

**Riksrevisionen, *Riktade statsbidrag till kommuner*, RiR 2024:8.**
Relevanta avsnitt: kap 4 (effektivitetsbedömning), kap 6 (slutsatser)
Användbart för: när en granskning berör kommunala bidrag
Nyckelinsikt: Riktade bidrag leder ofta till målförskjutning —
kommunerna prioriterar det mätbara framför det viktiga.

**ESV, *Statsbidrag i praktiken*, ESV 2023:45.**
Relevanta avsnitt: kap 3 (fördelningsnycklar)
Användbart för: teknisk analys av bidragskonstruktioner
Nyckelinsikt: Fördelningsnycklarna är ofta föråldrade och speglar
inte aktuella behov.

**SOU 2022:10, *Statens bidrag till kommunerna*.**
Relevanta avsnitt: kap 7–8 (reformförslag)
Användbart för: bakgrund till pågående reformdiskussion
```

---

### Om du är metodexpert — internalisera metoden

Ditt värde som metodexpert är att du **förstår** hur metoden
fungerar. Du lär dig metoder, du samlar inte dokumentation om dem.
Precis som en människa som lär sig ett hantverk — du läser boken,
men sedan skriver du ner din egen förståelse.

#### Vad du skriver i life/areas/<domän>.md

**Din egen förklaring** — formulera hur metoden fungerar som om du
förklarade den för en kollega vid Expertbyrån. Skriv i din egen
röst.

**Edge cases och bedömningssituationer** — det är här den riktiga
expertisen sitter. Dokumentera situationer där metoden inte
fungerar rakt av, där det krävs bedömning.

**Praktiska insikter** — vad fungerar, vad är svårt, vilka
fallgropar finns?

**Källhänvisningar** — referera till var den som vill fördjupa
sig kan läsa mer, men låt inte källhänvisningarna dominera texten.

#### Exempel — metodexpert

```markdown
## Hantera divergens i triangulering

När kvantitativa och kvalitativa data pekar åt olika håll finns
tre huvudstrategier:

1. **Förklaringsmodell** — en datakälla ger orsaken, den andra
   symtomet. Identifiera vilken som är vilken.
2. **Kontextberoende** — divergensen förklaras av att datakällorna
   fångar olika populationer eller tidsperioder.
3. **Faktisk oenighet** — datakällorna ger motstridiga svar och
   det är i sig ett fynd.

Den vanligaste fällan är att hedga ned slutsatserna till
meningslöshet ("det kan vara så, men det kan också vara så").
Bättre att vara explicit: "Registerdata visar X. Intervjuerna
visar Y. Vi bedömer att skillnaden beror på Z."

Källa: metoddiskussion i RiR 2023:15, avsnitt 3.4.
```

---

### Skriva till expertise.md (båda roller)

Uppdatera bara vid signifikanta kompetenstillskott — inte efter
varje enskild sökning.

#### Ny rad i "Primära metodskills"

Lägg till om du har förvärvat en **helt ny** kompetens som inte
fanns tidigare. Att fördjupa en befintlig skill räcker inte — det
ska vara en faktisk breddning.

#### Ny rad i "Fortbildning senaste 12 mån"

Lägg till efter varje avslutad fortbildningsplan (inte efter varje
subtask):

```markdown
- **YYYY-MM**: <Kort beskrivning av vad du fördjupat dig i>
```

#### Uppdatera senast_uppdaterad

Ändra `senast_uppdaterad` i frontmatter till dagens datum.

#### Vad du INTE ska ändra i expertise.md

- **Utbildning** — ändras aldrig
- **Yrkeserfarenhet** — ändras aldrig
- **Kompetenssammanfattning** — ändras bara om din profil har
  förändrats väsentligt (ny inriktning, nytt huvudområde)
- **Tidigare uppdrag vid Expertbyrån** — ändras bara via
  retrospektiv, inte via fortbildning

### Källhänvisningsformat

Oavsett roll — alla källor ska ha fullständig hänvisning:

```markdown
- Riksrevisionen, *Regeringens tillämpning av det finanspolitiska
  ramverket 2024*, Rapport, 2024. Avsnitt 3.2.
- SOU 2023:53, *Stärkt satisfaktionsgaranti i LSS*, SOU, 2023.
  Kapitel 7.
- OECD, *Economic Surveys: Sweden 2023*, Rapport, 2023. s. 45–52.
```

Webb-källor inkluderar URL:

```markdown
- Statskontoret, "Utveckling av statsbidrag 2023", 2023.
  https://www.statskontoret.se/...
```

### Publiceringsbeslut

Du föreslår **inte** publicering till webbmastern direkt.
Utbildningsledaren avgör vid sin nästa luckanalys om ändringen
i din `expertise.md` är publiceringsvärdig enligt beslutstabellen
i `fortbildning-trainer`-skillen.

Anledningen: utbildningsledaren har helhetsöversikt och kan bedöma
om ändringen ska paketeras med andra uppdateringar, eller om den
behöver mogna ytterligare.

---

## Steg 6 — Logg och feedback

### Memory-format

Skriv i `$AGENT_HOME/memory/YYYY-MM-DD.md`. Följ samma principer
som `expert-lardomsextraktion`-skillen men med utökat format för
kompetensutveckling:

```markdown
## YYYY-MM-DD HH:MM — Kompetensutveckling
Genomfört: <vilken subtask, med issue-id om möjligt>
Källor: <vilka dokument/sidor du läst — kort referens>
Integrerat i: <vilken fil och sektion du uppdaterat>
Nästa: <vad du vill gå vidare med, eller "plan klar">
```

Exempel:

```markdown
## 2026-04-12 14:15 — Kompetensutveckling
Genomfört: Sökt Riksrevisionens och ESV:s rapporter om riktade
statsbidrag (subtask #42)
Källor: RiR 2024:8 "Riktade statsbidrag till kommuner" (avsnitt 4),
ESV 2023:45 "Statsbidrag i praktiken" (kap 3)
Integrerat i: life/areas/offentliga-finanser.md → ny sektion
"Riktade statsbidrag — utvärdering och effektivitet"
Nästa: Subtask #43 — SOU om bidragssystemets utformning
```

### Stänga subtask

Kommentera subtasken med en kort sammanfattning:

```markdown
Klart. Läst RiR 2024:8 och ESV 2023:45 om riktade statsbidrag.
Ny sektion i life/areas/offentliga-finanser.md med fokus på
effektivitetsbedömning och styrningsproblem. Källor inkluderade.
```

Markera subtasken som `done`.

### Peer-feedback

Använd peer-feedback när:

- Du har skrivit om ett ämne som gränsar till en kollegas
  expertområde och vill verifiera att du inte missat något
- Du är osäker på en slutsats och vill ha en second opinion
- Du har hittat något som du tror kan vara relevant för en
  kollega

Formulera feedback-requesten så att kollegan kan svara kort
(3–10 rader). Beskriv:

1. Vad du har skrivit och var det finns
2. Vad du specifikt vill ha feedback på
3. Att det inte är brådskande — svara vid nästa heartbeat

### Avsluta fortbildningsplan

När alla subtasks är klara:

1. **Kommentera plan-issuet** med en sammanfattning:

```markdown
Fortbildningsplan klar. Sammanfattning:

- Genomfört <N> subtasks under <tidsperiod>
- Uppdaterat: <lista med filer och sektioner>
- Viktigaste lärdomarna: <1–2 meningar>
- Eventuella uppföljningsbehov: <om det finns>
```

2. **Markera plan-issuet som `done`**

3. Utbildningsledaren ser resultatet vid sin nästa luckanalys och
   kan avgöra om det ska leda till publicering, vidare fortbildning,
   eller skill-evolution.
