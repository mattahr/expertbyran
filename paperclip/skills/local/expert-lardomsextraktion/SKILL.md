---
name: "expert-lardomsextraktion"
description: "Experternas minimala bidrag till Expertbyråns självförbättringsloop: 1–3 rader i memory varje heartbeat, och korta svar på utbildningsledarens fortbildningsdialoger. Inget mer."
slug: "expert-lardomsextraktion"
metadata:
  paperclip:
    slug: "expert-lardomsextraktion"
    skillKey: "local/expertbyran/expert-lardomsextraktion"
  skillKey: "local/expertbyran/expert-lardomsextraktion"
key: "local/expertbyran/expert-lardomsextraktion"
---

# Experternas minimala lärande-bidrag

Denna skill är avsiktligt kort. Din tid ska gå till expertarbete —
inte till metadokumentation. Utbildningsledaren sköter det tunga
lärandet åt dig.

## Tre regler. Det är allt.

### Regel A — Dagligt memory (1–3 rader)

I slutet av varje heartbeat, skriv 1–3 rader i
`$AGENT_HOME/memory/YYYY-MM-DD.md`. Filen skapas om den inte finns.

**Tre frågor du svarar på i någon form:**

1. Vad försökte jag göra?
2. Vad gick bra / vad fastnade jag på?
3. Vad hade jag velat kunna bättre?

**Exempel på en bra memory-rad:**

```markdown
## 2026-04-11 14:32
Försökte skriva metodkapitel om triangulering i LSS-uppdraget.
FK-register och kommunintervjuer pekade åt olika håll — svårt att
hedga utan att bli för mjuk. Önskar jag hade en tydligare process
för divergens-hantering.
```

**Vad du INTE ska göra:**

- Skriva långa rapporter till dig själv
- Sammanfatta hela heartbeaten
- Analysera lärandet
- Skriva skill-förslag
- Peer-reviewa andras arbete

Utbildningsledaren läser dina memory-rader och processerar dem åt dig.

### Regel B — Svara på fortbildningsdialog (3–10 rader)

Om utbildningsledaren skickar dig en task vars titel börjar med
`Fortbildningsförslag:` eller `Retrospektiv:`, svara kort och
fokuserat i en issue comment.

**Riktmärke: 3–10 rader totalt.**

Utbildningsledaren kommer att ställa max 3 fokuserade frågor. Du
svarar på dem direkt, utan att utvidga scope.

**Om du inte har något att säga:**

Svara kort. Acceptabla svar:

```markdown
Inget akut just nu, tack.
```

```markdown
Inget att tillägga om fråga 2. För fråga 1: jag har sett SOU 2023:53
men inte hunnit läsa.
```

Det är OK att vara tom. Det är inte OK att utvidga dialogen till en
allmän diskussion.

**Exempel på ett bra svar:**

```markdown
1. SOU 2023:53 om LSS har jag sett men inte hunnit läsa. Även
   Myndigheten för vård- och omsorgsanalys 2024:8.
2. När FK-data säger en sak och kommunerna en annan hedgar jag
   vanligen nedåt men det känns godtyckligt. En tydlig regel skulle
   hjälpa.
3. Gärna ett avslutningsuppdrag där jag får kombinera båda datakällor
   i samma designmatris.
```

## Vad som händer efter du har svarat

Utbildningsledaren:

- Söker externa källor via DocRec MCP
- Sammanfattar det relevanta i din `life/areas/<domän>.md`
- Uppdaterar din `expertise.md` (CV-format)
- Stänger dialogtasken med en kort sammanfattning
- Rapporterar parallellt till din konsultchef (FYI) och webbmastern
  (om publiceringsvärt)

Du märker av förändringen nästa gång du öppnar din `life/areas/`-fil
eller `expertise.md` — **utan att själv ha spenderat en enda token
på meta-arbetet**.

## Detta är inte lathet

Designen är avsiktlig. Dina expertområden är djupa och svåra — om
du dessutom måste göra skill-författande, peer-review och
veckosynteser blir det inget expertarbete kvar. Genom att du
fokuserar på att leverera blir hela Expertbyrån bättre.

### Regel C — Aktiv kompetensutveckling

När du vill fördjupa, bredda eller utöka din kunskap — använd
`kompetensutveckling`-skillen. Den ger dig verktyg att:

- Reflektera över din nuvarande kunskapsbas
- Planera fortbildning i samråd med konsultchef och utbildningsledare
- Söka och läsa källor via DocRec och webbsökning
- Skriva ny kunskap till dina egna filer

Du kan använda den på eget initiativ (när du stöter på en lucka i
ditt arbete) eller på uppdrag av utbildningsledaren (via task).

**Utbildningsledaren är fortfarande din coach** — hen identifierar
luckor och ger riktning. Men det är du som gör det stora jobbet.

## Om du har en stark åsikt om en skill

Om du tycker att en skill borde ändras, skriv det i din memory-rad.
Utbildningsledaren ser det och kan välja att initiera en
skill-evolution. Men **initiera inte själv** skill-ändringar — det
är utbildningsledarens jobb.
