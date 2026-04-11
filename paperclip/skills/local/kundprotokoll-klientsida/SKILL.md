---
name: "kundprotokoll-klientsida"
description: "Referensdokumentation för extern klient (t.ex. Claude Code + Obsidian) som vill använda Expertbyråns kundprotokoll. HTTP-exempel för alla fem protokollsteg."
slug: "kundprotokoll-klientsida"
metadata:
  paperclip:
    slug: "kundprotokoll-klientsida"
    skillKey: "local/expertbyran/kundprotokoll-klientsida"
  skillKey: "local/expertbyran/kundprotokoll-klientsida"
key: "local/expertbyran/kundprotokoll-klientsida"
---

# Kundprotokoll v1 — klientsidan

Detta är referensdokumentationen för **extern klient**-sidan av
Expertbyråns kundprotokoll. Skillen är inkluderad i mallen som
dokumentation — den körs **aldrig** av bolaget självt. Tanken är
att en extern process (t.ex. en Claude Code-agent med Obsidian som
kunskapsbas) ska kunna läsa denna skill och implementera
klientsidan av protokollet direkt.

**Serverside-motsvarigheten** (klientkoordinatorns mottagande):
`kundprotokoll`-skillen.

## Förutsättningar

1. **Paperclip-instans igång** — Expertbyrån måste vara importerad
   och körs. Standard: `http://localhost:3100/api`.
2. **API-nyckel från fasadagenten** — skapa en långlivad nyckel:

```http
POST /api/agents/klient-riksrevisionen/keys
Authorization: Bearer <board-operator-session>
```

Svaret innehåller en `key` som du använder i alla anrop nedan som
`Authorization: Bearer <key>`.

3. **Process som kan göra HTTP-anrop och pollings** — typiskt en
   Claude Code-agent, en liten CLI-wrapper, eller en webbapp.

## Protokollversion

Detta dokument beskriver `protocol: "expertbyran/v1"`. Versionen är
bindande — klientkoordinatorn ignorerar issues med fel version.

## Fem-stegs flöde

### Steg 1 — Skicka uppdragsförfrågan

```http
POST /api/companies/{companyId}/issues
Authorization: Bearer <klient-riksrevisionens API-nyckel>
Content-Type: application/json

{
  "title": "Uppdragsförfrågan: <kort titel>",
  "description": "<se mall nedan>",
  "assigneeAgentId": "klientkoordinator",
  "priority": "medium"
}
```

**Description-mall:**

```markdown
---
protocol: "expertbyran/v1"
request_type: "new_engagement"
external_id: "<din UUID, t.ex. genererad med uuidgen>"
deadline: "YYYY-MM-DD"
role_hint: "projektledare | enhetschef | metodstöd | referensperson | domänexpert | opponent | kombinerat"
domain_hint: "finanser | digitalisering | rattsvasende | valfard | annat"
---

## Bakgrund

<2–5 meningar om varför uppdraget behövs>

## Revisionsfråga / problemformulering

<1–2 stycken, så skarpt formulerat som möjligt>

## Omfattning och avgränsningar

- **Ingår**: <myndigheter, tidsperiod, metodtyper>
- **Exkluderas**: <vad som inte ska täckas>
- **Tidsperiod**: YYYY-YYYY

## Önskad leverans och tidplan

- Leverans 1 (datum): <vad>
- Leverans 2 (datum): <vad>

## Kontakt

External ID ovan räcker; svara via issue comments på detta issue.
```

Svar: `{ "id": "<rot-issue-id>", ... }`. Spara `id` — det är din
handle för fortsatt dialog.

### Steg 2 — Vänta på bekräftelse (ACKED)

Klientkoordinatorn triagerar vid nästa heartbeat och kommenterar
rot-issuet. Polla kommentarer:

```http
GET /api/issues/{rotid}/comments
Authorization: Bearer <key>
```

När en kommentar dyker upp som innehåller "**Mottaget.**", har
klientkoordinatorn triagerat. Du ser nu:

- Team som bemannats
- Estimerad leverans

**Pollingstrategi:**

- Polla var 30:e sekund i 5 minuter
- Om inget svar, backa av till var 2:a minut
- Om 30 minuter utan svar, logga och varna användaren — paperclip-
  instansen är kanske inte igång, eller klientkoordinatorn har inte
  heartbeats

### Steg 3 — Vänta på leverans (DELIVERED)

När experterna jobbar, polla periodiskt efter kommentaren
"**Leverans klar.**":

```http
GET /api/issues/{rotid}/comments
```

När den dyker upp, hämta leveransdokumentet:

```http
GET /api/issues/{rotid}/documents/leverans
Authorization: Bearer <key>
```

Svaret är ett JSON-objekt med `title`, `format`, `body` (markdown).
`body`-fältet är själva leveransen.

### Steg 4 — Ställ följdfrågor

Om du vill ställa en fråga till Expertbyrån efter leveransen:

```http
POST /api/issues/{rotid}/comments
Authorization: Bearer <key>
Content-Type: application/json

{
  "body": "<din fråga som markdown>"
}
```

Klientkoordinatorn fångar upp kommentaren vid nästa heartbeat och
svarar. Samma pollingstrategi som i steg 2.

### Steg 5 — Stäng uppdraget

När du är klar:

```http
PATCH /api/issues/{rotid}
Authorization: Bearer <key>
X-Paperclip-Run-Id: <valfri uuid>
Content-Type: application/json

{
  "status": "done"
}
```

Eller bara lämna uppdraget — klientkoordinatorn stänger automatiskt
efter 14 dagar utan dialog.

## Integration med Obsidian

Om den externa processen är en Claude Code-agent med Obsidian som
knowledgebase, är ett naturligt mönster:

1. **Obsidian-notering som källa** — användaren skriver en not om
   behovet i Obsidian, t.ex. `Uppdrag/2026-04-LSS-granskning.md`
2. **Claude Code läser noten** och extraherar strukturerad data
3. **Genererar frontmatter + description** enligt protokollet
4. **POST till paperclip** — skapar issuet
5. **Pollar kommentarer och leverans** i bakgrunden
6. **Sparar svaren tillbaka till Obsidian** som en ny not:
   `Uppdrag/2026-04-LSS-granskning - Leverans.md`

### Exempel på Obsidian-källformat

```markdown
---
type: "expertbyran-forfragan"
external_id: "e7b83c1e-aa49-4b22-bb1a-f5a2d9c8"
request_type: "new_engagement"
deadline: "2026-06-30"
role_hint: "metodstöd"
domain_hint: "valfard"
status: "pending"  # pending | acked | delivered | closed
paperclip_issue_id: null  # fylls i efter POST
---

# Granskning av LSS-beslutskvalitet

## Bakgrund

...

## Revisionsfråga

...

<osv>
```

När svaret kommer från Expertbyrån, uppdaterar Claude Code-agenten
`status`-fältet och bifogar leveransen.

## Säkerhet

Paperclip körs på `localhost:3100` och är inte exponerat externt.
Säkerheten vilar på tre lager:

1. **Nätverksgräns** — bara processer på samma maskin når API:et
2. **API-nyckel** från fasadagenten `klient-riksrevisionen` — alla
   dina issues spåras till denna identitet
3. **Konventionsfiltrering** — klientkoordinatorn processar bara
   issues med `protocol: "expertbyran/v1"`-frontmatter

**Skydda API-nyckeln** som vilket som helst lösenord. Lagra i
keychain eller env-variabel, inte i klartext.

## Felhantering

### Klientkoordinatorn svarar med "Protokollfel"

Din frontmatter är ogiltig. Läs felmeddelandet, åtgärda, och posta
en ny kommentar på samma issue med korrigerad frontmatter — eller
skapa ett nytt issue.

### Ingen bekräftelse efter 30 minuter

Möjliga orsaker:

- Paperclip-instansen är inte igång → starta den
- Klientkoordinatorn har inga heartbeats → trigga manuellt med:
  `pnpm paperclipai heartbeat run --agent-id klientkoordinator`
- Expertbyrån är vilande utan aktivitet → samma

### Expertbyrån svarar att kompetens saknas

Klientkoordinatorn kan svara att uppdraget ligger utanför
Expertbyråns nuvarande kompetensspektrum. Du kan då:

- Justera förfrågan (mindre omfattande)
- Vänta tills Expertbyrån hunnit hyra en ny expert
- Söka annan leverantör

## Utökade request types (framtid)

Version 1 stödjer bara `request_type: "new_engagement"`. Framtida
versioner kan inkludera:

- `"followup"` — följdfråga på ett tidigare avslutat uppdrag
- `"expert_question"` — snabbfråga utan formellt uppdrag
- `"methodology_review"` — opponentläsning av en färdig rapport

När sådana införs bumpar protokollversionen (`"expertbyran/v2"`).
