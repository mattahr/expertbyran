---
name: "kompetensmatchning"
description: "Klientkoordinatorns matchning av kundförfrågningar mot roll-till-uthyrning-tabellen och kompetenskatalogen. Används vid varje ny protokoll-konform uppdragsförfrågan från Riksrevisionen."
slug: "kompetensmatchning"
metadata:
  paperclip:
    slug: "kompetensmatchning"
    skillKey: "local/expertbyran/kompetensmatchning"
  skillKey: "local/expertbyran/kompetensmatchning"
key: "local/expertbyran/kompetensmatchning"
---

# Kompetensmatchning

Detta är klientkoordinatorns arbetsverktyg för att matcha en
inkommande uppdragsförfrågan mot Expertbyråns experter. Skillen är
tillämplig bara när förfrågan är **protokoll-konform** — dvs
description börjar med `protocol: "expertbyran/v1"`-frontmatter
enligt `kundprotokoll`-skillen.

## Roll-till-uthyrning-tabellen

Auktoritativ källa (upprepas i README och klientkoordinatorns
`AGENTS.md`):

| Riksrevisionens roll                | Bemannas av (Expertbyrån)                          |
|-------------------------------------|----------------------------------------------------|
| Projektledare för en granskning     | Effektivitetsrevisor (primärt), annan metodexpert  |
| Enhetschef / granskningsledare      | Konsultchef Metod & process                        |
| Revisor / föredragande (analys)     | Valfri metodexpert (beroende på metodbehov)        |
| Opponent (upplägg/rapportseminarium)| Kvalitetsgranskare                                 |
| Referensperson (extern sakkunnig)   | Valfri domänexpert                                 |
| Sakexpert inom ett granskningsområde| Motsvarande domänexpert                            |

## Matchningsprocess

### Steg 1 — Parsa frontmatter

Läs följande fält från förfrågans description:

- `request_type` — hittills stöds bara `"new_engagement"`
- `external_id` — kundens UUID, inkludera i alla svar
- `deadline` — datum
- `role_hint` — kundens egen bedömning av vilken roll som behövs
- `domain_hint` — kundens egen bedömning av domän

`role_hint` och `domain_hint` är **hinting**, inte bindande. Du ska
bedöma själv baserat på description-texten.

### Steg 2 — Kategorisera förfrågan

Läs description-texten under frontmatter. Vilken typ av uppdrag är det?

- **Hela granskningen** → projektledare (effektivitetsrevisor) + team
- **Specifikt metodmoment** → relevant metodexpert
- **Rättslig tolkningsfråga** → rättslig utredare
- **Sakområdesanalys** → motsvarande domänexpert
- **Opponentroll vid seminarium** → kvalitetsgranskare
- **Designmatris** → effektivitetsrevisor
- **Kvantitativ analys** → kvantitativ analytiker
- **Intervjubaserat spår** → kvalitativ metodexpert

### Steg 3 — Slå upp kandidater

Läs `projects/kompetenskatalog/PROJECT.md` för översikt. För
detaljerad matchning, läs den specifika kandidatens
`agents/<slug>/expertise.md`. Läs särskilt:

- **Specialisering** (frontmatter)
- **Tidigare uppdrag vid Expertbyrån** — om experten redan gjort
  liknande
- **Primära metodskills** / **Domäner jag arbetat i**

### Steg 4 — Bedöm sammansatthet

Behöver uppdraget **flera** experter? Vanliga kombinationer:

| Uppdragstyp                      | Typiskt team                                    |
|----------------------------------|-------------------------------------------------|
| Hel granskning                   | Effektivitetsrevisor (PL) + 1–2 metodexperter + 1 domänexpert |
| Metodstöd inom pågående          | 1 metodexpert                                   |
| Expertsvar inom domän            | 1 domänexpert + eventuellt rättslig utredare    |
| Opponent vid seminarium          | Bara kvalitetsgranskare                         |
| Referensperson                   | 1 domänexpert                                   |

Vid **samansatta uppdrag**: skapa en subtask per expert, alla med
samma `parentId` (rot-issuet).

### Steg 5 — Saknad kompetens

Om rätt kompetens saknas i Expertbyrån:

- **Ny domän** (t.ex. telekom, infrastruktur, försvar): eskalera till
  VD för hyrande via `paperclip-create-agent`
- **Ny metod**: eskalera till Konsultchef Metod för bedömning
- **Akut behov, ingen tid**: svara kunden att uppdraget kräver tid
  för rekrytering

### Steg 6 — Svara kunden

Kommentera rot-issuet:

```markdown
**Mottaget.**

External ID: <uuid från frontmatter>
Team:
- <expert1> (som <roll>)
- <expert2> (som <roll>)

Estimerad leverans: <datum, baserat på deadline och teamstorlek>

Vi följer upp via detta issue.
```

### Steg 7 — Skapa subtasks

För varje valt teammedlem:

```
POST /api/companies/{cid}/issues
{
  "title": "Delegerat: <kort beskrivning>",
  "description": "<vad som förväntas leveras + tidsram + koppling till rot-issuet>",
  "assigneeAgentId": "<expert-slug>",
  "parentId": "<rot-issue-id>",
  "priority": "medium"
}
```

Inkludera alltid:

- Koppling till rot-issuet (parentId + explicit omnämning i
  description)
- Leveransformat som förväntas
- Eventuella samarbetsreferenser till andra teammedlemmar

## När flera experter inom samma kategori kan vara relevanta

Exempel: både `kvalitativ-metodexpert` och `kvantitativ-analytiker`
kan jobba med en granskning av LSS. Val:

1. Om uppdraget är **tydligt kvantitativt** (registerstudier):
   kvantitativ-analytiker ensam
2. Om **tydligt kvalitativt** (intervjubaserat): kvalitativ-metodexpert
   ensam
3. Om **triangulering krävs** (det vanligaste): båda, med
   effektivitetsrevisor som koordinator

Eskalera till Konsultchef Metod om du är osäker.

## Samma logik för domänkluster

Om förfrågan berör flera domäner (t.ex. "LSS i relation till
rättsväsendets skydd av utsatta"): använd båda relevanta
domänexperter och nämn i respektive subtask att de ska samarbeta.

## Referenser

- `kundprotokoll` — protokollets fullständiga definition
- README.md i företagsroten — auktoritativ roll-tabell
- `projects/kompetenskatalog/PROJECT.md` — expertöversikt
- Varje experts `agents/<slug>/expertise.md` — CV-format
