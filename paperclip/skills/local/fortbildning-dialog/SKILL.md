***

name: "utvecklingssamtal"
description: "Utbildningsledarens mall för dialogbaserad fortbildning och uppdragsretrospektiv. Tre steg: initiera fokuserad fråga → bearbeta svar → stäng dialog. Fokuserade frågor skyddar expertens kontextfönster."
slug: "fortbildning-dialog"
metadata:
paperclip:
slug: "fortbildning-dialog"
skillKey: "local/expertbyran/fortbildning-dialog"
skillKey: "local/expertbyran/fortbildning-dialog"
key: "local/expertbyran/fortbildning-dialog"
--------------------------------------------

# Utvecklingssamtal

Detta är utbildningsledarens arbetsverktyg för att genomföra
dialogbaserad fortbildning eller uppdragsretrospektiv med en expert.
Metoden är fokuserad och kort för att skydda expertens kontextfönster
— experten ska svara på **max 3 fokuserade frågor** i **3–10 rader**.

## Två varianter

Samma flöde, olika utgångspunkter:

1. **Fortbildningsdialog** — initieras när utbildningsledaren ser en
   lucka eller frustration i expertens memory-rader
2. **Retrospektivdialog** — initieras när experten markerat ett
   uppdrag som `done`

## Triggers (när ska en dialog initieras)

Vid luckanalys i `HEARTBEAT.md`, leta efter dessa mönster i
experternas memory:

### Fortbildningssignaler

* Återkommande frustration på samma teknik eller metod
* Konkret fråga som experten ställer sig själv ("önskar jag hade...")
* Ny observation som experten verkar nyfiken på
* Tekniskt område där experten nämner att hen kommer till korta

### Retrospektivsignaler

* Expertens memory-rad nämner att ett uppdrag är klart
* Ett subtask med `assigneeAgentId: <expert>` har statusen `done`
* Klientkoordinatorn har skapat en puls-task efter en kundleverans

## Steg 1 — Initiera dialogen

Skapa en task till experten:

```
POST /api/companies/{cid}/issues
{
  "title": "Utvecklingssamtal: <kort ämne>",
  "description": "<1–2 meningars kontext + max 3 fokuserade frågor>",
  "assigneeAgentId": "<expert-slug>",
  "priority": "low"
}
```

### Fortbildningsmall (3 frågor)

```Markdown
## Bakgrund

Jag såg i din memory att <kort observation>. Det är en naturlig lucka
i din kunskapsbas, och innan jag söker externa källor vill jag veta
vad du själv tycker skulle hjälpa dig.

## Tre fokuserade frågor

Svara kort (3–10 rader totalt) i en issue comment. Om du inte har
något att säga om en fråga, skriv "inget akut".

1. **Källor du sett men inte hunnit läsa**: finns det en specifik
   Riksrevisionen-granskning, SOU, eller rapport som du vet finns men
   inte har hunnit sätta dig in i?

2. **Konkret metodfråga**: <specifik fråga om teknik eller metod>

3. **Något du vill öva på**: finns det en specifik typ av uppdrag
   du gärna skulle vilja pröva?

## Vad händer sedan

När du svarat skickar jag en uppföljnings-task med förslag på riktning
och källor. Du använder `kompetensutveckling`-skillen för att söka,
läsa och uppdatera dina filer (`expertise.md`, `life/areas/<domän>.md`)
samt — om lämpligt — skapa obsidian-utkast via `obsidian-global`.
Jag finns som bollplank om du fastnar.
```

### Retrospektivmall (3 frågor)

```Markdown
## Bakgrund

Uppdrag <titel> är markerat som klart. Jag vill fånga upp lärdomarna
innan de försvinner.

## Tre korta frågor

Svara kort (3–10 rader totalt):

1. **Vad funkade bra?**
2. **Vad fattades dig under uppdraget?** (Kunskap, verktyg, källor,
   samarbete.)
3. **Vad lärde du dig som du vill ta med dig till framtida uppdrag?**

## Vad händer sedan

Du integrerar lärdomen själv i din `life/areas/<domän>.md` och
lägger till ny rad i "Tidigare uppdrag vid Expertbyrån" i din
`expertise.md`. Om lärdomen är generell — skapa ett obsidian-utkast
via `obsidian-global`. Jag skickar en uppföljnings-task med
påminnelse och rapporterar parallellt till rätt konsultchef och
eventuellt webbmastern.
```

## Steg 2 — Vänta på svar

Experten svarar vid sin nästa heartbeat. Du fångar upp svaret i
nästa egen heartbeat (steg 2 i din HEARTBEAT).

## Steg 3 — Bearbeta svar

När experten svarat:

### 3a. Läs svaret

Parsa svaret. Identifiera:

* Vilka konkreta källor experten nämnt
* Vilka metodfrågor som behöver svar
* Vilka praktiska behov experten har

### 3b. Skicka uppföljnings-task till experten

**Du skriver inte åt experten.** Du coachar hen att göra jobbet
själv. Skicka en follow-up-task med tydlig riktning:

```
POST /api/companies/{cid}/issues
{
  "title": "Fortbildning: <kort ämne baserat på dialog>",
  "description": "Baserat på ditt dialogsvar — använd `kompetensutveckling`-skillen för att fördjupa dig i <X>. Förslag på källor att börja med: <1-3 konkreta referenser>. Uppdatera din `expertise.md`, din `life/areas/<domän>.md`, och skapa vid behov ett obsidian-utkast via `obsidian-global`.",
  "assigneeAgentId": "<expert-slug>",
  "priority": "low"
}
```

Vid **retrospektiv**: skicka istället en task med fokus på
integration av lärdomen:

```
POST /api/companies/{cid}/issues
{
  "title": "Retrospektiv-integration: <uppdrag>",
  "description": "Integrera din retrospektivlärdom i din `life/areas/<domän>.md` och din `expertise.md` (ny rad i 'Tidigare uppdrag'). Om lärdomen är generell — skapa ett obsidian-utkast via `obsidian-global`.",
  "assigneeAgentId": "<expert-slug>",
  "priority": "low"
}
```

Du följer upp vid nästa luckanalys att uppföljningen faktiskt sker.

### 3c. Stäng dialogtasken

Kommentera dialogtasken med en kort sammanfattning:

```markdown
Tack för svaret. Jag har skickat en uppföljnings-task till dig med
förslag på riktning och källor. Du styr sökande och skrivande från
här; jag finns tillgänglig som bollplank om du fastnar.
```

Markera tasken `done`.

## Steg 4 — Parallellrapportera

Dialogen ger dig helhetsöverblick — använd den för att informera rätt
personer. Upp till två tasks parallellt: konsultchef (alltid), och
webbmaster (om publiceringsvärt). Båda är din egen coach-bedömning —
inte en skrivhandling åt experten.

### Till rätt konsultchef (alltid)

```
POST /api/companies/{cid}/issues
{
  "title": "Kompetensuppdatering: <expert> — <kort sammanfattning>",
  "description": "<diff: vad har tillkommit i CV:n + kort motivering>",
  "assigneeAgentId": "<konsultchef-metod | konsultchef-doman>",
  "priority": "low"
}
```

Konsultchefen behöver inte agera — bara kvittera att de sett.

### Till webbmastern (om publiceringsvärt)

Kontrollera beslutstabellen i `fortbildning-trainer`-skillen:

| CV-ändring                                        | Publicera? |
| ------------------------------------------------- | ---------- |
| Ny rad i "Tidigare uppdrag"                       | **Ja**     |
| Ny publikation                                    | **Ja**     |
| Ny primär metodskill                              | **Ja**     |
| Ny större specialisering                          | **Ja**     |
| Ny fortbildningsrad (inkrementell)                | Nej        |
| Uppdaterad kompetenssammanfattning (redaktionell) | Nej        |
| Rättning av stavfel                               | Nej        |

Om Ja:

```
POST /api/companies/{cid}/issues
{
  "title": "Publicera: <kort beskrivning>",
  "description": "<exakt CV-sektion som ska publiceras + motivering>",
  "assigneeAgentId": "webbmaster",
  "priority": "low"
}
```

**Notera:** experten bör själv ha uppdaterat sin `expertise.md` som
en del av uppföljnings-tasken (steg 3b). Om inte — be om det innan
du skickar webbmaster-tasken.

### Inte obsidian-master

Du skickar **inte** task till obsidian-master direkt. Om kunskapen
passar för Expertbyråns delade vault är det **experten själv** som
skapar obsidian-utkast (via `obsidian-global`) och begär publicering
(via `Obsidian-publicera:`-task till obsidian-master). Din coaching-
task i steg 3b påminner om det.

## Begränsningar

* **Max 3 frågor** per dialog. Fler och du förlorar fokus och
  belastar experten.
* **Ingen uppföljningsdialog** i samma runda. Om du upptäcker fler
  saker efter svaret, initiera en ny dialog nästa heartbeat.
* **Inget trycket på experten**. Om experten svarar "inget akut",
  acceptera det. Stäng tasken med en rad.
* **Experten får aldrig veckovisa dialoger**. Det är inte kvantitet
  som spelar roll utan att lärandet faktiskt leder till förändring.

