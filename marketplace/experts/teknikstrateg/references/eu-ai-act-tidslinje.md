# EU AI Act — Tidslinje och SAI-implikationer

Uppdaterad april 2026. Inkluderar kritisk korrigering: offentliga myndigheter har förlängd implementationstid till 2030, INTE 2026.

---

## Kritisk distinktion: Privat sektor vs. Offentlig sektor

⚠️ **VANLIGT FEL:** Många analyser anger 2 aug 2026 som deadline för alla. Det stämmer bara för privat sektor.

| Aktör | Högrisk-AI compliance deadline |
|-------|-------------------------------|
| Privat sektor | **2 AUGUSTI 2026** |
| **Offentliga myndigheter** | **2 AUGUSTI 2030** |

Källa: EU AI Act (Regulation 2024/1689), Art. 111 + Recital 150

---

## Komplett tidslinje

| Datum | Milstolpe | Gäller |
|-------|-----------|--------|
| Feb 2025 | Förbud mot oacceptabel risk-AI träder i kraft | Alla |
| Aug 2025 | Transparenskrav för GPAI-modeller (art. 53) | Alla |
| Feb 2026 | Krav på AI Literacy och kompetens (art. 4) | Alla |
| **2 aug 2026** | **Högrisk-AI (Annex III) — compliance-deadline** | **Privat sektor** |
| Dec 2026 | EUDI Wallet (eIDAS 2.0) — alla EU-länder måste erbjuda | Alla EU-stater |
| Dec 2027 | Ev. uppskjuten deadline (Digital Omnibus förslag) | Privat sektor |
| **2 aug 2030** | **Högrisk-AI (Annex III) — compliance-deadline** | **Offentliga myndigheter** |

**Not om Digital Omnibus:** EU-kommissionen föreslog i slutet av 2025 att skjuta upp högrisk-krav till december 2027. Status är oklart. Organisationer bör planera för den ursprungliga deadlinen aug 2026.

---

## Högrisk-AI (Annex III) — Tillämpningsområden

Högrisk-AI inkluderar (urval med SAI-relevans):
- AI i rekrytering och arbetslivsbeslut
- AI i kreditbeslut och finansiell bedömning
- AI i utbildning och antagning
- AI i rättsväsende och brottsbekämpning
- AI i gränskontroll och migration
- AI i demokratiska processer
- Biometrisk identifiering (med undantag)

**SAI-relevans:** SAIs behöver granska att granskade organisationers AI-system uppfyller Annex III-krav. Ny granskningsdomän som öppnar sig 2026.

---

## Krav på högrisk-AI-system

Alla högrisk-AI-system måste ha:
1. **Riskhanteringssystem** — löpande under hela livscykeln
2. **Datastyrning** — träningsdata, valideringsdata, testdata dokumenterade
3. **Teknisk dokumentation** (Annex IV) — fullständig redogörelse
4. **Automatisk loggning** — händelselogg under drift
5. **Transparens mot användare** — instruktioner, kapabilitet, begränsningar
6. **Mänsklig tillsyn** — mekanismer för ingripande
7. **Robusthet och noggrannhet** — testade prestanda- och säkerhetsmått
8. **Konformitetsbedömning** — intern eller tredjepartsgranskning
9. **CE-märkning** — obligatorisk efter godkänd bedömning
10. **Registrering i EU AI-databas** — offentligt register

**Böter:**
- Högrisk-AI-överträdelser: upp till **€35 miljoner eller 7%** av global omsättning
- GPAI-modeller (inkl. GPT-4-klass): upp till **€15 miljoner eller 3%**
- Felaktig information till myndigheter: **€7,5 miljoner eller 1%**

---

## AI Governance-verktyg (XAI-ekosystem)

Verktyg som krävs för att uppfylla AI Act-krav:

| Verktyg | Funktion | TRL statisk ML | TRL LLM |
|---------|----------|---------------|---------|
| SHAP | Förklarbarhet per feature | 8 | 4 |
| LIME | Lokal approximationsförklaring | 8 | 4 |
| Model cards | Standardiserad modeldokumentation | 9 | 6 |
| MLflow / W&B | MLOps och experiment-tracking | 8–9 | 7 |
| AI-BOM (Bill of Materials) | Inventering av AI-komponenter | 5–6 | 4 |
| Drift detection | Övervakning av modellprestandafall | 7 | 4 |
| Red teaming | Adversariell testning | 6–7 | 6–7 |

**Gartner:** 60% av stora företag antar AI governance-verktyg fokuserade på förklarbarhet till 2026.

---

## eIDAS 2.0 — EUDI Wallet

| Datum | Krav |
|-------|------|
| 20 maj 2024 | Reg. (EU) 2024/1183 träder i kraft |
| **31 dec 2026** | **Alla EU-länder måste erbjuda minst en EUDI Wallet** |
| Från 2027 | Obligatoriskt att acceptera wallets i bred offentlig och privat sektor |

**Tekniska egenskaper:**
- Data lagras lokalt på enheten
- Noll spårning ("zero tracking") by design
- Fyra genomförandeförordningar sätter tekniska standarder för interoperabilitet

**SAI-implikation:** Digital identitet påverkar hur medborgare interagerar med offentlig sektor. Skapar nya dataspår och frågor om integritet, säkerhet och myndigheters hantering av digitala identiteter.

---

## Sovereign AI — Nationella alternativ till US-modeller

Europeiska initiativ som SAIs bör känna till:

| Initiativ | Land | Status (2026) | Parametrar |
|-----------|------|--------------|------------|
| SOOFI | SE/DE | Planerad Q3 2026 | 100 mdr |
| Amalia | Portugal | Beta, mid-2026 | Öppen källkod |
| PLLuM | Polen | Pågår | — |
| Alia | Spanien | Skattemyndighetsapp | Flerspråkig |
| EU AI Factories | EU | Operationell | 19 anläggningar + EuroHPC |

**EU AI Factories:** 19 EU-finansierade anläggningar med EuroHPC supercomputers — gratis GPU-tillgång för europeiska startups och forskning.

---

## Nationella AI-sandboxar (EU AI Act krav)

EU AI Act kräver att varje EU-land etablerar minst en **nationell AI-sandbox** för testning av högrisk-AI-system i kontrollerad miljö. Deadline för etablering: aug 2026.

Syftet: möjliggöra innovation medan AI-system testas mot regulatoriska krav innan marknadslansering.

---

## SAI:s roll i AI Act-efterlevnad

**Vad SAIs kan/bör granska:**
1. Myndigheters AI-register: dokumenteras alla AI-system korrekt?
2. Riskklassificering: bedöms AI-system korrekt mot Annex III?
3. Konformitetsbedömningar: är de genomförda och uppdaterade?
4. Mänskliga tillsynsmekanismer: fungerar de i praktiken?
5. Loggning och spårbarhet: kan beslut rekonstrueras?
6. Privat sektors compliance (aug 2026): är de registrerade i EU AI-databasen?

**Kompetens SAIs behöver:**
- AI-revisorer med teknisk förståelse för ML-pipelines
- Red team-analytiker (testning av AI-robusthet)
- XAI-specialister (SHAP, LIME, kontraintuitive testing)
- Juridisk kompetens om AI Act tillämpning

---

## Källor

- EU AI Act (Regulation 2024/1689), OJ L 2024/1689
- artificialintelligenceact.eu (officiell tolkningsresurs)
- European Commission: AI Act Implementation Roadmap
- ENISA: AI Cybersecurity Guidance 2025
- Reg. (EU) 2024/1183 (eIDAS 2.0)
- EU Commission: Digital Omnibus proposal (2025)
- EXP-450, EXP-451: Omvärldsbevakning april 2026
