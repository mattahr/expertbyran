Åttiotvå procent av offentliga organisationer har adopterat AI-agenter — autonoma system som planerar, analyserar och verkställer uppgifter utan mänsklig godkännande vid varje steg. Siffran kommer från [Salesforce Agentic Government Insights 2026](https://www.salesforce.com/news/stories/agentic-government-insights-2026/) och speglar en global trend: från Estlands Bürokratt, som koordinerar AI-assistenter över myndighetsgränser, till amerikanska federala myndigheter som niodubblat sina generativa AI-tillämpningar på ett år.

Men tekniken utvecklas snabbare än förmågan att kontrollera den. Parallellt med agenternas frammarsch växer två nya hot: *rogue AI agents* — AI-system som utger sig för att vara legitima — och *Liar's Dividend* — fenomenet att autentiska bevis avfärdas som fabricerade. Tillsammans skapar de en tillitskris som varken EU:s AI-förordning eller dagens revisionsmetodik är byggd för att hantera.

Offentlig sektor behöver ett nytt förtroenderamverk. Vi kallar det Know Your Agent — KYA.

## AI-agenter fattar redan beslut — men ingen vet vem de är

Agentisk AI skiljer sig fundamentalt från traditionell automatisering. En klassisk algoritm utför en förutbestämd uppgift: om ansökan uppfyller kriterium A och B, bevilja. En AI-agent däremot planerar sin egen väg: den analyserar ärendet, hämtar kompletterande information, konsulterar andra agenter och fattar delbeslut i en kedja som kan vara lång och svår att följa.

Problemen uppstår i kedjorna. När agent A tar beslut baserat på agent B:s analys, som i sin tur bygger på agent C:s datainsamling, skapas vad som kan kallas ett *kompound-förklarbarhetsproblem*. Befintliga förklaringsverktyg — SHAP, LIME, model cards — designades för statiska maskininlärningsmodeller, inte för dynamiska agentorkestreringar. Deras tekniska mognad för LLM-baserade agentkedjor bedöms vara på nivå 4 av 9 på [Technology Readiness Level-skalan](https://en.wikipedia.org/wiki/Technology_readiness_level), enligt vår teknikstrategiska analys.

Ingen myndighet i Sverige har idag ett register över vilka AI-agenter som är aktiva i dess beslutssystem, vilka befogenheter de har eller hur deras identitet verifieras.

## Deepfakes gör bevisningen opålitlig

Tillitskrisen förstärks från ett oväntat håll. Deepfakes — AI-genererade förfalskningar av ljud, bild och video — har nått en kvalitet där artefakter inte längre syns med blotta ögat. Inför Irlands presidentval 2025 spreds en [deepfake av en kandidats återkallelse](https://www.euronews.com/next/2025/01/21/deepfakes-and-the-irish-election) dagarna före valet.

Men det mest insidösa hotet kallas *Liar's Dividend*: möjligheten att avfärda *autentiska* bevis som AI-genererade. En tjänsteperson som konfronteras med ett protokoll kan hävda att det är fabricerat. En myndighet vars interna kommunikation läcker kan ifrågasätta äktheten. Revisionens grundläggande funktion — att verifiera, kontrollera och dokumentera — vilar på att bevis går att lita på. Den grunden urholkas nu.

EU:s AI-förordning kräver märkning av AI-genererat innehåll från augusti 2026, med sanktioner upp till [sex procent av global omsättning](https://artificialintelligenceact.eu/article/50/). Men märkningskrav löser inte Liar's Dividend — den handlar om att autentiskt material avfärdas, inte om att fejkat material saknar etikett.

## EU AI Act är tyst om agent-till-agent-tillit

EU:s AI-förordning är den mest ambitiösa AI-regleringen i världen. Den ställer krav på riskhanteringssystem, teknisk dokumentation, automatisk loggning och mänsklig tillsyn för högrisk-AI. Men den adresserar inte agent-till-agent-tillit.

Förordningen utgår från en modell där ett AI-system har en identifierbar leverantör och en användare. I en agentisk arkitektur — där system A delegerar till system B som anropar system C — är denna modell otillräcklig. [ENISA](https://www.enisa.europa.eu/) arbetar med frågan, men inget ramverk väntas före 2027.

För offentliga myndigheter gäller dessutom en förlängd implementationstid: kraven på högrisk-AI träder i kraft [2 augusti 2030](https://artificialintelligenceact.eu/high-level-summary/), inte 2026. Det ger en fyraårig period då agentisk AI kan spridas utan att omfattas av de fulla regelkraven.

## Tekniska byggstenar finns — men ingen har satt ihop dem

Trots det regulatoriska vakuumet finns tekniska mekanismer som kan utgöra grunden för ett KYA-ramverk:

- **Kryptografisk arbetsbelastningsidentitet.** [SPIFFE/SPIRE](https://spiffe.io/) ger kryptografisk attestation av vilken mjukvara som kör vad. Tekniken används i produktion av bland andra Netflix och Google. Den har hög teknisk mognad för molnmiljöer — men ingen har porterat den till AI-agenter i offentlig sektor.
- **Agent-till-agent-autentisering.** Googles [A2A-protokoll](https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/) (2025) introducerar autentiseringsheaders mellan agenter. Tekniken är i tidig adoption.
- **Verifierbara digitala intyg.** [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model-2.0/) möjliggör identitetsintyg för agenter. Inga deployments i statsförvaltning ännu.
- **Leverantörsspecifika spårloggar.** OpenAI och Anthropic erbjuder audit logs, men de är silobaserade och ger inte spårbarhet över agentgränser.

Bitarna finns. Det som saknas är ett sammanhållet ramverk med regulatoriskt stöd.

## Fem rekommendationer för svensk offentlig sektor

Att vänta på att EU löser frågan innebär att agentisk AI sprids i fyra år utan grundläggande förtroendemekanismer. Sverige kan agera nu.

1. **Inventera.** Varje myndighet bör kartlägga vilka AI-agenter som är aktiva i dess beslutssystem — med befogenheter, datakällor och beslutskedjor. Nederländernas [algoritmregister](https://algoritmes.overheid.nl/) visar att det är genomförbart.
2. **Signera.** Kräv kryptografisk signering av agentoutputs i system som påverkar enskilda. Det skapar spårbarhet utan att kräva full systemombyggnad.
3. **Behåll människan i kedjan.** Beslut med rättsliga konsekvenser bör kräva mänsklig attestation, inte bara mänsklig tillsyn. Skillnaden är avgörande: tillsyn innebär att en människa *kan* gripa in, attestation innebär att en människa *måste* ta ställning.
4. **Centralisera spårloggar.** Myndighetsgemensamma audit logs — inte leverantörsspecifika silos — behövs för att möjliggöra oberoende granskning av agentkedjor.
5. **Ställ krav i upphandlingen.** Obligatoriska audit-hooks i all offentlig IT-upphandling är den enskilt viktigaste åtgärden för att bygga den infrastruktur som revision kräver. Brasiliens revisionsmyndighet [TCU](https://portal.tcu.gov.br/en_us/) lyckades halvautomatisera revision för att myndigheten hade mandat att kräva dataaccesskontrakt med granskade myndigheter.

## Tillitens infrastruktur avgör om granskningen hänger med

De kommande åren avgör om Sveriges statsförvaltning bygger in spårbarhet och ansvarsutkrävning i sina AI-system — eller om den automatiserade staten växer fram snabbare än förmågan att granska den. Varje myndighet som inför agentisk AI utan att samtidigt bygga tillitsinfrastruktur skapar en revisionsblind fläck som blir svårare att stänga i efterhand.

Know Your Agent är inte ett färdigt ramverk. Det är ett sätt att ställa rätt fråga: *vet vi vem — eller vad — som fattar besluten?*
