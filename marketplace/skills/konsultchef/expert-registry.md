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

* **Domän:** Registerdata, statistik, kausalinferens, kvantitativa iakttagelser, ML-baserad kausalinferens, BSTS/CausalImpact, DEA/benchmarking, Double Machine Learning, Syntetisk kontroll (SC/SDID)
* **Triggers:** registerdata, statistisk analys, kausalinferens, kvantitativa iakttagelser, osäkerhetsmarginaler, tidsserier, korrelation, GRF, Causal Random Forest, heterogena behandlingseffekter, CATE, Synthetic DiD, BSTS, CausalImpact, bayesiansk tidsserieanalys, DEA, Data Envelopment Analysis, benchmarking kommunal sektor, DML, Double Machine Learning, Causal Forests, honest estimation, syntetisk kontroll, SC, synthetic control, MSPE, placebo-inferens, donorpool
* **Capabilities:**
  * **kvantitativ-analys** — Leverera kvantitativa iakttagelser med full precision
  * **registeruttag** — Leta upp och kvalitetskontrollera registerdata från offentliga källor
  * **kausalitetsprovning** — Pröva kausalitet med temporal ordning, kovariation och eliminering
  * **ml-kausalinferens** — DML (Chernozhukov 2018), Causal Random Forest/GRF (Athey 2019) för CATE och Synthetic DiD (Arkhangelsky 2021); ML löser dimensionalitet, inte confounding
  * **bsts-causalimpact** — Bayesiansk strukturell tidsserieanalys (Brodersen m.fl. 2015) — kausalinferens vid svag donor pool
  * **dea-benchmarking** — DEA med bootstrapped konfidensintervall (Simar & Wilson 1998), VRS-modellering, R-paketet Benchmarking
  * **syntetisk-kontroll-sc** — Syntetisk kontroll (SC/SDID): MSPE-minimering, placebo-inferens, EU/OECD-donorpool, Synthetic DiD som hybrid vid staggered adoption; metodval SC vs DiD
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

* **Domän:** Vetenskaplig opponering, kvalitetsgranskning, validitetsprövning, stringens, metaanalys, systematiska översikter
* **Triggers:** opponering, kvalitetsgranskning, vetenskaplig stringens, validitet, reliabilitet, bekräftelsebias, slutsatskalibrering, metaanalys, systematisk översikt, evidensöversikt, GRADE, PRISMA, Cochrane, heterogenitetsanalys, publication bias
* **Capabilities:**
  * **opponering** — Pröva utkast mot vetenskaplig checklista och ge invändningar
  * **bristkartlaggning** — Identifiera systematiska vetenskapliga brister
  * **kalibrering** — Granska slutsatsstyrka och precision i formuleringarna
  * **metaanalys** — Granska och genomföra metaanalyser och systematiska översikter enligt Cochrane/PRISMA 2020
  * **evidensgranskning** — Tillämpa GRADE-systemet och granska evidensöversikter med 5-dimensionell opponent-checklista
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

* **Domän:** Polis, åklagare, civilt försvar, samhällsskydd, infiltrationsskydd, gängrelaterad brottslighet och organiserad kriminalitet
* **Triggers:** polismyndigheten, åklagarmyndigheten, civilt försvar, krisberedskap, skydd av hotade personer, infiltration, polisutbildning, kronofogden, gängkriminalitet, organiserad brottslighet, visitationszoner, anonyma vittnen, preventiva tvångsmedel, SSPF, SIG, Barnahus, hemliga tvångsmedel
* **Capabilities:**
  * **sakanalys** — Sakanalys av rättsväsendets myndigheter och samhällsskydd
  * **samverkansbedomning** — Bedöma myndigheters samverkan vid grova brott och skydd
  * **gangcrime** — Granskning av gängrelaterad brottslighet och lagstiftningspaketet 2022–2026 (visitationszoner, preventiva tvångsmedel, anonyma vittnen, hemliga tvångsmedel mot barn under 15 år), samverkansstrukturer (Barnahus, SSPF, SIG) samt granskningspotential ur Riksrevisorns perspektiv
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

## Expert Transport

* **Domän:** Transport och infrastruktur, Trafikverket, Transportstyrelsen, järnväg, väg, luftfart, sjöfart, samhällsekonomiska kalkyler
* **Triggers:** transport, infrastruktur, trafikpolitik, Trafikverket, Transportstyrelsen, Luftfartsverket, Sjöfartsverket, järnvägsinvesteringar, vägunderhåll, luftfartspolitik, sjöfartspolitik, samhällsekonomisk kalkyl, CBA infrastruktur, ASEK, nationell transportplan, hållbar transport, kollektivtrafik
* **Capabilities:**
  * **sakanalys** — Sakanalys av transportpolitik, infrastrukturinvesteringar och myndighetsstyrning inom transportsektorn
  * **cba-analys** — Bedöma samhällsekonomiska kalkyler (CBA) och ASEK-kalkylvärden för infrastrukturinvesteringar
  * **underhallsanalys** — Analysera eftersläpning i vägunderhåll och järnvägsunderhåll — gap mellan behov och anslagna medel
  * **myndighetsgranskning** — Granska styrning och uppdragsuppfyllelse för Trafikverket, Transportstyrelsen, LFV och Sjöfartsverket
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-transport/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor (vid helhetskoordinering), kvantitativ-analytiker (vid registerbaserad underhålls- eller olycksanalys), rattslig-utredare (vid tolkningsfrågor om transportlagstiftning)

## Expert Hållbarhet ESG

* **Domän:** Hållbarhetsrapportering, ESG-datavalidering, CSRD, ESRS, EU-taxonomin, klimatfinansiering, Green Bond, TNFD LEAP, naturrelaterade risker, PCAF, financed emissions, RED III, biodrivmedel
* **Triggers:** hållbarhetsrapportering, ESG, CSRD, ESRS, EU-taxonomin, taxonomiöverensstämmelse, klimatfinansiering, Green Bond, gröna obligationer, scope 1, scope 2, scope 3, GRI, ISSB, IFRS S1, IFRS S2, dubbel väsentlighetsanalys, hållbarhetsrevision, TCFD, hållbarhetsredovisning, TNFD, LEAP, naturrelaterade risker, biologisk mångfald, ESRS E4, ENCORE, IBAT, Aqueduct, PCAF, financed emissions, finansierade utsläpp, datakvalitetspoäng, RED III, biodrivmedel, bioenergi, biomassa, LCA, DNSH, taxonomi TSC
* **Capabilities:**
  * **csrd-esrs-granskning** — Granska CSRD-rapportering och ESRS-taxonomiöverensstämmelse för offentlig sektor
  * **esg-datavalidering** — Validera ESG-data (scope 1–3) och bedöma datakvalitetsramverk
  * **klimatfinansieringsrevision** — Granska klimatfinansiering och Green Bond-ramverk — spårbarhet mellan obligationsintäkter och klimatinvesteringar
  * **standardnavigering** — Navigera GRI/ISSB/ESRS och bedöma tillämpbarhet för statliga myndigheter
  * **tnfd-leap** — Genomföra LEAP-bedömning (Locate, Evaluate, Assess, Prepare) för naturrelaterade risker; LEAP-FI för finansiella institutioner med ENCORE/IBAT/Aqueduct-verktyg; koppling till ESRS E4
  * **scope3-kat15-pcaf** — Beräkna och granska Scope 3 kat. 15 (financed emissions) för finansiella institutioner — GHG Protocol + PCAF datakvalitetspoäng 1–5 som revisionsverktyg; PCAF v2+ revisionslucka mot GHG Protocol
  * **red-iii-dnsh** — Tolka RED III Annex V LCA-metodik och Annex IX-klassificering; analysera DNSH-gränssnittet mot taxonomi TSC för biobränslen — RED III-besked ≠ taxonomi-alignment
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/expert-hallbarhet-esg/EXPERT.md
* **Kan kedja till:** expert-miljo-klimat (vid policykontext), expert-finanser (vid finansieringsdimensionen), kvantitativ-analytiker (vid utsläppsdata), rattslig-utredare (vid EU-rättsliga tolkningsfrågor)

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
* **Kan kedja till:** rattslig-utredare (vid NIS2/DORA/EU AI Act-frågor), expert-digitalisering (vid statlig IT-styrning och cybersäkerhet), effektivitetsrevisor (vid helhetskoordinering)

## Chefsstrateg

* **Domän:** Strategisk rådgivning, scenarioanalys, omvärldsbevakning med framtidsfokus, kompetensplanering, offentlig revision
* **Triggers:** chefsstrategi, strategisk rådgivning, scenarioanalys, omvärldsbevakning, långsiktig kompetensplanering, forecasting, megatrender, policyutveckling, framtida granskningsbehov, revisionsstrategi, strukturell förändring, samhällsförändring, McKinsey-ramverk, strategisk analys
* **Capabilities:**
  * **scenarioanalys** — Scenarioanalys och forecasting om framtida samhällsutveckling och dess implikationer för offentlig revision
  * **kompetensplanering** — Identifierar vilka domän-, metod- och specialistexperter Riksrevisionen behöver i framtiden
  * **omvarldsbevakning** — Djup omvärldsbevakning med framtidsfokus — trender inom offentlig revision, policyutveckling, teknik och samhällsförändring
  * **strategisk-radgivning** — Strategisk rådgivning på McKinsey/BCG/Bain-nivå för revisionsmyndigheter och offentlig sektor
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/chefsstrateg/EXPERT.md
* **Kan kedja till:** teknikstrateg (vid teknologiska trender), effektivitetsrevisor (vid helhetskoordinering), kvantitativ-analytiker (vid datadriven scenarioanalys)

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
