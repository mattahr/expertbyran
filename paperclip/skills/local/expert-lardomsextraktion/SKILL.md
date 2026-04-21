---
name: "expert-lardomsextraktion"
description: "Experternas kontinuerliga lärande i Expertbyrån: dagligt memory, svar på fortbildningsdialog, och länk till självdriven kompetensutveckling. Du äger din egen kunskap — utbildningsledaren är coach, inte skrivare."
slug: "expert-lardomsextraktion"
metadata:
  paperclip:
    slug: "expert-lardomsextraktion"
    skillKey: "local/expertbyran/expert-lardomsextraktion"
  skillKey: "local/expertbyran/expert-lardomsextraktion"
key: "local/expertbyran/expert-lardomsextraktion"
---

# Experternas kontinuerliga lärande

Ditt lärande är ditt eget ansvar. Utbildningsledaren är din **coach** —
hen ser luckor i din memory, ställer fokuserade frågor och triggar
fortbildning när det är läge. Men sökandet, läsandet, skrivandet och
integrationen gör du själv.

Denna skill täcker de tre återkommande beteenden som binder ihop
lärandet: dagligt memory, svar på fortbildningsdialog, och aktiv
kompetensutveckling.

## Regel A — Dagligt memory (1–3 rader)

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

**Vad du INTE ska göra i memory:**

- Skriva långa rapporter till dig själv
- Sammanfatta hela heartbeaten
- Analysera lärandet i detalj (det sker i dialog eller
  `kompetensutveckling`)
- Peer-reviewa andras arbete

Utbildningsledaren läser dina memory-rader och initierar dialog när
hen ser mönster som är värda att följa upp.

## Regel B — Svara på fortbildningsdialog (3–10 rader + följdarbete)

Om utbildningsledaren skickar dig en task vars titel börjar med
`Utvecklingssamtal:`, `Fortbildningsförslag:` eller `Retrospektiv:`,
svara kort och fokuserat i en issue comment.

**Riktmärke: 3–10 rader totalt.**

Utbildningsledaren ställer max 3 fokuserade frågor. Svara direkt,
utan att utvidga scope.

**Om du inte har något att säga:**

Svara kort. Acceptabla svar:

```markdown
Inget akut just nu, tack.
```

```markdown
Inget att tillägga om fråga 2. För fråga 1: jag har sett SOU 2023:53
men inte hunnit läsa.
```

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

### Vad händer efter du svarat

Utbildningsledaren läser ditt svar och gör **en av två saker**:

**(a)** Stänger dialogen om den var uteslutande retrospektiv och inte
kräver fortsatt arbete.

**(b)** Skickar en uppföljnings-task till dig: *"använd
`kompetensutveckling`-skillen för att fördjupa dig i X. Uppdatera
din `expertise.md`, din `life/areas/<domän>.md`, och skapa vid behov
ett obsidian-utkast via `obsidian-global`."*

**Utbildningsledaren skriver inte åt dig.** Du söker, läser och
skriver själv. Det är en del av hur du lär dig.

## Regel C — Aktiv kompetensutveckling

När du vill fördjupa, bredda eller utöka din kunskap utan att vänta
på dialog — använd `kompetensutveckling`-skillen. Den ger dig
verktyg att:

- Reflektera över din nuvarande kunskapsbas
- Planera fortbildning i samråd med konsultchef och utbildningsledare
- Söka och läsa källor (DocRec, webb)
- Skriva till dina egna filer (`expertise.md`, `life/areas/`)
- Skapa obsidian-utkast om kunskapen är generell/kanonisk (se
  `obsidian-global`)
- Be obsidian-master om feedback eller publicering av utkastet

Du kan använda den på eget initiativ (när du stöter på en lucka i
ditt arbete) eller på uppdrag av utbildningsledaren (via task).

## Vad utbildningsledaren ansvarar för (för din kännedom)

Utbildningsledaren är coach och kvalitetsfilter, inte skrivare:

- Läser dina memory-rader och initierar dialog vid behov
- Ställer fokuserade frågor (max 3) för att hjälpa dig identifiera
  riktning
- Följer upp att fortbildning faktiskt sker
- Bedömer om uppdateringar i din `expertise.md` är värda att
  publicera på webbplatsen (separat task till webbmastern)
- Upptäcker mönster över flera experter som kan leda till
  skill-evolution

Utbildningsledaren skriver **inte**:

- I din `expertise.md`
- I din `life/areas/<domän>.md`
- Utkast åt dig i Obsidian (förutom under dialog, där hen får skissa
  i din mapp — men det räknas fortfarande som *ditt* utkast)

## Om du har en stark åsikt om en skill

Om du tycker att en skill borde ändras, skriv det i din memory-rad.
Utbildningsledaren ser det och kan välja att initiera en
skill-evolution. Men **initiera inte själv** skill-ändringar — det
är utbildningsledarens jobb.
