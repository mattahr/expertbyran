---
name: "kundprotokoll"
description: "Klientkoordinatorns mottagande, triage och leverans enligt Expertbyråns kundprotokoll v1. Hanterar inkommande uppdragsförfrågningar från externa kunder (Riksrevisionen) via Paperclips Issues API."
slug: "kundprotokoll"
metadata:
  paperclip:
    slug: "kundprotokoll"
    skillKey: "local/expertbyran/kundprotokoll"
  skillKey: "local/expertbyran/kundprotokoll"
key: "local/expertbyran/kundprotokoll"
---

# Kundprotokoll v1 — klientkoordinatorns sida

Detta är den auktoritativa beskrivningen av hur klientkoordinatorn
tar emot, triagerar och levererar enligt Expertbyråns kundprotokoll.
Protokollet är asynkront, issue-baserat, och använder Paperclips
standardverktyg för Issues, Comments och Documents.

**Klientsidans motsvarande skill** (för extern client): se
`kundprotokoll-klientsida`.

## Protokollversion

`protocol: "expertbyran/v1"` — denna version. Framtida ändringar
bumpar versionen och skapar en ny skill.

## Tillståndsmaskin

Ett kundprotokoll-issue går igenom följande tillstånd:

```
NEW → ACKED → IN_PROGRESS → DELIVERED → CLOSED
```

- **NEW** — kunden har skapat rot-issuet, klientkoordinatorn har
  inte sett det än
- **ACKED** — klientkoordinatorn har läst, triagerat, och skapat
  subtasks; har kommenterat rot-issuet med bekräftelse
- **IN_PROGRESS** — subtasks är i rörelse, minst en expert jobbar
- **DELIVERED** — leveransdokument finns på rot-issuet, alla
  subtasks är `done`
- **CLOSED** — kunden har markerat som avslutat eller X dagar har
  passerat utan dialog

Tillståndet reflekteras i rot-issuets `status`-fält:

| Paperclip-status | Protokoll-tillstånd  |
|------------------|----------------------|
| `todo`           | NEW                  |
| `in_progress`    | ACKED eller IN_PROGRESS |
| `done`           | CLOSED               |

Inom `in_progress` skiljer du ACKED från IN_PROGRESS genom att
titta på om det finns delegerade subtasks (ACKED om inga än,
IN_PROGRESS om någon har börjat jobba).

## Steg 1 — Identifiera protokoll-konforma förfrågningar

I klientkoordinatorns heartbeat:

```
GET /api/companies/{cid}/issues?assigneeAgentId=<your-id>&status=todo,in_progress
```

För varje returnerat issue, läs `description` och kontrollera om
den börjar med:

```markdown
```yaml
protocol: "expertbyran/v1"
...
```
```

**Om ja** — processa enligt detta protokoll.
**Om nej** — det är en intern task (från VD, utbildningsledaren,
etc) och hanteras som vanligt.

## Steg 2 — Parsa frontmatter

Frontmatter-fälten som ska parsas:

| Fält              | Typ      | Obligatoriskt | Beskrivning                                  |
|-------------------|----------|---------------|----------------------------------------------|
| `protocol`        | string   | Ja            | Måste vara `"expertbyran/v1"`                |
| `request_type`    | enum     | Ja            | Hittills bara `"new_engagement"`             |
| `external_id`     | string   | Ja            | Kundens UUID, inkluderas i alla svar         |
| `deadline`        | date     | Nej           | YYYY-MM-DD                                   |
| `role_hint`       | enum     | Nej           | Kundens bedömning av önskad roll             |
| `domain_hint`     | enum     | Nej           | Kundens bedömning av domän                   |

Giltiga värden för `role_hint`:

- `projektledare`
- `enhetschef`
- `metodstöd`
- `referensperson`
- `domänexpert`
- `opponent`
- `kombinerat` (flera roller behövs)

Giltiga värden för `domain_hint`:

- `finanser`
- `digitalisering`
- `rattsvasende`
- `valfard`
- `annat` (tvingar eskalering)

Hints är **rådgivande**. Din slutliga bedömning görs via
`kompetensmatchning`-skillen.

## Steg 3 — Triagera och skapa subtasks

Följ `kompetensmatchning`-skillen. Kort:

1. Läs description-texten för att förstå uppdraget
2. Kategorisera mot roll-till-uthyrning-tabellen
3. Slå upp relevanta experters `expertise.md`
4. Skapa subtasks till varje valt teammedlem:

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

## Steg 4 — Kommentera rot-issuet (gå till ACKED)

Efter att subtasks är skapade, kommentera rot-issuet:

```
POST /api/issues/{rotid}/comments
{
  "body": "**Mottaget.**\n\nExternal ID: <uuid>\nTeam:\n- <expert1> (som <roll>)\n- <expert2> (som <roll>)\n\nEstimerad leverans: <datum, baserat på deadline>\n\nVi följer upp via detta issue."
}
```

Markera rot-issuet som `in_progress`:

```
PATCH /api/issues/{rotid}
X-Paperclip-Run-Id: <runid>
{
  "status": "in_progress"
}
```

## Steg 5 — Följ upp pågående uppdrag

I varje ny heartbeat, för varje rot-issue som är `in_progress` med
protokoll-frontmatter:

1. Hämta subtasks-status via `GET /api/issues/{rotid}` (returnerar
   children)
2. Om alla subtasks är `done`: gå till **Steg 6 — Leverans**
3. Om några är `in_progress`: vänta, ingen åtgärd i denna heartbeat
4. Om någon är `blocked`: hjälp till att avblocka eller eskalera till
   konsultchefen

## Steg 6 — Leverera

När alla subtasks är `done`:

### 6a. Aggregera resultaten

Läs subtasks' comments och documents. Sammanställ deras leveranser
till en helhet.

### 6b. Skriv leveransdokument

```
PUT /api/issues/{rotid}/documents/leverans
{
  "title": "Leverans — <uppdragstitel>",
  "format": "markdown",
  "body": "<strukturerad rapport>"
}
```

### 6c. Leveransdokumentets struktur

Leveransdokumentet följer **vetenskapliga-krav-granskningsrapport**-
standarden i kompakt form:

```markdown
# Leverans — <uppdragstitel>

## Sammanfattning

<1–2 stycken — huvudresultaten, kalibrerat språk>

## Metod

<Hur uppdraget genomfördes: datakällor, urval, analysmetod,
metodbegränsningar>

## Iakttagelser

<Strikt deskriptiva, källbelagda. En per bedömningsgrund.>

## Slutsatser

<Normativa bedömningar med explicit empirisk + normativ premiss.
Hedging kalibrerat mot evidensstyrka.>

## Rekommendationer

<Spårbara till specifika slutsatser. Riktade till aktörer med mandat.>

## Källor

<Specifika, verifierbara referenser.>

---

**External ID**: <uuid från frontmatter>
**Levererat av**: Expertbyrån, <datum>
**Team**: <lista>
```

### 6d. Kommentera rot-issuet

```
POST /api/issues/{rotid}/comments
{
  "body": "**Leverans klar.**\n\nSe document med key `leverans` på detta issue. Sammanfattning:\n\n<3–5 rader bullet points av huvudresultaten>\n\nVi är tillgängliga för frågor via kommentarer på detta issue."
}
```

### 6e. Skapa puls-task till utbildningsledaren

```
POST /api/companies/{cid}/issues
{
  "title": "Puls: uppdrag <kort titel> klart — kör retrospektiv",
  "description": "Uppdrag <rotid> är levererat. Experter som deltog: <lista>. Trigga retrospektiv enligt fortbildning-trainer.",
  "assigneeAgentId": "utbildningsledare",
  "priority": "low"
}
```

## Steg 7 — Dialog efter leverans

Kunden kan ställa följdfrågor via kommentarer. I varje heartbeat:

1. Läs nya kommentarer på öppna rot-issues
2. Om frågan kan besvaras direkt (klargörande, status): svara själv
3. Om frågan kräver expertinsats: skapa ny subtask

## Steg 8 — Stäng uppdraget

Ett uppdrag stängs när:

- Kunden `PATCH`:ar rot-issuet till `status: "done"` — acceptera
  som signal att avsluta
- **Eller** 14 dagar har passerat utan ny kommunikation — du
  stänger själv med en kommentar:

```markdown
Vi noterar att det varit tyst på detta uppdrag i 14 dagar. Vi stänger
det nu. Om ni behöver återöppna eller har följdfrågor, skapa gärna
ett nytt kundprotokoll-issue med `request_type: "followup"` och
referera external_id <uuid>.
```

Sätt `status: "done"`.

## Felhantering

### Ogiltigt frontmatter

Om `protocol`-fältet är fel version eller frontmatter inte kan parsas:

```markdown
**Protokollfel.**

Detta issue ser ut att försöka använda Expertbyråns kundprotokoll men
frontmatter är ogiltigt. Fel: <specifikt fel>.

Giltigt format finns dokumenterat i `kundprotokoll-klientsida`-skillen.
External ID: <uuid om parsningsbar, annars "okänt">.
```

Sätt `status: "todo"` (inte done) så att kunden kan åtgärda och vi
kan processa igen.

### Saknad kompetens

Om Expertbyrån inte har rätt kompetens (domän-hint är `annat` eller
uppdragstypen är utanför vårt område):

1. Eskalera till VD och relevant konsultchef via interna tasks
2. Svara kunden ärligt om att vi behöver tid att rekrytera eller
   att uppdraget ligger utanför vårt nuvarande kompetensspektrum

## Referenser

- `kundprotokoll-klientsida` — motsvarande skill för extern client
- `kompetensmatchning` — hur matchningen görs
- `vetenskapliga-krav-granskningsrapport` — leveransstandarden
- README.md — auktoritativ roll-till-uthyrning-tabell
