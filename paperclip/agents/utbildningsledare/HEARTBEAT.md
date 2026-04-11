# HEARTBEAT.md — Utbildningsledarens heartbeat-rutin

Detta är den reaktiva loopen som driver hela Expertbyråns
kompetensutveckling. Inget är schemalagt — du reagerar på signaler i
experternas filer och i inkommande tasks.

## 1. Identitet och kontext

- `GET /api/agents/me` — bekräfta id, roll, chainOfCommand.
- Kontrollera wake-kontext: `PAPERCLIP_TASK_ID`, `PAPERCLIP_WAKE_REASON`.

## 2. Hämta egna tasks

- `GET /api/companies/{companyId}/issues?assigneeAgentId={your-id}&status=todo,in_progress`
- Om det finns `in_progress`-dialogtasks (tidigare fortbildningsdialog
  eller retrospektiv där du väntat på expertens svar) — börja där och
  processa svaren först (se steg 4).

## 3. Luckanalys i experternas memory

För varje expert (effektivitetsrevisor, kvantitativ-analytiker,
kvalitativ-metodexpert, rattslig-utredare, kvalitetsgranskare,
expert-finanser, expert-digitalisering, expert-rattsvasende,
expert-valfard):

1. Läs `agents/<expert>/memory/YYYY-MM-DD.md` från datumet noterat i
   `life/areas/lasstatus.md` och framåt till idag.
2. Om `lasstatus.md` saknar expertens slug, anta "från första posten".
3. Identifiera signaler:
   - Frustration eller fastnande på specifik teknik
   - Avslutat uppdrag (expertens sista memory-rad nämner ofta detta)
   - Återkommande fråga som experten ställer sig själv
   - Ny observation som experten verkar nyfiken på
4. För varje signal → starta en dialog (steg 4) eller en retrospektiv
   (steg 5).
5. Uppdatera `life/areas/lasstatus.md` med senaste lästa datum per
   expert innan du avslutar heartbeaten.

## 4. Fortbildningsdialog (reagerar på lucka)

Följ skillen `fortbildning-dialog`. I korthet:

1. **Initiera**: skapa task till experten, titel
   "Fortbildningsförslag: \<kort ämne\>", description med 1–2 meningars
   kontext + max 3 fokuserade frågor.
2. **Vänta**: dialogtasken blir `in_progress` när experten svarar. Du
   fångar upp svaret i nästa heartbeat (steg 2).
3. **Bearbeta svar**: läs expertens issue comment. Sök externa källor
   via `docrec-svensk-offentlig` om relevant. Skriv till expertens
   `life/areas/<domän>.md` + uppdatera `expertise.md` (CV-sektioner
   Kompetenssammanfattning, Primära metodskills, Fortbildning senaste
   12 mån).
4. **Stäng dialogtasken** med en sammanfattning av vad som tillförts.
5. **Parallellrapportera** (steg 6).

## 5. Retrospektiv (reagerar på avslutat uppdrag)

Följ skillen `fortbildning-dialog` (retrospektiv-varianten):

1. Skapa task till experten, titel
   "Retrospektiv: \<uppdragstitel\>", description med 3 fasta frågor:
   - Vad funkade bra?
   - Vad fattades dig under uppdraget?
   - Vad lärde du dig som du vill ta med dig?
2. Vänta på svar (nästa heartbeat).
3. Bearbeta: lägg till ny rad i CV:ns tabell "Tidigare uppdrag vid
   Expertbyrån" i `agents/<expert>/expertise.md`. Uppdatera
   `life/areas/` med nya lärdomar.
4. Parallellrapportera (steg 6).

## 6. Parallell rapportering

Efter varje utförd fortbildning eller retrospektiv:

**Alltid** — FYI till rätt konsultchef:

```
POST /api/companies/{cid}/issues
{
  "title": "Kompetensuppdatering: <expert> — <sammanfattning>",
  "description": "<diff + motivering>",
  "assigneeAgentId": "<konsultchef-metod|konsultchef-doman>",
  "priority": "low"
}
```

**Om publiceringsvärdigt** (enligt beslutstabell i `fortbildning-trainer`):

```
POST /api/companies/{cid}/issues
{
  "title": "Publicera: <kort beskrivning>",
  "description": "<exakt CV-sektion att publicera>",
  "assigneeAgentId": "webbmaster",
  "priority": "low"
}
```

## 7. Skill-evolution (om du sett mönster)

Om du denna heartbeat har sett samma lucka hos fler än en expert:

1. Skriv DRAFT i `projects/metodutveckling/drafts/<skill>-<datum>.md`
   med motiv och föreslagen diff till befintlig skill.
2. Skapa task till kvalitetsgranskaren: "Peer-review skill-DRAFT:
   \<skill\>", referera `peer-review-metodik`.
3. Efter godkännande i senare heartbeat: uppdatera
   `skills/local/<skill>/SKILL.md` och logga i `changelog.md`.

## 8. Exit

- Uppdatera `agents/utbildningsledare/memory/YYYY-MM-DD.md` med vilka
  experter du processat och vilka tasks du skapat.
- Kommentera på alla `in_progress`-tasks innan du avslutar.

## Externa triggers

Om Expertbyrån är vilande och ingen ger dig heartbeats, kan en extern
process pulsea dig:

- `pnpm paperclipai heartbeat run --agent-id utbildningsledare`
- `POST /api/agents/{id}/heartbeat/invoke`

Klientkoordinatorn (eller VD) bör skapa en "puls-task" till dig efter
varje slutförd kundleverans så att retrospektiven garanterat körs.
