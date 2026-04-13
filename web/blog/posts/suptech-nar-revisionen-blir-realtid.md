Traditionell revision har en inbyggd svaghet: den tittar bakåt. En effektivitetsgranskning kan ta ett till två år från initiering till publicerad rapport — och under den tiden hinner verkligheten förändras. Men vad händer när tillsynsmyndigheter får verktyg som analyserar data i realtid, inte i efterhand?

I Brasilien har federala revisionsdomstolen (TCU) byggt ALICE — ett AI-system som kombinerar NLP och RPA för att granska offentliga upphandlingar i realtid. Resultatet: en revisionscykel som tidigare tog 400 dagar har krympt till åtta. Under 2023 genomförde systemet 203 granskningar och identifierade avvikelser motsvarande 4,15 miljarder euro. Det är inte en framtidsvision — det är redan i drift.

Tekniken bakom kallas SupTech — Supervisory Technology — och den håller på att förändra hur tillsynsmyndigheter världen över arbetar. Frågan är inte längre om revisionen kan bli snabbare och mer dataintensiv, utan varför Sverige fortfarande ligger så långt efter.

## 197 myndigheter i 140 länder har redan börjat

SupTech är ett samlingsbegrepp för AI-verktyg som hjälper tillsynsmyndigheter att automatisera övervakning, compliance-rapportering och riskdetektering. Marknaden för den närliggande RegTech-sektorn (Regulatory Technology) värderades till 13 miljarder dollar 2023 och förväntas nå 35 miljarder dollar 2029.

Det är inte bara Brasilien som rört sig. Enligt en IMF/BIS-kartläggning från 2024 använder 197 finansiella tillsynsmyndigheter i 140 länder nu någon form av SupTech-verktyg. Europeiska centralbanken (ECB) har utvecklat Athena — ett NLP-system som automatiskt analyserar regleringstext — och Heimdall, ett maskininlärningssystem för bedömning av ledande befattningshavares lämplighet. Storbritanniens Financial Conduct Authority (FCA) analyserar över 20 miljoner aktiemarknadsaffärer dagligen med övervakad maskininlärning för att upptäcka marknadsmanipulation.

## Tre tekniska byggstenar gör realtidsrevision möjlig

Den tekniska stacken bakom SupTech vilar på tre komponenter som alla är mogna var för sig, men som sällan kombineras i svensk offentlig förvaltning.

**Event-driven streaming.** Plattformar som Apache Kafka och Apache Flink gör det möjligt att behandla dataströmmar i realtid — inte i nattliga batchkörningar, utan transaktion för transaktion. Det är samma teknik som Spotify använder för att spåra lyssnarbeteende och som banker använder för bedrägeridetektering.

**NLP-pipelines för textanalys.** Moderna språkmodeller kan analysera upphandlingsdokument, myndighetsbeslut och regleringstexter automatiskt. Brasiliens ALICE använder detta för att flagga avvikelser i upphandlingsunderlag innan kontraktet signeras — inte månader efteråt.

**API-ekosystem och öppna data.** EU:s Public Procurement Data Space (PPDS) blev operationellt i september 2024 och ger åtkomst till upphandlingsdata från över 250 000 upphandlande myndigheter via TED API v3. Det innebär att den tekniska infrastrukturen för gränsöverskridande upphandlingsanalys redan finns — för den som kan använda den.

## Sverige har tekniken men saknar datainfrastrukturen

Problemet i Sverige är inte att tekniken är otillgänglig. Det är att den underliggande datainfrastrukturen är fragmenterad.

Stora svenska myndigheter har mogna datalakes — uppskattningsvis 3–4 av 5 på en mognadsskala. Men för mindre myndigheter och kommuner ligger nivån på 1–2 av 5. API-ekosystemet är fortfarande splittrat trots Ekonomistyrningsverkets (ESV) och DIGG:s standardiseringsarbete. Och realtidsrevision — det som Brasilien redan gör — kräver streaming-infrastruktur som inte är standard i svensk förvaltning.

Den realistiska horisonten ser ut så här: halvautomatiserad revision med dagliga batch-uttag är genomförbart redan idag. Systemtäckande realtidsövervakning, där varje transaktion analyseras i det ögonblick den sker, ligger sannolikt 7–10 år bort. Mellansteget — periodiska automatiserade granskningar med vecko- eller månadsvis frekvens — är det som borde prioriteras nu.

## Brasilien visar vägen — men kontexten skiljer sig

Det vore förenklat att bara peka på Brasilien och fråga varför Sverige inte gör likadant. Förutsättningarna skiljer sig. Brasiliens TCU har ett tydligare mandat för realtidsövervakning av upphandlingar, och landet har en lång tradition av federal tillsynsmakt med direktåtkomst till transaktionsdata.

I Sverige är dataåtkomsten mer komplex. Myndigheter äger sina egna system, och det saknas en gemensam datainfrastruktur som möjliggör den typ av centraliserad analys som ALICE bygger på. Det handlar inte bara om teknik utan om styrningsmodell och informationsdelning mellan myndigheter.

Ändå visar exemplet att automatiserad granskning av offentliga resurser är praktiskt genomförbar — inte som forskningsprojekt, utan som operativ verklighet. Frågan för svensk förvaltning är vilka steg som behöver tas för att nå dit, och vilka aktörer som behöver samverka.

## Från eftersläpning till möjlighet

SupTech-utvecklingen pekar mot en framtid där revisionen inte längre bara dokumenterar vad som gick fel, utan kan identifiera risker medan de fortfarande går att åtgärda. Det ställer nya krav — på datainfrastruktur, på kompetens inom streaming-arkitektur och NLP, och på en vilja att ompröva hur granskning organiseras.

Sverige har förutsättningarna: starka myndigheter, hög digital mognad i delar av förvaltningen och en tradition av transparens och öppenhet. Det som saknas är bryggan mellan den tekniska möjligheten och den institutionella verkligheten. Att bygga den bryggan är inte främst ett teknikprojekt — det är ett styrningsprojekt.

---

*Källor: IMF/BIS SupTech Survey 2024 (197 myndigheter, 140 länder); Brasiliens TCU ALICE årsrapport 2023; EU PPDS (api.ted.europa.eu, operationellt september 2024); ESV/DIGG standardiseringsarbete för API-ekosystem.*
