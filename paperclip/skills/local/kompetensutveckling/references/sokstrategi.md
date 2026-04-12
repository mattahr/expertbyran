# Sökstrategi — detaljguide

Detta är fördjupningen till steg 4 i kompetensutveckling-skillen.

## Två kunskapskällor

### DocRec — svenska offentliga dokument

Din primära källa för allt som rör svensk offentlig förvaltning.
Följ `docrec-svensk-offentlig`-skillen för sökprinciper. Här
kompletteras med tips specifika för fortbildningskontext.

**Skillnad mot uppdragssökning:** Vid uppdragsarbete söker du
smalt och djupt — en specifik granskning, ett specifikt
rättsläge. Vid fortbildning söker du **bredare**:

- Använd fler sökfrågor med olika formuleringar
- Sök utan filter först för att få överblick
- Sök sedan med filter (författare, doctype, år) för att avgränsa
- Läs snippets från fler träffar än vanligt

**Fortbildningsspecifika sökstrategier:**

```python
# Bred sökning — vad finns inom mitt område de senaste åren?
search(
  query="<beskriv ditt kunskapsområde i 10-20 ord, som om du
  sammanfattade ett avsnitt i en rapport>",
  limit=20
)

# Avgränsad — specifik myndighets rapporter
search_filtered(
  query="<din specifika fråga>",
  authors=["<relevant myndighet>"],
  min_year=2023,
  max_year=2026,
  max_hits=10,
  max_subdocs=2
)

# Kompletterande — angränsande perspektiv
search_filtered(
  query="<samma ämne formulerat från ett annat perspektiv>",
  doctypes=["SOU"],
  min_year=2020,
  max_year=2026,
  max_hits=10
)
```

### Webbsökning

Använd webbsökning när du behöver:

- **Internationella jämförelser** — OECD, EU-kommissionen, nordiska
  revisionskontor
- **Forskningsrapporter** — akademiska studier utanför svenskt
  offentligt tryck
- **Metodlitteratur** — metodböcker, best practice-guider,
  vetenskapliga artiklar
- **Aktuell debatt** — policyförslag, remissvar, debattartiklar
  som inte finns i DocRec

**Formulera webbsökningar som specifika frågor, inte nyckelord:**

Dåligt: `"statsbidrag utvärdering"`
Bra: `"utvärdering av riktade statsbidrag i nordiska länder
effektivitet och måluppfyllelse"`

## Källkritikmatris

Innan du integrerar kunskap i dina filer — bedöm källan:

| Källa | Förtroende | Krav före integration |
|-------|-----------|----------------------|
| DocRec: Riksrevisionen | Hög | Relevansbedömning |
| DocRec: SOU, Proposition | Hög | Relevansbedömning |
| DocRec: Myndighetsrapport | Hög | Relevansbedömning |
| Webb: Akademisk publikation | Medel–Hög | Kontrollera författare och tidskrift |
| Webb: Myndighet/organisation | Medel | Kontrollera aktualitet |
| Webb: Nyhetsartikel | Medel–Låg | Korskontrollera med primärkälla |
| Webb: Blogg/opinion | Låg | Korskontrollera med minst en annan källa |

### Hur man bedömer relevans

Innan du fördjupar (fetch_pages/WebFetch) — ställ dessa frågor
baserat på snippets/sökresultat:

1. **Handlar det faktiskt om mitt ämne?** Semantisk sökning ger
   ibland träffar som *liknar* din fråga utan att besvara den.
2. **Är det tillräckligt aktuellt?** En rapport från 2005 kan vara
   historiskt intressant men inte representera nuvarande praxis.
3. **Tillför den något nytt?** Om informationen redan finns i din
   `life/areas/`-fil, behöver du inte hämta den igen.

### Maxregel

Per subtask: **max 3 DocRec-sökningar + 2 webbsökningar**. Om du
behöver fler är det ett tecken på att subtasken är för bred och
bör brytas ner i flera subtasks.

## Fördjupning — läsa dokument

### DocRec

1. Läs snippets för att bedöma relevans
2. Använd `fetch_pages` med specifika sidnummer från snippets
3. Använd `fetch` bara när du är säker på att hela dokumentet är
   relevant (spar tokens)

### Webb

1. Läs sökresultatens beskrivningar först
2. Använd `WebFetch` för att läsa specifika sidor
3. Extrahera det relevanta — läs inte hela webbsidor om det inte
   behövs

## Extrahera — vad tar du med dig?

### Om du är domänexpert

Ditt mål är att veta **var** kunskap finns, inte att memorera den.
Ta med:

- **Källkort**: titel, författare, år, dokumenttyp, relevanta
  avsnitt/sidor, kort annotation om varför källan är värdefull
- **Navigeringsledtrådar**: "Avsnitt 3.2 handlar om kommunernas
  ansvar", "Tabell 5 jämför nordiska modeller"
- **Bedömning**: är detta en källa jag vill komma tillbaka till?
  Ska den in i min "Externa källor jag bevakar"-lista?

Tänk som en forskare som organiserar sitt referensbibliotek — du
behöver inte läsa hela boken varje gång, men du ska veta vilken
hylla den står på och vilket kapitel som besvarar vilken fråga.

### Om du är metodexpert

Ditt mål är att **förstå** metoden, inte samla dokumentation om den.
Ta med:

- **Din egen förklaring**: formulera hur metoden fungerar som om du
  förklarade den för en kollega
- **Edge cases**: situationer där metoden inte fungerar rakt av,
  bedömningsfrågor du stött på
- **Praktiska insikter**: vad fungerar, vad är svårt, vilka
  fallgropar finns
- **Källhänvisning**: referera till källan för den som vill
  fördjupa sig ytterligare

### Oavsett roll

- **Inkludera alltid fullständig källhänvisning** — författare,
  dokumenttyp, titel, år, sida/avsnitt.
- **Notera vad du inte hittade** — om sökningarna inte gav svar
  på din fråga, skriv det i din memory-rad. Det är värdefull
  information för nästa sökning eller för utbildningsledaren.
