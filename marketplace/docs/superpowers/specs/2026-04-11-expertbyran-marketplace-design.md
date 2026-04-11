# Expertbyrån Marketplace — Designspecifikation

**Datum:** 2026-04-11
**Status:** Utkast

## Kontext

Vi bygger "Expertbyrån Marketplace" — ett Claude Code-pluginsystem där domän- och metodexperter organiseras som ett virtuellt konsultbolag. Målet är att Claude Code ska kunna "anlita" rätt expert(er) för en given uppgift, utan att alla experters kunskap belastar huvudflödets kontextfönster.

**Problem som löses:**
- Med många specialiserade skills i en plugin hamnar alla beskrivningar i `system-reminder` — kontext-bloat
- Användaren vill att Claude Code autonomt väljer och koordinerar experter, likt en projektledare som kontaktar ett konsultbolag

**Lösning:** En enda synlig skill ("Konsultchefen") som agerar router och team lead. Experterna definieras som strukturerade dokument — inte skills — och laddas on-demand i subagenternas kontext.

## Arkitektur

### Plugin-struktur

```
expertbyran-marketplace/
├── .claude-plugin/
│   └── plugin.json                     # Plugin-metadata
├── skills/
│   └── konsultchef/
│       ├── SKILL.md                    # Routing-skill (enda synliga skillen)
│       └── expert-registry.md          # Kompakt expertregister för matchning
├── experts/
│   ├── klarsprak/
│   │   ├── EXPERT.md                   # Identitet, metodik (alltid laddas)
│   │   ├── references/                 # Stödmaterial (progressive disclosure)
│   │   │   ├── klarspraksregler.md
│   │   │   └── myndigheternas-skrivregler.md
│   │   └── minnen/
│   │       ├── MINNEN.md               # Minnesindex: lärdomar, erfarenheter
│   │       └── YYYY-MM-DD-uppdrag.md   # Specifika uppdragsminnen
│   └── [framtida-expert]/
│       ├── EXPERT.md
│       ├── references/
│       └── minnen/
├── CLAUDE.md
├── package.json
└── README.md
```

### Nyckelprinciper

- **En skill, många experter:** Bara `konsultchef` registreras som skill → minimalt context-avtryck
- **Experter som dokument:** `experts/*/EXPERT.md` är inte skills utan strukturerade kunskapsdokument
- **Progressive disclosure:** EXPERT.md ger kärnidentitet och metodik; detaljerad kunskap, regler och minnen laddas on-demand via filreferenser
- **Minnen:** Experter bygger erfarenhet över tid genom att skriva till `minnen/`-katalogen efter uppdrag

## Konsultchefens flöde

### Routing-logik

1. Konsultchefen aktiveras (användaren anropar skillen eller Claude bedömer att den behövs)
2. Läser `expert-registry.md` — en kompakt lista med varje experts namn, domän, triggers och capabilities
3. Matchar uppgiften mot tillgängliga experter (automatisk bedömning eller explicit begäran)
4. Väljer exekveringsläge baserat på uppgiftens komplexitet

### Tre exekveringslägen

| Läge | När | Vad händer |
|------|-----|------------|
| **Solo** | En expert räcker | Spawnar en enda Agent med expertens EXPERT.md som kontext |
| **Parallellt** | Flera oberoende experter | Skapar ett Team, spawnar agenter parallellt, samordnar resultat |
| **Kedjat** | Expert behöver annan expert | Experten SendMessage:ar en kollega eller ber Konsultchefen spawna ytterligare |

### Flödesdiagram

```
Användare → "Granska den här texten juridiskt och språkligt"
    ↓
Konsultchef-skill aktiveras
    ↓
Läser expert-registry.md → matchar 2 experter
    ↓
Skapar Team ("expertbyran-uppdrag")
    ↓
Spawnar parallellt:
  ├── Agent "klarsprak" → läser experts/klarsprak/EXPERT.md
  └── Agent "juridik"  → läser experts/juridik/EXPERT.md
    ↓
Experterna kan kommunicera direkt via SendMessage:
  "klarsprak" → "juridik": "Juridiskt känslig formulering, kan du verifiera?"
    ↓
Konsultchefen samordnar och sammanställer resultat
    ↓
Team avslutas, resultat tillbaka till användaren
```

## Expert-dokumentets struktur

### EXPERT.md

```markdown
---
name: [Expertens namn]
domain: [Domänbeskrivning]
triggers:
  - [nyckelord/fraser som matchar denna expert]
capabilities:
  - [capability-namn]: [kort beskrivning]
can_chain_to:
  - [andra-experten]  # Vid [situation]
---

# [Expertens namn]

## Identitet
[Vem experten är, personlighet, erfarenhet]

## Minnen
Om du vill minnas vad du gjort tidigare och dra nytta av lärdomar
från tidigare uppdrag, läs `minnen/MINNEN.md`.

## Metodik
### [Läge 1]
[Steg-för-steg metodik]

### [Läge 2]
[Steg-för-steg metodik]

## Principer
[Kärnprinciper som styr expertens arbete]

## Fördjupning
- [Referensmaterial]: `references/[fil].md`

## Kedjning
[Instruktioner för när och hur experten kontaktar kollegor]
Läs expertregistret för att hitta rätt kollega: `skills/konsultchef/expert-registry.md`
(sökväg relativ till plugin-roten).
```

### Frontmatter-fält

- **name:** Expertens visningsnamn
- **domain:** Domänbeskrivning (används för matchning)
- **triggers:** Nyckelord/fraser som indikerar att denna expert behövs
- **capabilities:** Vad experten kan göra (namn → beskrivning)
- **can_chain_to:** Vilka andra experter som kan behövas och i vilka situationer

### Expert-registret (expert-registry.md)

Kompakt lista som Konsultchefen läser för matchning. Innehåller enbart frontmatter-data från alla experter:

```markdown
# Expertregistret

## Klarspråksexperten
- **Domän:** Språkvård, textgranskning, klarspråk, myndighetsspråk
- **Triggers:** granska text, skriv om, förbättra språket, klarspråk
- **Capabilities:** granska (analysera och ge förslag), skriv-om (leverera omskriven version)
- **Sökväg:** experts/klarsprak/EXPERT.md
- **Kan kedja till:** juridik, tillganglighet
```

## Minnessystemet

### Läsa minnen
- Experten läser `minnen/MINNEN.md` vid behov — ett lättviktigt index
- MINNEN.md innehåller de viktigaste lärdomarna och pekare till specifika uppdrag
- Detaljerade uppdragsminnen i separata filer (`YYYY-MM-DD-uppdrag.md`)

### Skriva minnen
- Efter ett uppdrag kan experten skriva tillbaka till minnen-katalogen
- Subagenter har tillgång till Write/Edit-verktygen
- MINNEN.md uppdateras med nya lärdomar
- Nya uppdragsminnen sparas som separata daterade filer

### Progressive disclosure-kedja
```
EXPERT.md (alltid laddas)
  → minnen/MINNEN.md (vid behov av erfarenhet)
    → minnen/YYYY-MM-DD-uppdrag.md (vid behov av specifikt uppdrag)
  → references/[regel].md (vid behov av fördjupning)
```

## Första experten: Klarspråksexperten

### Profil
- **Domän:** Klarspråk enligt Språkrådets riktlinjer, myndighetsspråkvård
- **Capabilities:** Granska text (med motiveringar) och skriva om text till klarspråk

### Två lägen
1. **Granskningsläge:** Analyserar text, identifierar problem (passiv form, långa meningar, facktermer, nominaliseringar), ger konkreta förbättringsförslag med motivering
2. **Omskrivningsläge:** Skriver om hela texten, markerar väsentliga ändringar, motiverar de viktigaste förändringarna

### Kärnprinciper
- Korta meningar (riktlinje: max 25 ord)
- Aktiv form framför passiv
- Undvik nominaliseringar
- Vardagliga ord framför facktermer
- Logisk struktur och tydliga rubriker
- Baserat på Språkrådets klarspråksregler och Myndigheternas skrivregler

## Verifiering

### Testa Konsultchefen
1. Installera pluginen lokalt (via `extraKnownMarketplaces` i settings.json)
2. Starta ny Claude Code-session
3. Verifiera att bara `konsultchef` syns i system-reminder (inga expert-skills)
4. Anropa Konsultchefen med "Granska den här texten: [exempeltext]"
5. Verifiera att en subagent spawnas och läser EXPERT.md
6. Verifiera att resultatet flödar tillbaka korrekt

### Testa kedjning
1. Ge en uppgift som kräver flera experter
2. Verifiera att Team skapas och agenter spawnas parallellt
3. Verifiera att experter kan kommunicera via SendMessage

### Testa minnen
1. Ge experten ett uppdrag
2. Verifiera att minnen skrivs till minnen-katalogen
3. Ge ett nytt uppdrag och verifiera att experten refererar till tidigare erfarenheter
