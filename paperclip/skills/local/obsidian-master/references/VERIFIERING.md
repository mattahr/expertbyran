# Verifieringsprotokoll

Varje påstående i en **publicerad konceptnot** måste ha en URL + markdown-fotnot till en **källnot** i `/Källor/`. Utkast och expertnoter får innehålla overifierat material, men då ska påståendena markeras tydligt.

## Stegen i verifiering

När du verifierar ett påstående:

1. **Identifiera källan.** Experten har lämnat en referens, eller du föreslår en. Om ingen referens — dialog med experten (se [ARBETSFLÖDEN.md](ARBETSFLÖDEN.md), dialogmönster "källa saknas").
2. **Hämta URL:en.** Testa att sidan svarar (HTTP 200). Om 404 eller timeout — ny källa, dialog.
3. **Läs sidan.** Kontrollera att påståendet faktiskt stöds av innehållet. Citera gärna textpassagen i källnoten för spårbarhet.
4. **Bedöm trovärdighet.** Använd tabellen nedan. Om tveksamt — dialog med expert.
5. **Skapa eller uppdatera källnoten** i `/Källor/`. En källa existerar en gång. Se [VAULT.md](VAULT.md) för filnamnsregler.
6. **Lägg in fotnot** i konceptnoten med wikilink till källnoten.

## Trovärdighetsmatris

Används för att sätta `trovärdighet:`-fältet på källnoten.

### Primär

Ska utgöra majoriteten av källorna i en publicerad konceptnot.

| Källtyp | Exempel |
|---------|---------|
| Lagstiftning | Socialförsäkringsbalken, regeringsformen |
| Riksdagstryck | SOU, proposition, betänkande, skrivelse, motion |
| Myndighetspublikation (officiell) | Regleringsbrev, instruktioner, årsredovisning, officiella beslut |
| Officiell statistik | SCB-tabeller med spårbar metodbeskrivning, Kolada |
| Primär vittne (citerad person) | Namngivet expertintervju med verifierbar identitet |
| Peer-reviewed vetenskaplig artikel | Publicerad i indexerad tidskrift |

### Sekundär

Får finnas i en konceptnot men bör kompletteras med primär källa.

| Källtyp | Exempel |
|---------|---------|
| Facklitteratur | Lärobok, monografi |
| Myndighetsrapport (ej officiell publikation) | Analysrapport, uppföljning utan formell status |
| Etablerad journalistik | DN Debatt, SvD Näringsliv med spårbar källa |
| Sekundär tolkning av primärkälla | Forskningsöversikt, kommenterad lagtext |

### Tertiär

Får **inte** vara huvudkälla. Kan användas som pekare till primärkälla.

| Källtyp | Exempel |
|---------|---------|
| Blogg utan spårbar auktoritet | Branschbloggar, opinionstexter |
| Wikipedia utan sekundärkälla | Wikipedia-sida utan källhänvisningar |
| Pressmeddelanden som förstahandskälla | PR-texter, företagsblogg |
| Tredjehandsintervjuer | "Enligt obekräftade uppgifter …" |

## Beslutsträd: vad gör du med en källa?

```text
Är källan primär?
├── Ja → Använd, citera i konceptnoten.
└── Nej → Är den sekundär?
    ├── Ja → Använd, men flagga till experten: "Finns primärkälla?"
    │        - Om ja: lägg till primärkälla, behåll sekundär som kompletterande
    │        - Om nej: använd sekundär men sätt osäkerhet: medel på konceptnoten
    └── Nej → Tertiär. Avvisa som huvudkälla.
        - Om noten redan är publicerad: flytta tillbaka till /Experter/, status: utkast
        - Dialog med expert: "Tertiär källa — behöver primär eller sekundär"
```

## Vad händer när verifiering misslyckas?

| Situation | Åtgärd |
|-----------|--------|
| Påståendet saknar källa | Dialog med expert: be om referens eller föreslå att påståendet tonas ner |
| URL:en svarar 404 | Sök efter arkiverad version (Wayback Machine), annars dialog |
| Källan hittas men stödjer inte påståendet | Flagga till expert med citat från källa + påstående. Experten får välja: omformulera, byta källa, eller ta bort påståendet |
| Källan är tertiär | Se beslutsträd ovan |
| Källan är primär men inaktuell (upphävd lag, föråldrad statistik) | Dialog med expert: finns nyare primärkälla? Om inte: markera `osäkerhet: medel` och notera i noten |
| Källan är primär men svårläst (PDF utan OCR, skannat) | Transkribera relevant passage till källnotens brödtext. Bekräfta med expert. |

## Fotnotsyntax i konceptnot

Markdown-fotnot länkas till källnot via wikilink:

```markdown
Regression med kontrollvariabler förutsätter att kontrollvariablerna inte själva
är påverkade av behandlingen[^sou-2024-45].

[^sou-2024-45]: Se [[SOU-2024-45]], kapitel 4.
```

Fotnoten refererar alltid **via wikilink** till en källnot — aldrig en extern URL direkt i fotnoten. URL:en bor i källnoten.

## När experten insisterar på en svag källa

Om experten argumenterar för att en tertiär källa bör räknas som acceptabel:

1. Notera argumentet i noten (inline-kommentar eller callout).
2. Sätt `osäkerhet: hög` på konceptnoten.
3. Flagga fallet i rapporten till tasken — `obsidian-master` kan inte ensam besluta att avvika från trovärdighetsmatrisen.
4. Dokumentera i `/00_Index/` vilka konceptnoter som kör på avsteg.

Detta är ett **undantag**, inte ett mönster. Om det händer ofta med en viss expert — eskalera till konsultchef.
