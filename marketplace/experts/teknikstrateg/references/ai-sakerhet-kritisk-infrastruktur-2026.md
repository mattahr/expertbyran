# AI-säkerhet och hot mot kritisk infrastruktur — kunskapsbas 2026

Uppdaterad: 2026-04-28 | Källor: ENISA ETL 2025, IBM X-Force 2026, NIST AI 100-2e2025, WEF Cybersecurity Outlook 2025, NCSC Sverige, MSB

---

## Hur AI förändrar hotbilden för kritisk infrastruktur

### AI som offensivt verktyg

AI har dramatiskt sänkt tröskeln för sofistikerade cyberattacker mot kritisk infrastruktur:

**Adaptiv skadlig kod**
- Polymorf malware ändrar kontinuerligt sin filstruktur och kod för att undvika signaturbaserad detektering
- Nyttolaster anpassas dynamiskt baserat på målets identifierade sårbarheter
- Fileless attacks med AI-driven stealth-teknik

**AI-förstärkt social engineering**
- >80% av observerad social engineering-aktivitet var AI-stödd tidigt 2025 (ENISA ETL 2025)
- Deepfakes och syntetiska medier för identitetsstöld och BEC-attacker
- Jailbreakade modeller, syntetiska medier och model poisoning används aktivt av angripare

**Autonoma angreppsverktyg**
- Verktyg som "Xanthorox AI" (identifierat av ENISA 2025): autonomiserat social engineering och malware-utveckling
- IBM X-Force 2026: AI-drivna attacker eskalerar, angripare identifierar sårbarheter snabbare än försvaret täpper till dem

### Kritisk infrastruktur — strukturella sårbarhet

- OT-hot (Operational Technology) utgjorde 18,2% av alla identifierade hotkategorier i EU (ENISA 2025)
- SCADA-, PLC- och IoT-system designades primärt för tillförlitlighet, inte säkerhet — ett strukturellt problem
- 60% av intrång sker via tredjepartsåtkomstyektorer (supply chain)
- Z-PENTEST-ALLIANCE var ledande hacktivistgrupp riktad mot EU kritisk infrastruktur 2024–2025, fokus energisystem
- Nordiska och baltiska regioner: omfattande DDoS-kampanjer hösten 2024 mot energi, telekommunikation och statsförvaltning

### Hotaktörers konvergens

Gränserna suddas ut mellan hacktivister, cyberkriminella och statsunderstödda aktörer — delade verktyg, taktiker och infrastruktur (ENISA 2025). Denna konvergens försvårar attribuering och motåtgärder.

### ENISA Threat Landscape 2025 — nyckelstatistik

| Kategori | Data |
|----------|------|
| Analyserade incidenter | 4 875 (jul 2024–jun 2025) |
| OT-hot andel | 18,2% av alla hotkategorier |
| DDoS-andel av incidenter | 77% |
| AI-stödd phishing | >80% av social engineering |
| Top-sektor EU | Offentlig förvaltning (38,2%) |

---

## Adversarial AI — angrepp mot AI-system

### Angreppstyper (taxonomi enligt NIST AI 100-2e2025)

| Typ | Fas | Beskrivning |
|-----|-----|-------------|
| **Evasion** | Driftsättning | Manipulerade indata leder modellen att fatta fel beslut utan att det märks |
| **Poisoning** | Träning | Angripare kontrollerar träningsdata — inplantar bakdörrar eller skevar modellen |
| **Model inversion** | Driftsättning | Extrahera känslig information från modellens svar |
| **Backdoor** | Träning | Dold trigger aktiverar skadligt beteende i driftsatt modell |

### Skyddsmekanismer och deras begränsningar

Ingen enskild försvarsstrategi ger fullständigt skydd (ISACA 2025, Springer 2025):

1. **Adversarial training** — träna modellen med adversariella exempel; ökar robusthet men generaliserar dåligt till nya angreppsscenarier
2. **Input sanitization** — filtrera och validera indata vid inferenstid
3. **Anomalitetsdetektering** — övervaka modellbeteende vid driftsättning; kräver baslinje
4. **Ensemble-metoder** — kombinera flera modeller för robusthet mot enskilda attacker
5. **Kontinuerlig modellvalidering** — adversarial testing som löpande process, inte engångsåtgärd
6. **Strikt styrning och incidentrespons** — governance-protokoll och definierade responsplaner

**Utmaningar:**
- Befintliga försvar är skräddarsydda för specifika angreppsscenarier, generaliserar dåligt
- Robusta modeller har hög beräkningskostnad — svårt i resursbegränsade OT-miljöer
- Bristande transparens i black-box-modeller försvårar försvar och adversarial testning

---

## Regulatory landscape: EU AI Act × NIS2 × CRA

### Samspelet i ett diagram

```
EU AI Act (riskbaserat)
  └─ "Hög-risk"-system i kritisk infrastruktur (Art. 6, Annex III)
        ↓ Utlöser AUTOMATISKT
NIS2 (organisations-säkerhet)
  └─ AI-system i samhällsviktiga tjänster regleras via FUNKTION, inte tekniktyp
        ↓ Parallellt
CRA (Cyber Resilience Act)
  └─ Produktsäkerhetskrav på uppkopplade enheter och mjukvara
```

### NIS2-direktivet (enforcement sedan okt 2024)

- Täcker: energi, transport, bank, hälsa, digital infrastruktur, vattenförsörjning, rymdfart
- Krav: incidentrapportering (24h initial/72h detaljerad), supply chain-säkerhet, tekniska säkerhetsåtgärder
- AI ingår i scope via tjänstens funktion — en AI-baserad nätoptimering hos energibolag = NIS2-scope
- Påföljder: upp till 10 mkr EUR eller 2% av global omsättning

### EU AI Act — hög-risk och kritisk infrastruktur

- Hög-risk-definitioner: Annex III inkluderar AI för styrning av kritisk infrastruktur (elnät, vattenförsörjning, vägtransport m.fl.)
- Krav på hög-risk-system: riskhanteringssystem, teknisk dokumentation, loggning, transparens, mänsklig tillsyn, cybersäkerhet
- Incidentrapportering: "allvarliga incidenter" rapporteras till nationell marknadstillsynsmyndighet utan onödigt dröjsmål, max 15 dagar
- Tidslinje: Hög-risk-regler fullt i kraft 2 aug 2026 (privat sektor); offentliga myndigheter 2 aug 2030

### Compliance-utmaningen

En enda incident i ett AI-system som ingår i kritisk infrastruktur kan utlösa:
- NIS2-rapportering (24h/72h)
- EU AI Act-rapportering (15 dagar)
- Eventuellt CRA-rapportering
- GDPR-rapportering om persondata berörs

→ Organisationer behöver koordinerade rapporteringsprocesser, inte separata silos.

---

## Svensk kontext (2025–2026)

| Aktör | Relevans |
|-------|----------|
| **NCSC** (Nationellt cybersäkerhetscenter) | Löpande hotbilsrapporter; rapport 2025 visar ökande attacker mot kritisk infrastruktur |
| **MSB** → **FRA** | Regeringen beslutat att FRA tar över delar av MSB:s cybersäkerhetsoperationer |
| **Nationell cybersäkerhetsstrategi 2025–2029** | Uppdaterad handlingsplan antagen; FRA central aktör |

**Hotbildsstatistik Sverige 2025:**
- ~1/3 av alla DDoS-attacker riktade mot kritisk infrastruktur (NCSC-rapport)
- Ransomware +183% YoY
- Identitetsbaserade attacker +32% (driven av AI-automation)
- Cyberrelaterade förluster >30 miljarder kronor
- MSB erhöll 30 mkr för kartläggning av kommuners tekniska cybersäkerhetskapacitet

---

## Granskningsfrågor för revisionsmyndigheter

Dessa frågor är direkt operationaliserbara i en effektivitetsgranskning:

1. **AI-system i kritisk infrastruktur**: Har myndigheten identifierat och klassificerat AI-system som kan utgöra "hög-risk" enligt EU AI Act Annex III?
2. **NIS2-efterlevnad**: Har myndigheten implementerat de tekniska och organisatoriska säkerhetsåtgärder som NIS2 kräver? Finns dokumenterade incidentresponsplaner?
3. **Supply chain-säkerhet**: Hur kontrolleras att tredjepartsleverantörer av AI-system uppfyller säkerhetskrav? (60% av intrång sker via tredjepartsåtkomst)
4. **Adversarial testing**: Genomförs löpande adversarial testing av AI-system som styr kritisk infrastruktur?
5. **Koordinerad incidentrapportering**: Har myndigheten en process för koordinerad rapportering under NIS2, EU AI Act och GDPR vid en enda incident?
6. **OT-säkerhetsglapp**: Hur adresserar myndigheten det strukturella säkerhetsglappet i OT-system (SCADA/PLC/ICS) som designats utan säkerhetsfokus?

---

## Källor

### Primärkällor — rapporter
- [ENISA Threat Landscape 2025](https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025) — Analysar 4 875 incidenter jul 2024–jun 2025
- [IBM X-Force Threat Index 2026](https://newsroom.ibm.com/2026-02-25-ibm-2026-x-force-threat-index-ai-driven-attacks-are-escalating-as-basic-security-gaps-leave-enterprises-exposed)
- [WEF Global Cybersecurity Outlook 2025](https://reports.weforum.org/docs/WEF_Global_Cybersecurity_Outlook_2025.pdf)
- [NIST AI 100-2e2025](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-2e2025.pdf) — Adversarial ML taxonomi och terminologi

### Regulatoriska källor
- [NIS2 vs EU AI Act — överlapp (isms.online)](https://www.isms.online/nis-2/vs/eu-ai-act/)
- [Darktrace: NIS2-implikationer på AI](https://www.darktrace.com/blog/the-implications-of-nis2-on-cyber-security-and-ai)

### Sverige
- [NCSC Sverige](https://www.ncsc.se/)
- [Voister: NCSC-rapport 2025 — attacker ökar](https://www.voister.se/artikel/2025/04/ncsc-rapport-attacker-mot-kritisk-infrastruktur-okar/)
- [MSB cybersäkerhetspolicy](https://www.msb.se/siteassets/dokument/amnesomraden/informationssakerhet-cybersakerhet-och-sakra-kommunikationer/72e-policy-for-utveckling-och-integrering-av-ny-cybersakerhetsteknologi-251019.pdf)
