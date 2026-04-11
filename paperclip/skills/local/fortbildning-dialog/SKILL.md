---
name: "fortbildning-dialog"
description: "Utbildningsledarens mall för dialogbaserad fortbildning och uppdragsretrospektiv. Tre steg: initiera fokuserad fråga → bearbeta svar → stäng dialog. Fokuserade frågor skyddar expertens kontextfönster."
slug: "fortbildning-dialog"
metadata:
  paperclip:
    slug: "fortbildning-dialog"
    skillKey: "local/expertbyran/fortbildning-dialog"
  skillKey: "local/expertbyran/fortbildning-dialog"
key: "local/expertbyran/fortbildning-dialog"
---

# Fortbildningsdialog

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

- Återkommande frustration på samma teknik eller metod
- Konkret fråga som experten ställer sig själv ("önskar jag hade...")
- Ny observation som experten verkar nyfiken på
- Tekniskt område där experten nämner att hen kommer till korta

### Retrospektivsignaler

- Expertens memory-rad nämner att ett uppdrag är klart
- Ett subtask med `assigneeAgentId: <expert>` har statusen `done`
- Klientkoordinatorn har skapat en puls-task efter en kundleverans

## Steg 1 — Initiera dialogen

Skapa en task till experten:

```
POST /api/companies/{cid}/issues
{
  "title": "Fortbildningsförslag: <kort ämne>",
  "description": "<1–2 meningars kontext + max 3 fokuserade frågor>",
  "assigneeAgentId": "<expert-slug>",
  "priority": "low"
}
```

### Fortbildningsmall (3 frågor)

```markdown
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

När du svarat utför jag det tunga efterarbetet (DocRec-sök, skrivning
till dina filer) och rapporterar parallellt till din konsultchef och
eventuellt webbmastern. Du behöver inte göra något mer.
```

### Retrospektivmall (3 frågor)

```markdown
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

Jag lägger in svaret i din `life/areas/<domän>.md` + uppdaterar din
CV-tabell "Tidigare uppdrag vid Expertbyrån" + rapporterar parallellt.
```

## Steg 2 — Vänta på svar

Experten svarar vid sin nästa heartbeat. Du fångar upp svaret i
nästa egen heartbeat (steg 2 i din HEARTBEAT).

## Steg 3 — Bearbeta svar

När experten svarat:

### 3a. Läs svaret

Parsa svaret. Identifiera:

- Vilka konkreta källor experten nämnt
- Vilka metodfrågor som behöver svar
- Vilka praktiska behov experten har

### 3b. Sök externa källor

Använd `docrec-svensk-offentlig`-skillen för att hitta relevanta:

- Riksrevisionen-granskningar inom området
- SOU och propositioner
- ESV, Statskontoret, Myndigheten för vård- och omsorgsanalys
  (beroende på domän)

Läs inte hela dokument — läs snippets och hämta specifika sidor
via `fetch_pages` vid behov. **Du är den som läser 40-sidiga
rapporter, inte experten.**

### 3c. Skriv till expertens filer

Uppdatera två filer:

**`agents/<expert>/life/areas/<domän>.md`**:

- Lägg till en ny sektion eller utvidga en befintlig
- Inkludera fullständiga källhänvisningar så experten kan verifiera
- Skriv i tonläge som experten själv skulle ha skrivit

**`agents/<expert>/expertise.md`**:

- Uppdatera `senast_uppdaterad`-fält i frontmatter
- Eventuellt ny rad i "Primära metodskills" (om en helt ny
  kompetens tillkommit)
- Ny rad i "Fortbildning senaste 12 mån" med datum och kort
  beskrivning
- Om retrospektiv: ny rad i "Tidigare uppdrag vid Expertbyrån"

### 3d. Stäng dialogtasken

Kommentera dialogtasken med en kort sammanfattning:

```markdown
Tack. Jag har:

- Läst <källor>
- Lagt till <avsnitt> i din life/areas/<domän>.md
- Uppdaterat din expertise.md med <vilka sektioner>

Nästa gång du öppnar filerna hittar du det nya materialet. Inget mer
från din sida — jag rapporterar vidare.
```

Markera tasken `done`.

## Steg 4 — Parallellrapportera

Efter dialogen, skapa **två tasks** i parallell:

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

| CV-ändring                                  | Publicera? |
|---------------------------------------------|------------|
| Ny rad i "Tidigare uppdrag"                 | **Ja**     |
| Ny publikation                              | **Ja**     |
| Ny primär metodskill                        | **Ja**     |
| Ny större specialisering                    | **Ja**     |
| Ny fortbildningsrad (inkrementell)          | Nej        |
| Uppdaterad kompetenssammanfattning (redaktionell) | Nej  |
| Rättning av stavfel                         | Nej        |

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

## Begränsningar

- **Max 3 frågor** per dialog. Fler och du förlorar fokus och
  belastar experten.
- **Ingen uppföljningsdialog** i samma runda. Om du upptäcker fler
  saker efter svaret, initiera en ny dialog nästa heartbeat.
- **Inget trycket på experten**. Om experten svarar "inget akut",
  acceptera det. Stäng tasken med en rad.
- **Experten får aldrig veckovisa dialoger**. Det är inte kvantitet
  som spelar roll utan att lärandet faktiskt leder till förändring.
