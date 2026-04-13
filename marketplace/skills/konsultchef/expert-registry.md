# Expertregistret — Expertbyråns tillgängliga konsulter

## Effektivitetsrevisor

* **Domän:** Effektivitetsrevision, granskningsdesign, metodkoordinering, projektledning, internationell granskningsmetodik
* **Triggers:** designmatris, granskningsupplägg, revisionsfråga, delfrågor, bedömningsgrunder, metodval, effektivitetsrevision, 23-stegsprocessen, ECA, INTOSAI, IDI, internationell revisionsstandard
* **Capabilities:**
  * **designmatris** — Bryta ned revisionsfråga i delfrågor med bedömningsgrunder och metodval
  * **projektledning** — Leda granskning från förstudie till publicering
  * **metodkoordinering** — Koppla in rätt metodexpert för varje delmoment
  * **eca-metodik** — ECA:s granskningsmetodik: 7-källsmodell för kriterier, MECE-krav på delfrågor och Adversarial Procedure; jämförande analys ECA vs IDI/INTOSAI vs Riksrevisionen
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/effektivitetsrevisor/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker, kvalitativ-metodexpert, rattslig-utredare, kvalitetsgranskare

## Kvantitativ analytiker

* **Domän:** Registerdata, statistik, kausalinferens, kvantitativa iakttagelser, ML-baserad kausalinferens, BSTS/CausalImpact, DEA/benchmarking, Double Machine Learning
* **Triggers:** registerdata, statistisk analys, kausalinferens, kvantitativa iakttagelser, osäkerhetsmarginaler, tidsserier, korrelation, GRF, Causal Random Forest, heterogena behandlingseffekter, CATE, Synthetic DiD, BSTS, CausalImpact, bayesiansk tidsserieanalys, DEA, Data Envelopment Analysis, benchmarking kommunal sektor, DML, Double Machine Learning, Causal Forests, honest estimation
* **Capabilities:**
  * **kvantitativ-analys** — Leverera kvantitativa iakttagelser med full precision
  * **registeruttag** — Leta upp och kvalitetskontrollera registerdata från offentliga källor
  * **kausalitetsprovning** — Pröva kausalitet med temporal ordning, kovariation och eliminering
  * **ml-kausalinferens** — DML (Chernozhukov 2018), Causal Random Forest/GRF (Athey 2019) för CATE och Synthetic DiD (Arkhangelsky 2021); ML löser dimensionalitet, inte confounding
  * **bsts-causalimpact** — Bayesiansk strukturell tidsserieanalys (Brodersen m.fl. 2015) — kausalinferens vid svag donor pool
  * **dea-benchmarking** — DEA med bootstrapped konfidensintervall (Simar & Wilson 1998), VRS-modellering, R-paketet Benchmarking
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/kvantitativ-analytiker/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor, kvalitetsgranskare

## Kvalitativ metodexpert

* **Domän:** Intervjumetodik, dokumentanalys, fallstudier, representativitet, triangulering, bayesian process tracing
* **Triggers:** intervjuguide, intervjumetodik, dokumentanalys, kvalitativa iakttagelser, kodningsschema, representativitet, triangulering, process tracing, bayesian process tracing
* **Capabilities:**
  * **intervjudesign** — Utforma intervjuguider med urvalsstrategier och kodning
  * **dokumentanalys** — Systematisk granskning av regleringsbrev och årsredovisningar
  * **triangulering** — Koppla kvalitativa fynd med kvantitativa analyser
  * **process_tracing_bayesian** — Bayesian process tracing med explicita priors och likelihood-uppdatering (Bennett & Checkel; Fairfield & Charman)
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/kvalitativ-metodexpert/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker, effektivitetsrevisor

## Rättslig utredare

* **Domän:** Författningstolkning, bedömningsgrunder, mandatanalys, förvaltningsrätt, EU AI-förordningen (Art. 26 deployer-skyldigheter, Art. 27 FRIA, AI-upphandling), RF/FL och AI-baserade myndighetsbeslut
* **Triggers:** bedömningsgrund, författningstolkning, mandatanalys, regleringsbrev, förordning, lagtext, myndighetsinstruktion, rekommendationer, EU AI-förordningen, AI Act, högrisk-AI, deployer, AI-reglering, FRIA, grundrättighetskonsekvensbedömning, MCC-AI, AI-upphandling, RF 1:9, objektivitetsprincipen, proxy-diskriminering, FL 28, FL 32, automatiserade beslut, beslutsmotivering, AI-baserade myndighetsbeslut, revisionsfrågebank AI
* **Capabilities:**
  * **bedomningsgrund** — Utreda rättsligt ursprung för bedömningsgrunder
  * **mandatanalys** — Bedöma vilka aktörer som har mandat att genomföra rekommendationer
  * **forfattningstolkning** — Tolka motstridig eller vag lagtext
  * **eu-ai-forordning** — EU AI-förordningen (2024/1689) för statliga myndigheter som deployers av högrisk-AI — de sex kraven i Art. 26, den sexdelade FRIA-processen (Art. 27), koppling FL 28 §, samt upphandlingsgranskningar (LOU 17 kap. + Art. 28 + MCC-AI)
  * **rf-fl-ai-beslut** — RF 1:9 (objektivitetsprincipen) som direkt bedömningsgrund i AI-granskningar — proxy-diskriminering = RF-brott. FL 28 § och FL 32 § gäller fullt ut för AI-baserade myndighetsbeslut. Operationaliserat i en revisionsfrågebank i 5 nivåer mot AI Act Art. 26/27.
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/rattslig-utredare/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor, expert-rattsvasende

## Kvalitetsgranskare

* **Domän:** Vetenskaplig opponering, kvalitetsgranskning, validitetsprövning, stringens
* **Triggers:** opponering, kvalitetsgranskning, vetenskaplig stringens, validitet, reliabilitet, bekräftelsebias, slutsatskalibrering
* **Capabilities:**
  * **opponering** — Pröva utkast mot vetenskaplig checklista och ge invändningar
  * **bristkartlaggning** — Identifiera systematiska vetenskapliga brister
  * **kalibrering** — Granska slutsatsstyrka och precision i formuleringarna
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/kvalitetsgranskare/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor

## Expert Offentliga finanser

* **Domän:** Finanspolitik, statsbidrag, avgiftsbelagda tjänster, skatt, myndighetsstyrning
* **Triggers:** finanspolitiska ramverket, statsbidrag, avgiftsbelagda tjänster, offentliga finanser, resultatstyrning, budgetdisciplin, ESV
* **Capabilities:**
  * **sakanalys** — Sakanalys av finansiella styrmedel inom offentlig sektor
  * **styrmedelsbedomning** — Bedöma statsbidrags och avgifters effektivitet som styrmedel
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-finanser/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker, effektivitetsrevisor

## Expert Digitalisering

* **Domän:** Statlig digitalisering, digital identitet, IT-styrning, informationshantering, EU AI Act
* **Triggers:** digitaliseringsprojekt, statlig IT, digital identitet, e-legitimation, BankID, biometri, DIGG, informationshantering, interoperabilitet, EU AI Act, AI Act, hög-risk AI, AI-compliance, myndigheters AI-skyldigheter
* **Capabilities:**
  * **sakanalys** — Sakanalys av statliga digitaliseringsprojekt och IT-styrning
  * **identitetsanalys** — Bedöma rutiner för identitetsfastställande
  * **eu_ai_act_analys** — Analys av EU AI Act-krav för statliga myndigheter som operatörer av hög-risk AI
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-digitalisering/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor, rattslig-utredare

## Expert Rättsväsende

* **Domän:** Polis, åklagare, civilt försvar, samhällsskydd, infiltrationsskydd
* **Triggers:** polismyndigheten, åklagarmyndigheten, civilt försvar, krisberedskap, skydd av hotade personer, infiltration, polisutbildning, kronofogden
* **Capabilities:**
  * **sakanalys** — Sakanalys av rättsväsendets myndigheter och samhällsskydd
  * **samverkansbedomning** — Bedöma myndigheters samverkan vid grova brott och skydd
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-rattsvasende/EXPERT.md
* **Kan kedja till:** rattslig-utredare, effektivitetsrevisor, expert-valfard

## Expert Välfärd

* **Domän:** LSS, IVO, hälso- och sjukvård, socialtjänst, statlig-kommunal styrning
* **Triggers:** LSS, IVO, välfärd, social omsorg, hälso- och sjukvård, patientklagomål, socialtjänst, kommunal styrning, funktionshinder
* **Capabilities:**
  * **sakanalys** — Sakanalys av välfärdssystem, tillsyn och statlig-kommunal ansvarsfördelning
  * **tillsynsbedomning** — Bedöma IVO:s tillsynsfunktion och genomslag
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-valfard/EXPERT.md
* **Kan kedja till:** kvalitativ-metodexpert, effektivitetsrevisor, expert-rattsvasende

## Klarspråksexperten

* **Domän:** Språkvård, textgranskning, klarspråk, myndighetsspråk, digital tillgänglighet, AI-textgranskning
* **Triggers:** granska text, skriv om, förbättra språket, klarspråk, myndighetsspråk, språkgranskning, textförbättring, skrivregler, digital tillgänglighet, DOS-lagen, WCAG, AI-genererad text
* **Capabilities:**
  * **granska** — Analysera text och ge förbättringsförslag med motivering
  * **skriv-om** — Leverera omskriven version i klarspråk
  * **digital-tillganglighet** — DOS-lagen (2018:1937) och WCAG AA: 7-regelschecklista (DT-1–DT-7) för digitalt publicerade myndighetstexter
  * **ai-textgranskning** — AI-genererade myndighetstexter: 8-punktsgranskningsmodell (AI-1–AI-8) med faktaverifiering före klarspråksgranskning
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/klarsprak/EXPERT.md
* **Kan kedja till:** rattslig-utredare (vid juridisk text), kvalitetsgranskare (vid vetenskaplig opponering)

## Expert Arbetsmarknad

* **Domän:** Arbetsmarknadspolitik, Arbetsförmedlingen, A-kassa, aktiva arbetsmarknadsåtgärder, IFAU-metodik
* **Triggers:** Arbetsförmedlingen, A-kassan, IAF, IFAU, arbetsmarknadspolitik, etableringsprogram, nystartsjobb, aktiva arbetsmarknadsåtgärder, LAS, AFL, ersättningssystem, arbetsmarknadslagstiftning
* **Capabilities:**
  * **sakanalys** — Sakanalys av arbetsmarknadspolitik, Arbetsförmedlingens uppdrag och styrning
  * **atgardsbedomning** — Bedöma effektiviteten hos aktiva arbetsmarknadsåtgärder och ersättningssystem
  * **effektutvärdering** — Tillämpa IFAU-metodik och registerdata för effektutvärdering av arbetsmarknadsprogram
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-arbetsmarknad/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker (vid registerbaserad effektutvärdering), effektivitetsrevisor (vid helhetskoordinering), rattslig-utredare (vid LAS/AFL-tolkningsfrågor)

## Expert Utbildning

* **Domän:** Utbildningspolitik, skolstyrning, kvalitetssäkring, högskola, studiestöd
* **Triggers:** Skolverket, Skolinspektionen, UKÄ, skollagen, gymnasielagen, högskolelagen, PISA, TIMSS, betygsinflation, skolsegregation, friskolesystemet, examenstillstånd, statsbidrag skola, resurstilldelning, likvärdighet
* **Capabilities:**
  * **sakanalys** — Sakanalys av utbildningspolitik, skolstyrning och högskolans styrning
  * **kvalitetsbedömning** — Bedöma skolors och lärosätens kvalitet, tillsyn och resultatutveckling
  * **likvardhetsanalys** — Analysera likvärdighet, betygsinflation och resurstilldelning i skolan
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-utbildning/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker (vid registerbaserad resultatanalys), effektivitetsrevisor (vid helhetskoordinering), rattslig-utredare (vid skollagsfrågor)

## Expert Miljö & Klimat

* **Domän:** Klimatpolitik, miljöstyrning, energisystemet, cirkulär ekonomi, EU-klimatreglering
* **Triggers:** klimatlagen, netto noll 2045, Klimatpolitiska rådet, miljöbalken, Naturvårdsverket, MKB, tillståndsprocesser, Energimyndigheten, Nord Pool, elcertifikat, producentansvar, avfallsdirektivet, EU ETS, taxonomiförordningen, Green Deal, CBAM, cirkulär ekonomi, energiomställning
* **Capabilities:**
  * **sakanalys** — Sakanalys av klimat-, miljö- och energipolitik samt styrmedel
  * **tillstandsbedomning** — Bedöma tillståndsprocesser och miljöbalkens tillämpning
  * **eu-klimatreglering** — EU ETS, taxonomin, Green Deal och CBAM — hur EU:s klimatreglering påverkar svenska myndigheter
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-miljo-klimat/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker (vid utsläpps- och energianalys), effektivitetsrevisor (vid helhetskoordinering), rattslig-utredare (vid EU-rättsliga tolkningsfrågor)

## Expert Försvar

* **Domän:** Försvarspolitik, försvarsmateriel och försvarsindustri, exportkontroll och krigsmaterielexport, militär styrning och organisation, civilförsvar och krisberedskap, underrättelse och militär säkerhet
* **Triggers:** försvarspolitik, försvarsmateriel, försvarsindustri, exportkontroll, krigsmaterielexport, ISP, Försvarsmakten, FMV, civilt försvar, civilförsvar, krisberedskap, MCF, totalförsvar, underrättelse, MUU, MUST, FRA, NCSC, Säpo, försvarsgranskning
* **Capabilities:**
  * **sakanalys** — Sakanalys av försvars- och säkerhetspolitik, militär styrning och organisering
  * **exportkontrollbedömning** — Analysera krigsmaterielexport och ISP:s tillståndsgivning
  * **civilförsvarsbedömning** — Bedöma civilt försvars uppbyggnad, krisberedskap och MCF:s styrning (Myndigheten för civilt försvar, tidigare MSB)
  * **underrättelseanalys** — Bedöma styrning och kontroll av underrättelseverksamhet — MUST, FRA och den planerade MUU (Myndigheten för utrikes underrättelser, planerad start 1 jan 2027)
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-forsvar/EXPERT.md
* **Kan kedja till:** rattslig-utredare (vid tolkningsfrågor om försvarslagstiftning eller exportkontroll), kvantitativ-analytiker (vid registerbaserad analys av försvarsanslag), effektivitetsrevisor (vid helhetskoordinering)

## IT-revisor / Cybersäkerhetsexpert

* **Domän:** IT-revision, cybersäkerhet, informationssäkerhet, NIS2, DORA, MSB-föreskrifterna, ISO 27001, säkerhetsskyddslagen
* **Triggers:** IT-revision, cybersäkerhet, informationssäkerhet, NIS2, cybersäkerhetslagen, DORA, MSB-föreskrifterna, MSBFS 2020:6, MSBFS 2020:7, MSBFS 2020:8, ISO 27001, ISO 27002, säkerhetsskyddslagen, CISM, CISA, INTOSAI WGITA, GUID 5101
* **Capabilities:**
  * **it-revision** — IT-revision enligt GUID 5101 (INTOSAI WGITA) med bedömning mot MSB-föreskrifterna och ISO/IEC 27001/27002
  * **nis2-analys** — NIS2/cybersäkerhetslagen (prop. 2025) — klassificering av enheter, riskhanteringsåtgärder, incidentrapportering och leverantörskedjans säkerhet
  * **dora-analys** — DORA — Digital Operational Resilience Act för finansiella entiteters ICT-riskhantering, incidenthantering och tredjepartsrisker
  * **iso27001** — ISO/IEC 27001:2017 och 27002:2017 — granskning av ledningssystem för informationssäkerhet
  * **sakerhetsskydd** — Säkerhetsskyddslagen 2018:585 — säkerhetsskyddsanalys, säkerhetsskyddsavtal och skyddsvärd information
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/it-revisor/EXPERT.md
* **Kan kedja till:** rattslig-utredare (vid rättslig tolkning av NIS2/DORA/säkerhetsskyddslagen), effektivitetsrevisor (vid helhetskoordinering), expert-digitalisering (vid statlig IT-styrning)

## Teknikstrateg

* **Domän:** Teknikstrategi, omvärldsbevakning, AI och maskininlärning, cybersäkerhet, molntjänster, IoT, kvantdatorer, digital suveränitet, SupTech
* **Triggers:** teknikstrategi, teknikomvärldsbevakning, innovationsstrategi, generativ AI, agentic AI, maskininlärning, blockkedjeteknik, molntjänster, datalakes, 6G, nästa generations telekom, metaverse, immersiv teknik, post-kvantumkryptografi, PQC, IoT, edge computing, digital suveränitet, SupTech, RegTech, AI governance, Zero Trust, tekniktrend
* **Capabilities:**
  * **teknikomvarldsbevakning** — Omvärldsbevakning och trendanalys inom teknik och innovation med TRL-analys och implikationsbedömning för offentlig sektor
  * **ai-strategi** — Strategisk rådgivning om generativ AI, agentic AI, maskininlärning och AI Governance — inklusive EU AI Act-compliance och revisionsperspektiv
  * **cybersaker-analys** — Strategisk analys av cybersäkerhet — post-kvantumkryptografi (PQC), Zero Trust Architecture (ZTA), NIS2 och digital motståndskraft
  * **digital-infrastruktur** — Analys av molntjänster, 6G, IoT, edge computing och digital suveränitet i offentlig sektor
  * **suptech-analys** — SupTech- och RegTech-analys för tillsynsmyndigheter — realtidsövervakning, AI-driven tillsyn och automatiserad revision
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/teknikstrateg/EXPERT.md
* **Kan kedja till:** rattslig-utredare (vid NIS2/DORA/EU AI Act-frågor), it-revisor (vid IT-revision och cybersäkerhetsgranskning), expert-digitalisering (vid statlig IT-styrning), effektivitetsrevisor (vid helhetskoordinering)

## Expert Telekommunikation

* **Domän:** Telekommunikation, digital infrastruktur, bredbandsreglering, spektrum, kritisk infrastruktur, NIS2
* **Triggers:** telekommunikationsreglering, PTS, LEK, EECC, spektrumauktion, bredband, bredbandsstrategi, fiberutbyggnad, FTTH, 5G, radiospektrum, SMP, tillträdesreglering, öppna nät, kritisk infrastruktur telekom, NIS2 telekom, totalförsvar telekom
* **Capabilities:**
  * **reglering** — Analysera telekommunikationsreglering — PTS, LEK, EU:s EECC, spektrumauktioner och SMP-beslut
  * **bredbandspolitik** — Bedöma nationell bredbandspolitik, bredbandsstrategi och statliga stödprogram
  * **marknadsreglering** — Tillträdesreglering, öppna nät och konkurrensanalys på telekommarknaderna
  * **kritisk-infrastruktur** — Telekommunikation som kritisk infrastruktur — MSB, NIS2, totalförsvarsplanering och robusthetskrav
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-telekommunikation/EXPERT.md
* **Kan kedja till:** rattslig-utredare (vid tolkningsfrågor om LEK/EECC/NIS2), effektivitetsrevisor (vid helhetskoordinering), expert-digitalisering (vid överlapp med statlig digitaliseringspolitik)
