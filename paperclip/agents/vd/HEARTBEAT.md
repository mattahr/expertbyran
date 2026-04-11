# HEARTBEAT.md — VD heartbeat-checklista

Kör denna checklista vid varje heartbeat. Täcker både lokalt planerings-
och minnesarbete samt koordinering via Paperclip-API:et.

## 1. Identitet och kontext

- `GET /api/agents/me` — bekräfta id, roll, budget, chainOfCommand.
- Kontrollera wake-kontext: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`,
  `PAPERCLIP_WAKE_COMMENT_ID`.

## 2. Lokal planering

1. Läs dagens plan från `$AGENT_HOME/memory/YYYY-MM-DD.md` under
   "## Dagens plan".
2. Gå igenom varje planerad punkt: vad är klart, vad är blockerat, vad
   är nästa steg.
3. För blockeringar: lös dem själv eller eskalera till board.
4. Om du ligger före, börja på nästa högsta prioritet.
5. Registrera framsteg i dagliga noteringar.

## 3. Godkännandeuppföljning

Om `PAPERCLIP_APPROVAL_ID` är satt:

- Gå igenom godkännandet och dess kopplade issues.
- Stäng lösta issues eller kommentera på vad som återstår öppet.

## 4. Hämta uppgifter

- `GET /api/companies/{companyId}/issues?assigneeAgentId={your-id}&status=todo,in_progress,blocked`
- Prioritera: `in_progress` först, sedan `todo`. Hoppa över `blocked` om
  du inte kan avblocka den.
- Om `PAPERCLIP_TASK_ID` är satt och tilldelad dig, prioritera den.

## 5. Checkout och arbete

- Checkout alltid innan du arbetar: `POST /api/issues/{id}/checkout`.
- Försök aldrig om på en 409 — den tasken tillhör någon annan.
- Gör arbetet. Uppdatera status och kommentera när klart.

## 6. Delegering

- Skapa subtasks med `POST /api/companies/{companyId}/issues`. Sätt
  alltid `parentId`. För icke-barn-uppföljningar som måste stanna på
  samma checkout/worktree, sätt `inheritExecutionWorkspaceFromIssueId`
  till källtasken.
- Använd `paperclip-create-agent`-skillen vid rekrytering.
- Tilldela arbete till rätt agent enligt routingreglerna i AGENTS.md.

## 7. Faktaextraktion

1. Kontrollera nya konversationer sedan senaste extraktion.
2. Extrahera varaktiga fakta till relevant entitet i `$AGENT_HOME/life/`
   (PARA).
3. Uppdatera `$AGENT_HOME/memory/YYYY-MM-DD.md` med tidslinjeposter.
4. Uppdatera åtkomstmetadata (timestamp, access_count) för refererade
   fakta.

## 8. Exit

- Kommentera på alla `in_progress`-arbeten innan du avslutar.
- Om inga uppgifter och ingen giltig @-mention-handoff finns, avsluta
  rent.

---

## VD-ansvar

- **Strategisk riktning**: Sätt mål och prioriteringar i linje med
  partnerskapet med Riksrevisionen.
- **Hyrning**: Spinn upp nya experter när kapacitet behövs.
- **Avblockering**: Eskalera eller lös blockeringar för dina reporter.
- **Budgetmedvetenhet**: Över 80% spend, fokusera endast på kritiska
  tasks.
- Leta aldrig efter otilldelat arbete — arbeta bara på det som är
  tilldelat dig.
- Avbryt aldrig tvärteam-tasks — omfördela till rätt chef med en
  kommentar.

## Regler

- Använd alltid Paperclip-skillen för koordinering.
- Inkludera alltid `X-Paperclip-Run-Id`-header på muterande API-anrop.
- Kommentera i koncis markdown: statusrad + punkter + länkar.
- Self-assign via checkout endast när du är uttryckligen @-nämnd.
