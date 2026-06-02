# Tre tekniska tak och MCP-lagrets roll — TRL-mognaden för svensk agentisk förvaltning 2026–2034

---

*Denna text gör inte normativa anspråk på vad Sverige* borde *göra. Syftet är att kartlägga var teknisk mognad, juridik och fysiska resursbegränsningar konvergerar respektive divergerar — så att beslut kan fattas med öppna ögon.*

---

## 1. Inledning — varför teknikvalen 2026–2030 är arkitektoniska

Sveriges myndigheter står inför en infrastrukturell vägval-period. Mellan 2026 och 2030 görs upphandlingar, plattformsval och proof-of-concept som kommer att forma 2030-talets statsförvaltning. Tre samtidiga drivkrafter pressar fram beslut:

- demografisk press (försörjningskvot toppar 2030–2035)
- politisk ambition om "AI i offentlig sektor" (regeringens AI-handlingsplan, Digg-uppdrag)
- mognande agentisk teknik (LLM + verktygsanrop + autonoma flöden)

## 2. Tre tak — TRL-mognad mot tre frågor

> **Avsnitt 2 i korthet (för läsare som inte vill djupdyka i alla TRL-tabeller)**
> Tre frågor undersöks: (Q1) när kan agent-pipelines hantera majoriteten av rutinärenden, (Q2) var ligger den hårdaste tekniska bindningen, (Q3) är revisionsbar agentinfrastruktur möjlig "by construction". För varje fråga presenteras 2–3 konkurrerande tolkningar; ingen tolkning utpekas som "rätt". Tidsfönstret 2026–2034 rymmer både tidiga och sena mognadsscenarion beroende på definition och vägval.

### Q1: När kan >50 % av rutinärenden hanteras via agent-pipelines?

| Komponent | TRL idag | Trolig mognad |
|---|---|---|
| MCP / agent-orkestrering | 3–4 | TRL 7 ca 2028–2029 |
| Förvaltningsspecifik agent-stack | 4–5 | TRL 7 ca 2030–2032 |
| Juridisk infrastruktur (provenance-standard) | n/a | beroende av EU-harmonisering 2027–2028 |
| Datakvalitet (myndighetsdata) | varierar | 3–5 år för uppgradering |

**Tre sammanhängande tolkningar:**
- *Sen tolkning (2032–2034):* mognadsfönstret landar 0–2 år efter demografisk topp. Implementationer går i produktion *innan* juridisk/revisional infrastruktur är på plats.
- *Tidig tolkning (2028–2030):* om man accepterar bredare definition av "agent-pipeline" (RPA + LLM-augmentering, inte fullt autonoma kedjor), nås tröskeln tidigare. Försäkringskassan och Skatteverket har redan kommit långt med RPA + regelbaserad automation.
- *Rörlig-tröskel-tolkning:* "rutinärende" är inte fix kategori — andelen rutinärenden minskar när komplexitet automatiseras bort, vilket gör tröskeln rörlig.

### Q2: Var ligger den hårdaste lock-in-vektorn?

Fyra kandidatlager rangordnade från hårdast till mjukast lock-in:

1. **MCP-tool-graf och prompt/agent-templates** — verktygssemantiken där agenter förväntar sig att MCP-servrar svarar på vissa sätt. MCP-specifikationen, lanserad av Anthropic i november 2024, nådde enligt offentligt rapporterade siffror omkring 97 miljoner månatliga SDK-nedladdningar i mars 2026, med en publik registerexpansion från cirka 1 200 till över 9 000 servrar under samma period. Integrationsberoenden som inte alltid syns i upphandlings-KPI:er.
2. **Inferens-platsen + jurisdiktion** — Cloud Act / Schrems II. Adresserbar via EU sovereign cloud.
3. **Foundation-modell-lagret** — OpenEuroLLM, GPT-SW3 och Mistral närmar sig frontier-modeller på offentliga svenska bedömningstest (t.ex. Scandeval) utan att exakt paritet är etablerad; gapet diskuteras som relativt smalt och beroende av uppgiftstyp.
4. **GPU-hårdvaran** — Nvidia dominerar men AMD MI300/355, Trainium, Inferentia ger fungibel kapacitet på 5 års sikt.

**Tre sammanhängande tolkningar:**
- *Verktygslager-tolkning:* en betydande del av integrationsberoendena ackumuleras i lager 1 medan debatten fokuseras på lager 2–3. Reverseringskostnaden i lager 1 kan vara hög när semantiken väl spridits.
- *Modellsuveränitets-tolkning:* modellsuveränitet är inte bara symbolisk — den ger forskningsmässig och industriell kapacitet (kompetens, leverantörsekonomi). Prioritering av lager 3 kan motiveras även om reverseringskostnaden där är lägre.
- *Standardiseringstolkning:* MCP är ett öppet protokoll och kan i princip implementeras suveränt. Bindningen är till semantik och designmönster, inte till leverantör per se. Detta kan adresseras med standardiseringsarbete.

### Q3: Är revisionsbar agentinfrastruktur "by construction" möjlig?

Komponenterna finns på TRL 3–6:

| Komponent | TRL | Funktion |
|---|---|---|
| ZKP-attesterad inferens | 3 | Verifierbar inferens utan att avslöja modell/data |
| TEE / confidential VM med remote attestation | 5–6 | Bevisad körmiljö |
| C2PA cryptographic provenance | 4–5 | Output-attestering |
| Append-only Merkle-log för MCP-call-graph | 5 | Revisionsbar kedja |
| Federated learning + attestable audits | 4 | Distribuerad granskning |

**Tre sammanhängande tolkningar:**
- *Konstruktiv tolkning:* en integrerad TRL 4-stack (TEE + Sigstore + Merkle + ZKP + C2PA) löser teknisk auditbarhet. Standardiseringsarbete 2027–2029 är möjligt.
- *Begränsande tolkning:* tekniken löser *vad* systemet gjorde, inte *varför* en LLM valde en viss kedja. Förvaltningslagens motiveringskrav (32 §) reformuleras de facto till "vilken policy-konfiguration gällde" — vilket är en juridisk omdefinition som behöver demokratisk legitimering, inte bara teknisk.
- *Differentieringstolkning:* "by construction"-ambitionen kan vara överdimensionerad för låg-risk-ärenden. För högrisk-bedömningar (välfärd, migration) behövs det; för bokningsbekräftelser räcker svagare loggning. Differentierad arkitektur är realistiskt.

## 3. MCP-lagret — ett mindre diskuterat arkitekturval

Operativ observation snarare än normativ tes: när Sverige bygger ut "suverän AI" via OpenEuroLLM och AI-fabriker fokuseras lager 2 (DC) och lager 3 (modell). *Ett suveränt MCP-tool-ekosystem* — alltså svenska myndighetsspecifika MCP-servrar med definierad semantik, idempotens, rollback — förekommer i mindre omfattning i den offentliga debatten och i policydokument 2025–2026.

**Vad detta kan betyda — flera tolkningar:**
- Implicit antagande att tool-lagret är "bara plumbing" och inte arkitektoniskt
- Marknadsmognad: MCP är så nytt (2024–2025) att policyramverk inte hunnit ikapp
- Medveten prioritering: man bygger lager 3 först eftersom det är mer politiskt synligt och därmed lättare att försvara budget för

Ingen av dessa är fel — men summan blir att 2026–2030 års beslut formar 2030-talets agent-arkitektur utan att MCP-lagret diskuteras explicit.

## 4. Trippelbindningen — revisionsbarhet, suveränitet, energi

Tre samtidiga begränsningar som agentisk förvaltning måste navigera:

- **Revisionsbarhet** — förvaltningslag, AI Act art. 22 GDPR, arkivlag 5 §
- **Suveränitet** — Schrems II, Cloud Act, EU sovereign cloud
- **Energi** — IEA:s *Energy and AI*-rapport (2025) prognosticerar att global datacenter-elförbrukning ungefär fördubblas till omkring 945 TWh 2030 (cirka 3 % av global elförbrukning) och stiger mot 1 200 TWh 2035 i basscenariot. Den siffran ska sedan vägas mot svensk elektrifieringsambition (industri, transport, värme) och svensk elnätskapacitet, där Energimyndigheten och Svenska kraftnät publicerar nationella scenarier som ankrar svensk efterfrågesida

**Tre konkurrerande prognoser om vilken som "ger vika först":**

*Prognos A (kommersiell-press-tolkning):* suveränitet ger vika först (kommersiella krafter), energi sist (samhällsbärande), revisionsbarhet däremellan.

*Prognos B (revisions-eftersläpningstolkning):* revisionsbarhet ger vika först (mindre synlig, rationaliserbar per use case, revisionscykler ligger 2–4 år efter teknikutveckling), suveränitet i andra hand (politiskt försvarbart), energi blir den hårda väggen (fysik, inte policy).

*Prognos C (chock-villkorad tolkning):* ordningen är inte determinerad av tekniken. Externa chocker — energikris, EU-domslut (Schrems III), större AI-incident med politisk eftermäle, makroekonomiskt omslag — kan göra A eller B obsoleta. Prognoserna är då villkorade på scenariobetingelser snarare än trendprognoser, och vilken bindning som ger vika först bestäms av vilken chock som inträffar.

Alla tre prognoser är förenliga med TRL-bilden ovan. Vilken som realiseras beror på politiska val, EU-standardiseringstakt, elnätskapacitet och oförutsedda händelser — inte på tekniken ensam.

## 5. Kapaciteter som påverkar handlingsutrymmet 2030-talet

Utan att rekommendera en specifik väg: följande kapaciteter återkommer i policyförslag, EU-dokument och forskningsrapporter som förutsättningar för att 2030-talets val ska kunna vara reella val snarare än tvång:

- **Standardiseringsarbete kring MCP-semantik** — diskuteras i tekniska kretsar (MCP working groups) och förekommer som tema i EU AI Office-konsultationer; svenska aktörer som Digg och Riksarkivet lyfter angränsande frågor om interoperabilitet och arkivering
- **Provenance-standard för agentiska beslut** — lyfts av aktörer som C2PA-konsortiet, NIST och forskare inom federated learning + attestable audits; förekommer i AI Act-konsultationer om high-risk-system
- **Kompetensprofiler** — agent-arkitektur-revision (en ny profil som diskuteras i revisionssamhället, bland annat inom Expertbyråns eget kompetensutvecklingsspår) och förvaltningsjuridik × AI-arkitektur (hybridprofil som efterfrågas i myndighetsupphandlingar 2025–2026)
- **AI Act art. 57-sandlådor** — kravbild från EU-förordningen; Sverige har enligt offentlig information ingen sandlåda i drift per maj 2026, vilket diskuteras av aktörer som AI Sweden och Digg
- **Differentierad arkitekturpolicy** — högrisk- och lågrisk-flöden förekommer i policyförslag (AI Act-klassificering, OECD AI risk taxonomy) som områden med skilda krav på loggning, motivering och mänsklig kontroll

## 6. Avslutning — vad granskningskapacitet kräver

Riksrevisionen kommer med stor sannolikhet att granska agentisk förvaltning under 2030-talet. För att den granskningen ska vara meningsfull behöver svensk granskningskapacitet 2026–2030 bygga:

- metodutveckling för granskning av agent-arkitekturer som komplement till befintlig IT-systemrevision
- juridisk klarhet i vad "motivering" betyder när beslut härrör ur signerade policy-konfigurationer
- empirisk forskning på agent-flöden i myndighetspraktik (idag finns lite)

Detta är inte en partsskrivelse — det är en kartläggning av var de tekniska, juridiska och fysiska tröskelvärdena ligger. Vilka val Sverige gör är en politisk och organisatorisk fråga.

---

*Källa för energisiffror: IEA, [Energy and AI — Executive Summary](https://www.iea.org/reports/energy-and-ai/executive-summary) (2025). MCP-tillväxtsiffror baseras på offentligt rapporterade SDK-nedladdningsdata och registerstorlek (mars 2026).*
