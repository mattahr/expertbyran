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

* **Domän:** Registerdata, statistik, kausalinferens, kvantitativa iakttagelser, ML-baserad kausalinferens
* **Triggers:** registerdata, statistisk analys, kausalinferens, kvantitativa iakttagelser, osäkerhetsmarginaler, tidsserier, korrelation, GRF, Causal Random Forest, heterogena behandlingseffekter, CATE, Synthetic DiD
* **Capabilities:**
  * **kvantitativ-analys** — Leverera kvantitativa iakttagelser med full precision
  * **registeruttag** — Leta upp och kvalitetskontrollera registerdata från offentliga källor
  * **kausalitetsprovning** — Pröva kausalitet med temporal ordning, kovariation och eliminering
  * **ml-kausalinferens** — Causal Random Forest/GRF (Athey 2019) för CATE och Synthetic DiD (Arkhangelsky 2021); ML löser dimensionalitet, inte confounding
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/kvantitativ-analytiker/EXPERT.md
* **Kan kedja till:** effektivitetsrevisor, kvalitetsgranskare

## Kvalitativ metodexpert

* **Domän:** Intervjumetodik, dokumentanalys, fallstudier, representativitet, triangulering
* **Triggers:** intervjuguide, intervjumetodik, dokumentanalys, kvalitativa iakttagelser, kodningsschema, representativitet, triangulering
* **Capabilities:**
  * **intervjudesign** — Utforma intervjuguider med urvalsstrategier och kodning
  * **dokumentanalys** — Systematisk granskning av regleringsbrev och årsredovisningar
  * **triangulering** — Koppla kvalitativa fynd med kvantitativa analyser
* **Sökväg:** ${CLAUDE_PLUGIN_ROOT}/experts/kvalitativ-metodexpert/EXPERT.md
* **Kan kedja till:** kvantitativ-analytiker, effektivitetsrevisor

## Rättslig utredare

* **Domän:** Författningstolkning, bedömningsgrunder, mandatanalys, förvaltningsrätt, EU AI-förordningen
* **Triggers:** bedömningsgrund, författningstolkning, mandatanalys, regleringsbrev, förordning, lagtext, myndighetsinstruktion, rekommendationer, EU AI-förordningen, AI Act, högrisk-AI, deployer, AI-reglering
* **Capabilities:**
  * **bedomningsgrund** — Utreda rättsligt ursprung för bedömningsgrunder
  * **mandatanalys** — Bedöma vilka aktörer som har mandat att genomföra rekommendationer
  * **forfattningstolkning** — Tolka motstridig eller vag lagtext
  * **eu-ai-forordning** — EU AI-förordningen (2024/1689) för statliga myndigheter som deployers av högrisk-AI — art. 13, 14, 26, bilaga III och koppling FL 28 §
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

* **Domän:** Statlig digitalisering, digital identitet, IT-styrning, informationshantering
* **Triggers:** digitaliseringsprojekt, statlig IT, digital identitet, e-legitimation, BankID, biometri, DIGG, informationshantering, interoperabilitet
* **Capabilities:**
  * **sakanalys** — Sakanalys av statliga digitaliseringsprojekt och IT-styrning
  * **identitetsanalys** — Bedöma rutiner för identitetsfastställande
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
