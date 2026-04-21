## Agentisk AI: när systemen slutar svara och börjar agera

I ett decennium har AI primärt fungerat som ett sofistikerat uppslagsverktyg — användare ställer frågor och får svar. Under det senaste året har paradigmet dock förskjutits. AI-system agerar nu självständigt: de söker information, fattar mellanliggande beslut, anropar externa tjänster och delegerar deluppgifter till underliggande system — allt utan att varje steg godkänns av en människa. Det som kallas *agentisk AI* är inte en teknisk detalj. Det är en grundläggande förändring av hur digitalt arbete organiseras.

Agentiska system används redan i offentlig förvaltning. Den centrala frågan är om styrning, ansvarsutkrävning och granskningskapacitet utvecklas i samma takt som adoptionen.

## Vad som skiljer agentiska system från tidigare automation

Traditionell processautomation — RPA, regelbaserade system, enkla beslutsstöd — är förutsägbar och avgränsad. Varje steg är definierat i förväg, och avvikelser stoppar processen.

Agentiska AI-system fungerar annorlunda längs tre dimensioner:

**Autonom planering.** Systemet tar ett mål, bryter ner det i deluppgifter och väljer verktyg och ordning självständigt. En handläggaragent som får i uppdrag att "utreda ärendet" kan välja att söka i register, kontakta externa API:er och sammanställa ett beslutsutkast — utan att varje steg är hårdkodat.

**Verktygsanvändning.** Moderna agentrammverk som MCP (Model Context Protocol) ger AI-agenter standardiserade gränssnitt mot externa system: databaser, kalenderverktyg, ärendehantering, epost. Det innebär att en agent kan initiera faktiska åtgärder i verkliga system, inte bara svara i ett textfönster.

**Flerlagers-delegering.** En överordnad agent kan skapa och styra underagenter. Det uppstår kedjor av delegation där det inte finns ett enda beslutssteg att granska — utan ett distribuerat nät av delbeslut som tillsammans producerar ett utfall.

## Tre områden där utrullningen redan sker

### Ärendehantering och handläggningsstöd

Flera länders förvaltningar testar agentiska system för att avlasta handläggare: försortering av ansökningar, automatisk kompletteringsbegäran, utkast till beslutsmotiveringar. Systemen agerar på delegation men kan, om de inte begränsas korrekt, initiera åtgärder med rättsverkan.

### Offentlig upphandling och avtalsgranskning

Agenter som analyserar anbudsunderlag, kontrollerar mot lagkrav och flaggar avvikelser har börjat introduceras i stödfunktioner. Risken ligger inte primärt i felaktiga beslut — utan i att ansvarsfrågan blir otydlig när "systemet flaggade inget".

### Intern IT-drift och incidenthantering

Agentiska system för automatiserad incidentrespons — som identifierar anomalier, isolerar system och initierar återställningsåtgärder — är nu standard i avancerade driftsmiljöer. Snabbheten är en fördel; spårbarheten är en utmaning.

## Varför befintlig IT-styrning inte räcker

Traditionell IT-governance är designad för system med definierbara tillstånd och förutsägbara flöden. Agentiska system utmanar fyra grundantaganden:

1. **Beslutsspårbarhet.** I ett traditionellt system finns en logg: vem godkände vad, när. I en agentkedja är det oklart var ansvaret för ett sammansatt utfall egentligen ligger.

2. **Åtkomststyrning.** Principer som *least privilege* — minsta möjliga behörighet — är svåra att tillämpa när en agent dynamiskt väljer vilka verktyg den behöver för att lösa en uppgift.

3. **Testbarhet.** Klassiska acceptanstest utgår från kända input-output-relationer. Agentiska system är icke-deterministiska: samma uppdrag kan leda till olika handlingskedjor beroende på kontext.

4. **Ansvarsutkrävning.** Juridiska och förvaltningsrättsliga system bygger på att ett beslut kan härledas till en identifierbar aktör. Kedjad delegation suddar ut den gränsen.

## Principer för ansvarsfull utrullning av agentisk AI

Att stoppa tekniken är varken möjligt eller önskvärt. Men att rulla ut utan styrningsramverk medför risker — inte minst i offentlig sektor där legitimitet och rättssäkerhet är kritiska egenskaper.

Erfarenheter från de förvaltningar som kommit längst pekar på fyra principer:

**Mänsklig kontrollpunkt vid rättsverkande steg.** Agenter som bereder, men inte fattar, beslut med rättsverkan. Delegering av utförande är möjlig; delegering av den slutliga rättshandlingen bör inte ske utan explicit godkännande.

**Spårbarhet som designkrav.** Systemarkitekturer behöver logga agentkedjor på ett sätt som möjliggör efterhandsgranskning — inte bara händelseloggar, utan kausalkedjor: vilket delmål ledde till vilket verktygsanrop som ledde till vilket utfall.

**Sandboxade verktygsbehörigheter.** Varje agent bör ha explicit definierade verktygsmandat — vad den får och inte får initiera — snarare än generella behörigheter som löses ut dynamiskt.

**Periodisk konsekvensanalys.** Agentiska system som är i drift förändrar sig indirekt när de underliggande modellerna uppdateras. Regelbunden granskning av om systemets faktiska beteende fortfarande överensstämmer med dess godkända syfte behöver bli en del av förvaltningsrutinen.

## Kompetens och metod behöver växa parallellt med adoptionen

Teknikutvecklingen i agentisk AI är snabb — och framstegen accelererar. Allt fler företag och myndigheter experimenterar med autonoma agentflöden för att hantera komplexa arbetsuppgifter. Det är en rationell respons på ett genuint tryck: kompetensförsörjningsproblem, ärendebelastning, krav på snabbare handläggning.

Men förmågan att styra och granska dessa system behöver växa i samma takt som adoptionen. Det innebär inte bara teknisk kompetens — det kräver att jurister, revisorer och förvaltningsutvecklare lär sig ställa rätt frågor om system vars signatur är att de agerar utan att bli tillfrågade.

Den framväxande granskningsfrågan handlar inte längre om "kördes programmet korrekt?" utan om "var beslutskedjan i linje med uppdraget — och var ligger ansvaret om den inte var det?"