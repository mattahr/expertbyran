---
name: "fortbildning-trainer"
description: "Utbildningsledarens övergripande process: luckanalys, dialoginitiering, beslutstabell för publicering, och hur externa processer kan trigga utbildningsledarens heartbeat. Ingen datumlogik, inga recurring-jobb."
slug: "fortbildning-trainer"
metadata:
  paperclip:
    slug: "fortbildning-trainer"
    skillKey: "local/expertbyran/fortbildning-trainer"
  skillKey: "local/expertbyran/fortbildning-trainer"
key: "local/expertbyran/fortbildning-trainer"
---

# Utbildningsledarens övergripande process

Detta är den övergripande skillen som binder ihop
utbildningsledarens ansvar. För själva dialogmekaniken, se
`fortbildning-dialog`. Denna skill fokuserar på:

1. Luckanalys över alla experter
2. När dialog ska initieras (triggers)
3. Beslutstabell för publicering
4. Externa triggers för utbildningsledarens heartbeat

**Ingen schemalagd logik.** Ingen datumcheck. Inga recurring-jobb.
Utbildningsledaren reagerar på faktiska händelser i experternas filer
och i inkommande tasks.

## 1. Luckanalys

### Startpunkt

Läs `agents/utbildningsledare/life/areas/lasstatus.md`. Det är din
egen state-fil som markerar "senast lästa rad" per expert.

Format:

```yaml
effektivitetsrevisor:
  senast_lasta_datum: "2026-04-10"
  senaste_processad_rad: "2026-04-10 16:45"
```

### För varje expert

Gå igenom `agents/<expert>/memory/YYYY-MM-DD.md` från senaste lästa
datum framåt. De nio experterna som ska läsas:

- effektivitetsrevisor
- kvantitativ-analytiker
- kvalitativ-metodexpert
- rattslig-utredare
- kvalitetsgranskare
- expert-finanser
- expert-digitalisering
- expert-rattsvasende
- expert-valfard

### Identifiera signaler

Leta efter följande mönster i de nya memory-raderna:

| Signal                                 | Åtgärd                    |
|----------------------------------------|---------------------------|
| "Fastnade på X"                        | Fortbildningsdialog       |
| "Önskar jag kunde bättre Y"            | Fortbildningsdialog       |
| "Uppdrag Z är klart"                   | Retrospektivdialog        |
| "Såg att det finns en rapport om..."   | Fortbildningsdialog       |
| "Oklart hur man gör när..."            | Fortbildningsdialog       |
| Strikt rutinkörning, inget nytt        | Ingen åtgärd              |

### Uppdatera lasstatus

Innan heartbeaten avslutas, uppdatera `lasstatus.md` med senaste
lästa datum per expert så att nästa heartbeat börjar därifrån.

## 2. När du INTE ska initiera dialog

- När experten redan har en öppen dialogtask från dig
- När samma signal återkommer inom en kort period (undvik upprepning)
- När signalen är för vag för att formulera en fokuserad fråga
- När uppdrag är mycket aktuellt — vänta tills det är avslutat, kör
  retrospektiv istället

## 3. Beslutstabell — publiceringsvärdig CV-ändring

Efter att du har utfört fortbildning eller retrospektiv, avgör om
ändringen ska publiceras externt på webbplatsen. Följ denna tabell:

| CV-ändring                                        | Publicera? | Varför |
|---------------------------------------------------|------------|--------|
| Ny rad i tabellen "Tidigare uppdrag"              | **Ja**     | Bevis på leveranskapacitet |
| Ny publikation                                    | **Ja**     | Trovärdighetsmarkör |
| Ny primär metodskill                              | **Ja**     | Breddad kompetens |
| Ny större specialisering (nytt område)            | **Ja**     | Ny säljbar expertis |
| Ny fortbildningsrad (inkrementell)                | Nej        | Rutinunderhåll, ej nyhetsvärdigt |
| Uppdaterad kompetenssammanfattning (redaktionell) | Nej        | Kosmetisk |
| Rättning av stavfel                               | Nej        | Trivialt |
| Ny erfarenhet inom befintligt område              | Kan bero på| Bedöm — om markant fördjupning, ja |

**Vid osäkerhet: publicera inte.** Hellre en extra fortbildning än
att översäljа experten på webbplatsen.

## 3b. Beslutsregel — coaching om vault-värdig kunskap

Du skriver inte själv till Obsidian-vaulten. Men i din coachroll
bedömer du om experten **bör** skapa ett obsidian-utkast baserat på
den nya kunskapen. Om ja — lägg till en rad i din uppföljnings-task
till experten (se `fortbildning-dialog`-skillen) som påminner om
`obsidian-global`.

| Kunskapstyp                                        | Coach experten till vault? | Varför |
|----------------------------------------------------|----------------------------|--------|
| Ny metod- eller domänkunskap med primärkälla       | **Ja**                     | Kanonisk, återanvändbar av andra experter |
| Ny källa (SOU, prop, lag) med relevant innehåll    | **Ja**                     | Återanvändbar källnot |
| Korrigering av felaktigt påstående i befintlig not | **Ja**                     | Vaulten ska vara korrekt |
| Expertens personliga arbetssätt utan extern källa  | Nej                        | Hör hemma i expertens egna filer |
| Fältspecifik observation från ett uppdrag          | Nej                        | För smalt för delad kunskapsbas |
| Retrospektivinsikt utan generaliserbar lärdom      | Nej                        | Stannar i retrospektivkommentaren |

**Vid osäkerhet: coacha ändå.** Obsidian-master verifierar källorna
vid publiceringsbegäran och avvisar eller degraderar om innehållet
inte håller. Experten lär sig av processen.

## 4. Parallellrapportering — två kanaler

När du har bestämt dig:

### Alltid till konsultchefen (FYI)

```
POST /api/companies/{cid}/issues
{
  "title": "Kompetensuppdatering: <expert> — <kort sammanfattning>",
  "description": "<vad som ändrats + motivering>",
  "assigneeAgentId": "<konsultchef-metod | konsultchef-doman>",
  "priority": "low"
}
```

Välj rätt konsultchef:

- Metod-experter (effektivitetsrevisor, kvantitativ, kvalitativ,
  rättslig, kvalitetsgranskare) → **konsultchef-metod**
- Domän-experter (finanser, digitalisering, rättsväsende, välfärd) →
  **konsultchef-doman**

### Om publiceringsvärt: till webbmastern

```
POST /api/companies/{cid}/issues
{
  "title": "Publicera: <kort beskrivning>",
  "description": "<exakt CV-sektion att publicera + motivering från beslutstabellen>",
  "assigneeAgentId": "webbmaster",
  "priority": "low"
}
```

Konsultchefen är **inte** beslutspunkt för publiceringen. Du har
sett all kontext och är bäst positionerad. Parallellrapporteringen
betyder att båda informeras samtidigt.

### Inte obsidian-master

Du skickar **inte** task direkt till obsidian-master. Om kunskapen
är vault-värdig enligt beslutsregeln i sektion 3b — din
uppföljnings-task till experten (via `fortbildning-dialog`-skillen)
inkluderar en påminnelse om att skapa obsidian-utkast via
`obsidian-global`. Experten äger utkastet och skickar själv
`Obsidian-publicera:`-task när hen är redo.

## 5. Skill-evolution — när du ser mönster

Om samma typ av lucka dyker upp hos **flera experter** (minst 2), är
det en signal till skill-evolution snarare än individuell fortbildning.

Följ `skill-evolution`-skillen:

1. DRAFT i `projects/metodutveckling/drafts/`
2. REVIEW via `peer-review-metodik` (kvalitetsgranskaren)
3. ADOPT genom att skriva in ändringen i
   `skills/local/<skill>/SKILL.md` + logga i changelog

## 6. Externa triggers för utbildningsledarens heartbeat

Paperclip-runtimet ger dig heartbeats när du har arbete. Om
Expertbyrån är vilande får du inga heartbeats — och då stannar
lärande-kedjan. Ingen information går förlorad, men leveransen
fördröjs.

Två sätt att garantera att lärandet körs:

### 6a. Intern puls-task

Klientkoordinatorn skapar en puls-task till dig efter varje slutförd
kundleverans (detta är dokumenterat i klientkoordinatorns
`HEARTBEAT.md`):

```
POST /api/companies/{cid}/issues
{
  "title": "Puls: uppdrag <titel> klart — kör retrospektiv",
  "description": "Uppdrag <rotid> är levererat. Experter som deltog: <lista>. Trigga retrospektiv.",
  "assigneeAgentId": "utbildningsledare",
  "priority": "low"
}
```

### 6b. Extern trigger

En extern process kan pulsea dig via:

**CLI:**
```bash
pnpm paperclipai heartbeat run --agent-id utbildningsledare
```

**API:**
```http
POST /api/agents/utbildningsledare/heartbeat/invoke
Authorization: Bearer <API-nyckel>
```

**Cron-exempel:**
```cron
# Varje måndag morgon, pulsea utbildningsledaren
0 9 * * 1 cd /path/to/Expertbyran && pnpm paperclipai heartbeat run --agent-id utbildningsledare
```

Men **detta är inte mallens default**. Default är att lärande-kedjan
körs reaktivt när bolaget faktiskt har arbete. Externa triggers är
en backup för bolag med låg aktivitet.

## 7. Skriv till din egen memory

I slutet av din heartbeat, skriv en kort sammanfattning i
`agents/utbildningsledare/memory/YYYY-MM-DD.md` om:

- Vilka experter du processat
- Vilka dialoger du initierat
- Vilka rapporteringar du skapat
- Om du sett mönster som kan leda till skill-evolution

Det är din egen lärande-logg, och den kan också läsas av VD vid
översyn.
