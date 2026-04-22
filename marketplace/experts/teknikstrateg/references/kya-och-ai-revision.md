# Know Your Agent (KYA) och System-level AI Audit

Framväxande ramverk för identitetsbindning av AI-agenter och revision av multiagentsystem. Identifierat och analyserat april 2026.

---

## Know Your Agent (KYA) — Problemet

**Situationen 2026:**
- 82% av offentliga organisationer har adopterat AI-agenter (Salesforce 2026)
- Ingen granskningsmyndighet har ett KYA-ramverk
- Ingen enhetlig standard för agent-identitet i offentlig sektor
- EU AI Act är tyst om agent-till-agent-tillit
- ENISA arbetar med frågan men inget ramverk förväntas före 2027

**Rogue AI Agents — ny bedrägeriström:**
- AI-agenter som utger sig för legitima system
- Kan imitera betrodda myndigheters agentkommunikation
- Kan injicera felaktiga instruktioner i agentkedjor
- Ingen infrastruktur för att upptäcka detta finns i offentlig sektor idag

**Liar's Dividend — hotet mot revisionsbevis:**
- Autentiska dokument och bevis kan avfärdas som deepfake-genererade
- Urholkar revisionsbevisens bevisbörda
- ~8 miljoner deepfakes online 2025 (~900% YoY-tillväxt)
- Röstkloning "crossed the indistinguishable threshold" (Fortune, dec 2025)
- Irland 2025: deepfake av presidentkandidatens återkallelse dagar före val
- EU AI Act Art. 50: märkningskrav AI-innehåll aug 2026 (6% böter)

---

## KYA — Tekniska byggstenar (ej sammansatta)

| Teknologi | Funktion | TRL (generellt) | TRL (offentlig sektor AI) | Status |
|-----------|----------|----------------|--------------------------|--------|
| SPIFFE/SPIRE | Kryptografisk workload identity | 8 (cloud) | 1–2 (AI-agenter) | Ej porterat till agentkontext |
| A2A (Google 2025) | Agent-till-agent autentisering | 5 | 2–3 | Tidig adoption, privat sektor |
| W3C Verifiable Credentials | Intyg för agentidentitet | 6 | 2 | Lovande; inga offentliga deployments |
| LLM Audit Logs | Spårning av agentbeslut | 6 | 3–4 | Silo-baserade; ingen cross-agent spårbarhet |
| Centraliserade orchestratörer | Kontrollpunkt för agenttrafik | 5–6 | 2–3 | Saknar standarder |

**Praktisk interim-lösning (2026):**
1. Kryptografisk signering av agentkommandon och -svar
2. Human-in-the-loop (HITL) för beslut med rättsliga konsekvenser
3. Centraliserade audit logs per myndighetsdomän
4. Separata agentidentiteter per systemgräns

---

## System-level AI Audit — Ny granskningsmetodologi

**Problemet med befintlig XAI:**

Befintliga förklarbarhetverktyg (SHAP, LIME, model cards) designades för statiska ML-modeller. De fungerar inte för LLM-orkestratörer och multiagentsystem.

| Verktyg | TRL för statisk ML | TRL för LLM-orkestratör | Varför det inte räcker |
|---------|-------------------|------------------------|------------------------|
| SHAP/LIME | 8 | 4 | För långsam beräkning; post-hoc; ej realtid |
| Model cards | 9 (dokumentation) | 6 | LLM:er saknar stabila, reproducerbara egenskaper |
| Drift detection | 7 | 4 | LLM:er driftar på oförutsägbara sätt |
| Attention visualization | 6 | 5 | Missvisande för komplex reasoning |

**Kompound-förklarbarhetsproblem:**
- Agent A anropar Agent B, som anropar Agent C
- Varje övergång introducerar ny osäkerhet
- Det slutliga beslutet är oförklarligt utifrån enskilda agentbidrag
- Ingen befintlig XAI-metod hanterar detta
- Relevant för kognitiva myndighetssystem (Deloitte Cognitive Government)

**System-level AI Audit — principen:**
Analogt med koncernrevision vs. dotterbolagsrevision:
- Granska **beslutskedjan** (vilken agent, vilket delbeslut, vilken konfidens, vilka inputs)
- Inte enbart enskilda modellers beteende
- Kräver: spårbarhet per agentanrop, bevarat state, dokumenterade handoffs

**Vad en System-level AI Audit behöver granska:**
1. Agentidentiteter och deras behörigheter
2. Beslutslogs med tidsstämplar och kausala kedjor
3. Datakällor per agent (RAG-sources, externa API:er)
4. Mänskliga övervakningspunkter och var de saknas
5. Felhantering och fallback-beteenden
6. EU AI Act-compliance per delkomponent (högrisk-AI?)

---

## Continuous Auditing — Tre-fas-modell

**Mandatfrågan (politisk nyckel):**
Brasiliens TCU lyckades med ALICE-systemet (400 dagar → 8 dagar) för att de hade **lagstadgat mandat att kräva dataaccesskontrakt** av granskade parter. Sveriges revisionsmyndigheter saknar detta mandat idag.

Den viktigaste enskilda åtgärden: **obligatoriska audit-hooks i upphandlingslagen**.

**Fas 1 — Semi-automatiserad batch (0–2 år):**
- AI-assisterad riskbaserad sampling ur befintliga system
- Kräver ingen ny infrastruktur
- Möjligt NU med befintliga verktyg
- Verktyg: MindBridge, DataSnipper AI Agents, Python-skript mot Agresso/Raindance

**Fas 2 — API-standardisering + micro-batch (2–4 år):**
- Obligatoriska audit-hooks i offentlig IT-upphandling
- Ena-infrastrukturen (Digg) som grund
- Dagliga batch-uttag möjliga
- Kräver regelverksändring i upphandlingsförordningen

**Fas 3 — Near-real-time streaming (4–7 år):**
- Apache Kafka/Flink-baserad streaming-arkitektur
- Realtid möjlig när API-standard finns
- Kräver lagändring i upphandlingslagen (analogt med TCU)
- EU PPDS som europeisk mall (operationell sept 2024; 250 000+ upphandlande myndigheter)

---

## Digitala bevis och autenticitet

**Verifieringskapabilitet som SAI behöver:**
- Sensity AI: genererar court-ready-rapporter för deepfake-detektion (tillgänglig 2026)
- EU AI Act Art. 50 (aug 2026): AI-genererat innehåll måste märkas
- YouTube expanderar deepfake-detektion till politiker och journalister (mars 2026)
- Kryptografisk signering av originalhandlingar (tidsstämplar, hash-baserad autenticitet)
- Policy behövs: SAIs behöver procedurer för att verifiera digital evidens

---

## Relevanta regleringsluckor

| Lucka | Status | Förväntad lösning |
|-------|--------|-------------------|
| Agent-till-agent-tillit i EU AI Act | Tyst i lagtexten | ENISA arbetar; inget ramverk före 2027 |
| KYA-standard för offentlig sektor | Saknas | Ingen känd initiativtagare |
| Cross-agent spårbarhet | Ingen standard | Branschinitiativ (A2A, SPIFFE) ej koordinerade |
| Mandat för dataaccesskontrakt | Saknas i Sverige | Kräver lagstiftning |
| Deepfake-verifiering i revisionsarbete | Inga SAI-riktlinjer | Varje SAI hanterar autonomt |

---

## Källor

- Google A2A Protocol (2025)
- SPIFFE/SPIRE (CNCF project): spiffe.io
- W3C Verifiable Credentials Data Model 2.0
- Deloitte Government Trends 2026: "Cognitive Government"
- Salesforce Agentic Government Insights 2026
- EU AI Act Art. 50 (transparency requirements for AI-generated content)
- EU AI Act Annex III (high-risk AI classification)
- Sensity AI: deepfake detection platform
- Brasil TCU ALICE: annual report 2023
- Fortune: "Voice Cloning Crossed the Indistinguishable Threshold" (dec 2025)
- Irland Electoral Commission: deepfake incident report (2025)
- EXP-451: Strategigruppsdialog KYA, april 2026
