# HEARTBEAT.md — Klientkoordinatorns heartbeat-rutin

## 1. Identitet och kontext

- `GET /api/agents/me` — bekräfta id, roll.
- Kontrollera wake-kontext: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`,
  `PAPERCLIP_WAKE_COMMENT_ID`.

## 2. Hämta egna issues

- `GET /api/companies/{companyId}/issues?assigneeAgentId={your-id}&status=todo,in_progress`
- Separera:
  - **Protokoll-konforma** (description börjar med `protocol: "expertbyran/v1"`)
  - **Övriga** (interna tasks från VD, utbildningsledaren, etc)
- Övriga hanteras som vanliga Paperclip-tasks.

## 3. Processa protokoll-konforma förfrågningar

För varje nytt rot-issue med `protocol: "expertbyran/v1"`:

1. **Checkout**: `POST /api/issues/{id}/checkout`
2. **Parsa frontmatter**. Kritiska fält:
   - `request_type` — hittills stöds bara `"new_engagement"`
   - `external_id` — kundens egen UUID, inkludera i alla svar
   - `deadline` — beaktas vid tidsplan
   - `role_hint` — "projektledare" / "metodstöd" / "referensperson" /
     "domänexpert" / "opponent" (se roll-till-uthyrning-tabellen)
   - `domain_hint` — "finanser" / "digitalisering" / "rattsvasende" /
     "valfard" / "annat"
3. **Kör matchning** via `kompetensmatchning`-skillen. Slå upp
   experter i `projects/kompetenskatalog/` och läs relevanta
   `agents/<expert>/expertise.md`.
4. **Skapa subtasks** till föreslaget team:
   ```
   POST /api/companies/{cid}/issues
   {
     "title": "Delegerat: <kort beskrivning>",
     "description": "<vad som förväntas leveras + deadline>",
     "assigneeAgentId": "<expert-slug>",
     "parentId": "<rot-issue-id>",
     "priority": "medium"
   }
   ```
5. **Kommentera rot-issuet** med bekräftelse:
   ```
   POST /api/issues/{rotid}/comments
   {
     "body": "**Mottaget.**\n\nExternal ID: <uuid>\nTeam: <lista över experter>\nEstimerad leverans: <datum>\n\nFöljer upp via denna issue."
   }
   ```

## 4. Processa pågående uppdrag

För varje `in_progress` rot-issue med protokoll-frontmatter:

1. Hämta subtasks: `GET /api/issues/{rotid}` (returnerar ancestors +
   barn via relationer).
2. Om alla subtasks är `done`:
   - Aggregera leveranserna från subtasks (läs deras documents/comments).
   - Skriv leveransdokument:
     ```
     PUT /api/issues/{rotid}/documents/leverans
     {
       "title": "Leverans — <uppdragstitel>",
       "format": "markdown",
       "body": "<strukturerad rapport enligt vetenskapliga-krav-granskningsrapport>"
     }
     ```
   - Kommentera rot-issuet: "Leverans klar. Se document key `leverans`."
   - Skapa puls-task till utbildningsledaren (se steg 6).

## 5. Svara på kundkommentarer

För varje öppet rot-issue med nya kommentarer från `klient-riksrevisionen`:

- Läs kommentaren.
- Om den är en fråga du kan svara på direkt (klargörande, status): svara.
- Om den kräver expertinsats: skapa en ny subtask till relevant expert
  och kommentera rot-issuet med "Vi återkommer efter expertsvar."

## 6. Puls-task till utbildningsledaren

När ett uppdrag har markerats `done`:

```
POST /api/companies/{cid}/issues
{
  "title": "Puls: uppdrag <kort titel> klart — kör retrospektiv",
  "description": "Uppdrag <rotid> är levererat. Experter som deltog: <lista>. Trigga retrospektiv enligt fortbildning-trainer.",
  "assigneeAgentId": "utbildningsledare",
  "priority": "low"
}
```

Detta garanterar att lärande-kedjan körs även när bolaget är vilande
mellan uppdrag.

## 7. Exit

- Kommentera på alla `in_progress`-issues innan du avslutar.
- Inga nya protokoll-konforma förfrågningar? Avsluta rent.
