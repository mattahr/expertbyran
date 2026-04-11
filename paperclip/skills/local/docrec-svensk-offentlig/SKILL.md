---
name: "docrec-svensk-offentlig"
description: "Sökning av svenska offentliga dokument (SOU, Proposition, Rapport, Betänkande, Departementsserien m.fl.) via DocRec MCP. Använd vid research inför granskningar, metodstöd och fortbildning."
slug: "docrec-svensk-offentlig"
metadata:
  paperclip:
    slug: "docrec-svensk-offentlig"
    skillKey: "local/expertbyran/docrec-svensk-offentlig"
  skillKey: "local/expertbyran/docrec-svensk-offentlig"
key: "local/expertbyran/docrec-svensk-offentlig"
---

# DocRec MCP — sökning av svenska offentliga dokument

DocRec är en MCP-server som ger semantisk sökning i svenska offentliga
dokument från 1997 till 2026. Den är den primära researchkällan för
alla Expertbyråns experter när de behöver bakgrund, källor eller
metodreferenser.

## Tillgängliga verktyg

Tre verktyg i MCP-servern:

1. **`search`** — enkel semantisk sökning utan filter
2. **`search_filtered`** — sökning med filter (författare, doctype, år)
3. **`get_search_options`** — hämta giltiga filtervärden

## Dokumenttyper

- **SOU** — Statens offentliga utredningar
- **Proposition** — regeringens förslag till riksdagen
- **Departementsserien (Ds)**
- **Betänkande** — utskottens behandling
- **Rapport** — myndighetsrapporter
- **JO:s ämbetsberättelse**
- **Ekonomisk proposition** — budgetpropositioner
- **Skrivelse** — regeringsskrivelser

## Författare (urval)

Särskilt relevanta för Expertbyrån:

- **Riksrevisionen** — våra egna referensgranskningar
- **Finansdepartementet** — finansområdet
- **ESV** — statlig ekonomi
- **Socialdepartementet** — välfärd och socialförsäkring
- **Justitiedepartementet** — rättsväsende
- **Näringsdepartementet** — digitalisering, näringspolitik
- **IFAU** — arbetsmarknad och utbildning
- **ISF** — inspektionen för socialförsäkringen
- **Justitieombudsmannen** — förvaltningspraxis
- **Statskontoret** — myndighetsanalyser
- **Myndigheten för vård- och omsorgsanalys** — välfärd

Full lista finns i `get_search_options`.

## Sökstrategi — principen

> **Skriv en eller två svenska meningar, 10–20 ord, som liknar texten
> du förväntar dig hitta.**

Detta är inte Google. DocRec är en **semantisk** sökmotor — korta
nyckelord ger irrelevanta träffar. Skriv som om du formulerade en
sammanfattning av det du letar efter.

### Dåligt exempel

```
query: "LSS"
```

### Bra exempel

```
query: "Riksrevisionens granskning av LSS och kommunernas tillämpning av personkretstillhörighet och personlig assistans under statens styrning."
```

## Typiska anrop

### Sök Riksrevisionens senaste granskningar inom ett område

```python
search_filtered(
  query="Riksrevisionens granskning av statens styrning av myndigheter som hanterar sociala insatser",
  authors=["Riksrevisionen"],
  min_year=2024,
  max_year=2026,
  max_hits=20,
  max_subdocs=1
)
```

### Sök SOU inom ett specifikt område

```python
search_filtered(
  query="Utredning om personlig assistans och LSS-insatsernas fördelning mellan stat och kommun",
  doctypes=["SOU"],
  min_year=2020,
  max_year=2026,
  max_hits=10
)
```

### Sök utan filter (när man inte vet exakt var)

```python
search(
  query="Hur hanterar svenska myndigheter biometrisk identifiering vid fastställande av personers identitet?",
  limit=10
)
```

## Tolkning av resultat

Varje träff innehåller:

- **`title`** — dokumentets titel
- **`author`** — författande organisation
- **`type`** — doctype
- **`year`** — utgivningsår
- **`html_url`** / **`pdf_url`** — länkar
- **`snippets`** — kontextutdrag från dokumentet (kan vara flera
  per dokument med `search_filtered`)

**Snippets är dina ögon in i dokumentet.** Läs dem noggrant för att
bedöma om dokumentet är relevant innan du fetch:ar hela dokumentet.

## När du vill fördjupa

Om ett dokument är relevant:

1. Använd **`fetch_pages`** för att hämta specifika sidor baserat på
   snippet-sidnumren
2. Använd **`fetch`** för hela dokumentet (spar tokens genom att
   bara göra detta när relevansen är bekräftad)

## Källkritik

Alla dokument i DocRec är officiella, men tänk på:

- **SOU** är utredningsförslag, inte beslutad politik
- **Proposition** är regeringens förslag, kan ha ändrats i riksdagen
- **Betänkande** är utskottets behandling — sluttexten innan
  riksdagsbeslut
- **Rapport** kan vara från myndighet eller expertorgan — kontrollera
  författare

När du citerar en källa i en leverans till Riksrevisionen, ange
alltid:

- Författare (organisation)
- Dokumenttyp
- Titel
- Årtal
- Specifik sida eller avsnitt om möjligt

## Användare

Alla Expertbyråns experter bör kunna denna skill utantill. Särskilt
kritiskt för:

- **Domänexperter** (finanser, digitalisering, rättsväsende, välfärd)
  när de förbereder expertsvar
- **Rättslig utredare** när hen söker bedömningsgrunder i
  regleringsbrev och propositioner
- **Utbildningsledaren** när hen söker nya källor för fortbildning
