# Teknikstrategens sju megatrender 2026–2036

Sammanställd och uppdaterad april 2026. Djupanalys med TRL-analys, adoptionsmognad och implikationer för revisionsmyndigheter (SAIs).

---

## Kompetensmatris

| Teknikdomän | TRL (teknik) | Adoptionsmognad SE | Urgency | Primär SAI-implikation |
|-------------|-------------|-------------------|---------|------------------------|
| Agentic AI | 6–7 | 2–3 | KRITISK | Revidera autonoma beslutssystem |
| PQC | 8–9 | 2–3 | KRITISK (nu) | Harvest now, decrypt later — granska kryptoberedskap |
| Zero Trust / NIS2 | 8–9 | 2–3 | HÖG | 2–3-årig compliance-gap i myndigheter |
| Edge/IoT kritisk infra | 7–8 | 1–2 | HÖG | Obesäkrad OT-infrastruktur i VA, sjukhus, elnät |
| AI Governance | 5–7 | 2–3 | HÖG | EU AI Act-compliance; granska AI-register och XAI |
| Digital suveränitet | 4–6 | 2–3 | MEDEL | Molnberoende, CLOUD Act, datasuveränitet i upphandling |
| SupTech/RegTech | 7–8 | 3–4 fin/1–2 off | MEDEL | Continuous auditing möjligt; mandatfrågan avgörande |

---

## 1. Agentic AI — från verktyg till autonom agent

**TRL: 6–7 av 9** — Stabila i kontrollerade miljöer; instabila i öppna miljöer

**Kritiska fakta (april 2026):**
- Gartner: 40% enterprise-appar har inbyggda AI-agenter vid slutet av 2026 (upp från <5% 2025)
- EY rullade ut enterprise-scale agentic AI till 130 000 revisorer i 160 000 uppdrag i 150+ länder (april 2026)
- Salesforce: 82% av offentliga organisationer har adopterat AI-agenter; 60% anser sig leda privat sektor
- 96% av organisationer globalt använder AI-agenter; bara 11% i aktiv produktion
- Estland Bürokratt: standardmodell för cross-myndighets AI-assistenter

**Teknisk arkitektur:**
- ReAct-mönster (Reason + Act), verktygsanrop (function calling), vektorminne (RAG)
- Multi-agent-koordination via A2A-protokoll (Google 2025, TRL 5)
- MCP (Model Context Protocol, Anthropic), OpenAI Agents SDK, LangGraph, CrewAI

**Kritiska risker:**
- Prompt injection via miljödata
- Agent-privilege escalation (agent A ger agent B utökade rättigheter)
- Hallucination i beviskedjor (SAI-kritisk)
- Oklara ansvarsgränser ("artificiell agency" — ingen juridisk person)
- "Kompound-förklarbarhetsproblem": multiagentkedjor skapar oförklarliga beslutsledar

**SAI-implikation:**
- Autonoma granskningsagenter: planering → datainsamling → analys → rapportutkast utan manuellt steg
- EU AI Act klassificerar de flesta multi-step autonoma agenter som högrisk
- Riksrevisionen behöver System-level AI Audit-metodologi (se kya-och-ai-revision.md)
- Chief AI Officer (CAIO) = kritisk ny roll

---

## 2. Post-kvantumkryptografi (PQC) — den tysta migrationen

**TRL: 8–9 av 9** — Standarder klara; migration pågår

**Kritiska fakta:**
- NIST FIPS 203 (ML-KEM/Kyber), FIPS 204 (ML-DSA/Dilithium), FIPS 205 (SLH-DSA/SPHINCS+) — publicerade aug 2024
- Citi Institute: kvantangrepp på major US-bank = 2,0–3,3 biljoner USD BNP-risk
- Sannolikhet kvantkryptobrytning: 19–34% till 2034; 60–82% till 2044
- 87% organisationer oroade för "harvest now, decrypt later"
- G7 Cyber Expert Group: gemensam PQC-färdplan finanssektor jan 2026
- NSA-tidslinje: RSA/ECDSA deprecerat 2030, förbjudet 2035
- US federala myndigheter: PQC-migration klar 2030; Europa högrisk 2030

**Tidslinje BIS Roadmap:**
- Fas 1 (2025–2026): kryptoinventering
- Fas 2 (2026–2028): migrationsplanering
- Fas 3 (sent 2020-tal): aktiv migration

**SAI-implikation:**
- Alla statliga system med data som har >10 års sekretess är exponerade NU
- Granska myndigheters PQC-beredskapsplaner i alla systemupphandlingsgranskningar
- FRA ansvarig för kvantsäkert signalskydd; NCSS 2025–2029 har kvantsäker kryptografi som explicit mål

---

## 3. Zero Trust Architecture (ZTA) — säkerhetsparadigmskiftet

**TRL: 8–9 av 9** — Mogen teknik; implementationsmognad Sverige: 2–3 av 5

**Kritiska fakta:**
- ~60–70% av statliga myndigheter uppfyller ej ZTA-krav 2026
- NCSC rapporterar att flertalet myndigheter saknar SOC-kapabilitet
- NIS2: tvingar offentlig förvaltning till ZTA — myndigheter 2–3 år bakom regleringstakten
- OT-säkerhet (SCADA/ICS): det kritiska gapet — designat på 80–90-tal utan inbyggd nätverkssäkerhet

**Teknisk stack:**
- Identity Provider (IdP), Policy Decision Point (PDP), Policy Enforcement Point (PEP)
- Privileged Access Management (PAM), SIEM/SOAR, mikrosegmentering
- Produktionssatta plattformar: Microsoft Entra + Defender, Google BeyondCorp, Zscaler, Okta

**SAI-implikation:**
- NIS2 compliance-granskning: vilka myndigheter har implementerat ZTA?
- OT-säkerhet i kritisk infrastruktur: VA, elnät, sjukhus — inga befintliga granskningsramar täcker detta fullständigt

---

## 4. Edge Computing och IoT i kritisk infrastruktur

**TRL: 7–8 av 9** — Säkerhetsanpassning för kritisk infrastruktur: 3–4 av 9

**Kritiska fakta:**
- Industriella styrsystem (PLC, RTU, SCADA) kopplas nu till affärsnätverk — tidigare luftgap försvinner
- Kommuners digitalisering: sjukhus (medicinsk IoT), elbolag (smart metering), VA (SCADA för vattenpumpar) — obesäkrade, ouppdaterbara, ologgade
- Edge-plattformar: AWS Greengrass, Azure IoT Edge, Google Distributed Cloud

**Typiska säkerhetsproblem:**
- Standardlösenord i industrial devices
- Inga firmware-uppdateringar (OT-enheter med 10–20 års livslängd)
- Okrypterad kommunikation (Modbus, OPC-UA utan autentisering)

**SAI-implikation:**
- Granska IoT-säkerhet i kritisk infrastruktur — ingen befintlig granskningsram täcker detta heltäckande
- Kommuners digitala mognad är ojämn; CER-direktivet och NIS2 adresserar detta

---

## 5. AI Governance Infrastructure

**TRL: 5–7 av 9** — Organisatorisk adoption: 3–4 av 9

**Kritiska fakta:**
- **EU AI Act — KRITISK DEADLINE-DISTINKTION:**
  - Privat sektor högrisk-AI: **2 AUGUSTI 2026**
  - Offentliga myndigheter högrisk-AI: **2 AUGUSTI 2030** (explicit förlängd implementationstid)
  - Förbud oacceptabel risk-AI: februari 2025 (alla)
  - Transparenskrav GPAI: augusti 2025 (alla)
- Gartner: 60% av stora företag antar AI governance-verktyg fokuserade på förklarbarhet till 2026
- AI Register: Nederländerna och Amsterdam leder med offentliga register

**Krav på högrisk-AI:**
- Riskhanteringssystem, datagovernance, teknisk dokumentation
- Automatisk loggning, mänsklig tillsyn, konformitetsbedömning, CE-märkning, EU AI-registrering

**XAI-Reckoning 2026:**
- SHAP/LIME: TRL 8 för statisk ML; TRL 4 för LLM-orkestratörer (för långsamt, post-hoc)
- Model cards: TRL 9 för dokumentation; TRL 6 för LLM (saknar stabila egenskaper)
- "Kompound-förklarbarhetsproblem": ingen befintlig XAI-metod hanterar multiagentkedjor

**SAI-implikation:**
- SAI behöver granska privat sektors AI-system mot aug 2026-krav NU
- "Black box"-AI är ej godtagbart i offentlig sektor — SAI kan kräva XAI-dokumentation som revisionsbevis

---

## 6. Digital Suveränitet och Strategisk Teknikoberoende

**TRL: Politisk prioritet KRITISK; teknisk leverans: 4–6 av 9**

**Kritiska fakta (2026):**
- Alla 27 EU-länder undertecknat gemensam suveränitetsdeklaration
- EU sovereign cloud spend: 3× till $23 mdr 2027
- 3 US-bolag kontrollerar 65% av europeisk cloudmarknad
- EU >80% beroende av icke-EU digital infrastruktur
- Geopolitisk drivkraft: Ryssland + Trump-handelspolitik accelererar kraftigt

**Sovereign AI-initiativ:**
- **SOOFI** (Sverige/Germany): Sovereign Open Source Foundation Models, 100 mdr parametrar, Q3 2026
- **Portugal Amalia**: öppen källkod, mid-2026
- **Polen PLLuM**, **Spanien Alia**: nationellt anpassade LLM:er
- EU AI Factories: 19 EU-finansierade anläggningar + EuroHPC — gratis GPU för startups

**SAI-implikation:**
- Granska offentlig sektors molnberoende — var lagras känsliga uppgifter?
- CLOUD Act-problematik: USA-företag kan tvingas lämna ut data oavsett var den lagras
- Techno-blocs: 64% av organisationer inkluderar geopolitiska cyberattacker i riskplanering

---

## 7. SupTech och Realtidsövervakning

**TRL: 7–8 av 9** — Finanstillsyn; 4–5 för allmän förvaltning

**Kritiska fakta:**
- RegTech-marknad: 13 mdr USD (2023) → 35 mdr USD 2029 (CAGR 16,6%)
- 197 finansiella tillsynsmyndigheter i 140 länder har SupTech-verktyg (IMF/BIS 2024)
- Brasil TCU ALICE: revisionscykel 400 dagar → 8 dagar; 4,15 mdr EUR besparingar
- AI-detektering upphandlingskollusion: 81–95% träffsäkerhet
- EU PPDS (Public Procurement Data Space): operationell sept 2024; 250 000+ upphandlande myndigheter
- Gartner: 65% integrerar compliance-automation i DevOps-flöden till 2028

**Continuous auditing — tre-fas-modell för Sverige:**
- **Fas 1 (0–2 år):** Semi-automatiserad batch — AI-assisterad riskbaserad sampling ur befintliga system
- **Fas 2 (2–4 år):** API-standardisering + micro-batch — obligatoriska audit-hooks i upphandling
- **Fas 3 (4–7 år):** Near-real-time streaming — Kafka/Flink när API-standard finns + lagändring

**Mandatfrågan (kritisk):** TCU lyckades för att de hade mandat att kräva dataaccesskontrakt. Riksrevisionen saknar detta mandat idag — det är den politiska nyckeln.

**SAI-implikation:**
- Halvautomatiserad revision med dagliga batch-uttag är möjligt NU utan ny infrastruktur
- Streaming-revision kräver lagändring i upphandlingslagen

---

## Källor

- NIST FIPS 203/204/205 (post-quantum standards, aug 2024)
- Citi Institute: "Quantum Cyber Risk: The $2–3.3 Trillion Threat" (2025)
- G7 Cyber Expert Group: PQC Roadmap for Financial Sector (jan 2026)
- EY Global: Agentic AI Audit Rollout (april 2026)
- Salesforce: Agentic Government Insights 2026
- Deloitte: Government Trends 2026 (Cognitive Government)
- Gartner: Market Guide for AI Governance (2026)
- IMF/BIS SupTech Survey 2024
- Brasil TCU ALICE Annual Report 2023
- EU PPDS (api.ted.europa.eu, operationell sept 2024)
- EU AI Act (Regulation 2024/1689)
- EU Cloud Security Framework (okt 2025)
- NCSC Sverige årsrapport 2024
- Nationell cybersäkerhetsstrategi 2025–2029
