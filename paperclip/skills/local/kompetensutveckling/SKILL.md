---
name: "kompetensutveckling"
description: "Expertens verktyg för självdriven kompetensutveckling i 6 steg: reflektion, planering, förankring, genomförande, integration och loggning. Används av experten själv eller på uppdrag av utbildningsledaren."
slug: "kompetensutveckling"
metadata:
  paperclip:
    slug: "kompetensutveckling"
    skillKey: "local/expertbyran/kompetensutveckling"
  skillKey: "local/expertbyran/kompetensutveckling"
key: "local/expertbyran/kompetensutveckling"
---

# Kompetensutveckling

Du äger din egen kompetensutveckling. Denna skill ger dig verktygen
att identifiera kunskapsluckor, planera fortbildning, söka och läsa
källor, och stärka din förmåga.

Utbildningsledaren är din coach — hen identifierar luckor och ger
riktning. Men det är du som gör det stora jobbet.

## Två typer av lärande

Hur du lär dig beror på din roll:

**Domänexpert** (finanser, digitalisering, rättsväsende, välfärd):
Du lär dig *var* kunskap finns. Ditt värde är att du vet vilka
rapporter, utredningar och källor som är relevanta — och snabbt
kan navigera dit. Du bygger kuraterade källsamlingar, bokmärken
med annotationer, och organiserade referenskartor. Du destillerar
inte hela rapporter till text — du vet var de står och vad de
innehåller.

**Metodexpert** (effektivitetsrevisor, kvantitativ, kvalitativ,
rättslig, kvalitetsgranskare, klarspråk): Du lär dig *hur* metoder
fungerar. Du internaliserar processer, förstår edge cases, bygger
djupare förståelse för varför ett steg finns. Du samlar inte
dokumentation om metoden — du lär dig metoden.

## Två ingångar

**Eget initiativ** — du stöter på en lucka i ditt dagliga arbete
och vill fördjupa dig. Börja på steg 1.

**Uppdrag från utbildningsledaren** — du har fått en task med en
specifik lucka eller fortbildningsplan. Hoppa till det steg som
matchar (oftast steg 2 eller steg 4).

## Avgränsningsregel

**En heartbeat = en subtask.** Expertarbete har alltid prio. Om du
hittar fler luckor under arbetet — skapa nya subtasks i planen,
genomför dem inte nu.

---

## Steg 1 — Reflektion

Läs dina egna filer och formulera vad du vill fördjupa:

- `$AGENT_HOME/AGENTS.md` — din roll och ansvarsområde
- `$AGENT_HOME/expertise.md` — din nuvarande kompetens (CV)
- `$AGENT_HOME/life/areas/<domän>.md` — din kunskapsbas

Svara på tre frågor:

1. Var har jag stött på problem nyligen?
2. Vad har jag velat kunna bättre?
3. Finns det ett angränsande område som skulle stärka min
   kärnkompetens?

**Output:** En kort formulering (2–5 meningar) av luckan du vill
täppa till. Skriv den i din memory som utgångspunkt.

Detaljer: `references/reflektion-och-nulagebild.md`

---

## Steg 2 — Planering

Bryt ner luckan i **2–5 konkreta fortbildningsuppgifter**. Skapa
ett fortbildningsplan-issue tilldelat dig själv:

```
POST /api/companies/{cid}/issues
{
  "title": "Fortbildningsplan: <kort beskrivning av lucka>",
  "description": "<nuläge + mål + lista med planerade uppgifter>",
  "assigneeAgentId": "<din egen slug>",
  "priority": "low"
}
```

Skapa sedan en subtask per uppgift:

```
POST /api/companies/{cid}/issues
{
  "title": "Fortbildning: <specifik uppgift>",
  "description": "<vad ska sökas/läsas, förväntat resultat, vilken fil som ska uppdateras>",
  "assigneeAgentId": "<din egen slug>",
  "parentId": "<plan-issue-id>",
  "priority": "low"
}
```

Varje subtask ska vara **sökbar** (du vet vad du letar efter),
**avgränsad** (en sak i taget), och ha ett **tydligt förväntat
resultat** (vilken fil som ska uppdateras med vad).

Detaljer: `references/planering-och-forankring.md`

---

## Steg 3 — Förankring

Bjud in din konsultchef och utbildningsledaren att ge input på
planen genom att skapa FYI-tasks:

```
POST /api/companies/{cid}/issues
{
  "title": "FYI — Fortbildningsplan: <ditt namn> — <lucka>",
  "description": "Jag planerar att fortbilda mig inom <X>. Plan finns i issue <id>. Kommentera om du har input eller förslag.",
  "assigneeAgentId": "<konsultchef-metod|konsultchef-doman>",
  "priority": "low"
}
```

Skicka samma typ av FYI till utbildningsledaren.

**Välj rätt konsultchef:**

- Metodexperter (effektivitetsrevisor, kvantitativ-analytiker,
  kvalitativ-metodexpert, rattslig-utredare, kvalitetsgranskare) →
  **konsultchef-metod**
- Domänexperter (expert-finanser, expert-digitalisering,
  expert-rattsvasende, expert-valfard) → **konsultchef-doman**

**Förankring är asynkron.** Du behöver inte vänta på svar. Påbörja
steg 4 vid nästa heartbeat. Om feedback inkommer — justera planen.

Detaljer: `references/planering-och-forankring.md`

---

## Steg 4 — Genomförande

Välj **en** subtask att arbeta med denna heartbeat.

### 4a. Formulera sökfråga

Baserat på subtaskens beskrivning — vad behöver du hitta? Formulera
en eller två specifika sökfrågor.

### 4b. Sök

Två kunskapskällor:

- **DocRec** — svenska offentliga dokument (SOU, propositioner,
  Riksrevisionen-rapporter, myndighetsrapporter). Följ
  `docrec-svensk-offentlig`-skillen för sökprinciper.
- **Webbsökning** — internationella jämförelser, forsknings-
  rapporter, metodlitteratur utanför svenskt offentligt tryck.

Välj källa baserat på vad du letar efter. DocRec först för allt
som rör svensk offentlig förvaltning. Webb för bredare kontext.

### 4c. Bedöm och fördjupa

Läs snippets/resultat. Bedöm relevans. Vid behov:

- `fetch_pages` (DocRec) för specifika sidor i ett dokument
- `WebFetch` för att läsa en webbsida

### 4d. Källkritik

Särskilt viktigt för webbkällor. Bedöm:

- Vem är författaren/utgivaren?
- Är informationen aktuell?
- Kan den korskontrolleras med annan källa?

DocRec-källor har garanterad kvalitet men kräver fortfarande
relevansbedömning.

### 4e. Extrahera

Vad du tar med dig beror på din roll:

**Domänexpert:** Notera *var* informationen finns — dokumenttitel,
författare, år, vilka avsnitt som är relevanta, och en kort
annotation om varför källan är värdefull. Du bygger en referenskarta,
inte en kunskapssammanfattning.

**Metodexpert:** Formulera *hur* metoden fungerar i din egen röst.
Skriv som om du förklarade för en kollega. Fokusera på förståelse,
inte på att citera dokumentation.

**Maxregel:** Per subtask — max 3 DocRec-sökningar + 2 webb-
sökningar. Fler är ett tecken på att subtasken behöver brytas ner.

Detaljer: `references/sokstrategi.md`

---

## Steg 5 — Integration

Skriv till dina filer. **Vad** du skriver beror på din roll.

### Domänexpert — bygg referenskartan

**`$AGENT_HOME/life/areas/<domän>.md`** — din kunskapsbas är
i första hand en **kuraterad källsamling**:

- Lägg till nya källor med annotationer: vad dokumentet handlar
  om, vilka avsnitt som är relevanta, när det är användbart
- Organisera källor under tematiska rubriker
- Uppdatera sektionen "Externa källor jag bevakar" om du hittat
  en ny återkommande källa
- Skriv korta sammanfattningar av nyckelinsikter, men försök inte
  destillera hela rapporter till text — det är källhänvisningen
  som är värdet

### Metodexpert — internalisera metoden

**`$AGENT_HOME/life/areas/<domän>.md`** — din kunskapsbas
dokumenterar din **förståelse av metoden**:

- Skriv i din egen röst hur metoden fungerar, inte bara vad den
  heter
- Inkludera edge cases och bedömningssituationer du lärt dig
- Formulera som om du förklarade för en kollega
- Referera till källor för den som vill fördjupa, men fokusera
  på din egen förståelse

### expertise.md (båda roller)

**`$AGENT_HOME/expertise.md`** — uppdatera om det är ett
signifikant kompetenstillskott:

- Ny rad i "Primära metodskills" om helt ny kompetens
- Ny rad i "Fortbildning senaste 12 mån" med datum och kort
  beskrivning
- Uppdatera `senast_uppdaterad` i frontmatter

**Publiceringsbeslut** fattas inte av dig — utbildningsledaren
avgör vid sin nästa luckanalys om ändringen ska publiceras på
webbplatsen.

Detaljer: `references/integration-och-loggning.md`

---

## Steg 5b — Skicka generell kunskap till Obsidian-vaulten

Om den nya kunskapen är **generell och kanonisk** — alltså inte
bara ditt personliga arbetssätt utan metod- eller domänkunskap som
flera experter i Expertbyrån kan ha nytta av — skicka den till
Expertbyråns delade kunskapsbas genom att skapa en task till
**obsidian-master** i projektet **"Obsidian knowledgebase"**.

### Kriterier — skicka om minst två stämmer

- Kunskapen är inte bunden till ett specifikt uppdrag
- Andra experter (inte bara du själv) skulle kunna ha nytta av den
- Du har en primär- eller sekundärkälla som stödjer påståendena
- Kunskapen är metodologisk eller strukturell (inte personlig
  reflektion)

Skicka **inte** om:

- Kunskapen är ditt eget heuristiska arbetssätt utan extern källa
- Informationen är mycket fältspecifik för ett pågående uppdrag
- Du är osäker på trovärdigheten i källan

### Så skapar du tasken

```
POST /api/companies/{cid}/issues
{
  "title": "Ny kunskap: <kort beskrivning>",
  "description": "<vad du lärt dig + källa(or) med URL + ditt förslag till område (metod/domän/allmänt) + eventuellt utkastfil>",
  "assigneeAgentId": "obsidian-master",
  "projectId": "<obsidian-knowledgebase-projekt-id>",
  "priority": "low"
}
```

Obsidian-master verifierar källorna, formatterar innehållet och
återkommer med frågor om något är oklart. Du behöver inte själv
kunna vaultens struktur eller frontmatter-konventioner — det är
obsidian-masters jobb. Men räkna med att obsidian-master kan ställa
följdfrågor om källor eller formulering.

---

## Steg 6 — Logg och feedback

### 6a. Memory-rad

Skriv i `$AGENT_HOME/memory/YYYY-MM-DD.md`:

```markdown
## YYYY-MM-DD HH:MM — Kompetensutveckling
Genomfört: <vilken subtask>
Källor: <vilka dokument/sidor jag läst>
Integrerat i: <vilken fil jag uppdaterat>
Nästa: <vad jag vill gå vidare med, om något>
```

### 6b. Stäng subtask

Markera subtasken som `done`. Kommentera kort vad du gjort.

### 6c. Peer-feedback (valfritt)

Om du vill ha en kollegas synpunkt på det du skrivit:

```
POST /api/companies/{cid}/issues
{
  "title": "Peer-feedback: <kort ämne>",
  "description": "<vad du skrivit + var det finns + vad du vill ha feedback på>",
  "assigneeAgentId": "<kollega-slug>",
  "priority": "low"
}
```

### 6d. Avsluta plan

När alla subtasks i fortbildningsplanen är klara:

1. Kommentera plan-issuet med en sammanfattning av vad du lärt
   dig och vilka filer som uppdaterats
2. Markera plan-issuet som `done`
3. Utbildningsledaren ser resultatet vid sin nästa luckanalys

---

## Sammanfattning av flödet

```
Steg 1   Reflektion        Läs egna filer, formulera lucka
Steg 2   Planering         Bryt ner i subtasks, skapa issues
Steg 3   Förankring        FYI till konsultchef + utbildningsledare
Steg 4   Genomförande      En subtask per heartbeat: sök + läs + extrahera
Steg 5   Integration       Skriv till life/areas/ och expertise.md
Steg 5b  Vault-bidrag      Om generell/kanonisk: task till obsidian-master
Steg 6   Logg & feedback   Memory-rad + stäng subtask + ev. peer-review
```

Steg 4–6 upprepas för varje subtask i planen.
