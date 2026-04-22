# Post-kvantumkryptografi (PQC) — Migrationsguide och riskanalys

Uppdaterad april 2026. Standarder klara. Migration pågår globalt. "Harvest now, decrypt later" är ett reellt hot idag.

---

## Varför detta är brådskande — NU, inte om tio år

**Harvest now, decrypt later:**
Antagonister samlar in krypterat data idag, i väntan på att kvantdatorer mognar och kan dekryptera det retroaktivt. Data med >10 års sekretess (underrättelser, hälsojournaler, finansiella positioner, statshemligheter) är exponerat i detta nu.

**Sannolikheter (Citi Institute 2025):**
- Kryptobrytande kvantkalkyl till 2034: **19–34%**
- Kryptobrytande kvantkalkyl till 2044: **60–82%**
- 87% av organisationer globalt är oroade för harvest-now-hotet

**Ekonomisk riskexponering:**
Citi Institute bedömer att ett kvantangrepp på en major US-bank kan utlösa systemisk instabilitet med **2,0–3,3 biljoner USD** i BNP-förlust.

---

## NIST-standarder (klara aug 2024)

| Standard | Algoritm | Tillämpning | Status |
|----------|----------|-------------|--------|
| FIPS 203 | ML-KEM (Kyber) | Nyckelinkapsling / Key Exchange | **Publicerad aug 2024** |
| FIPS 204 | ML-DSA (Dilithium) | Digitala signaturer | **Publicerad aug 2024** |
| FIPS 205 | SLH-DSA (SPHINCS+) | Digitala signaturer (hash-baserat) | **Publicerad aug 2024** |
| FIPS 206 | FN-DSA (FALCON) | Digitala signaturer (lattice) | **Väntad 2026** |

**Strategiskt val:**
- För **nyckelinkapsling**: ML-KEM (Kyber) — rekommenderat val
- För **signaturer**: ML-DSA (Dilithium) primärt; SLH-DSA som backup (konservativare, hashbaserat)
- **Hybridläge** rekommenderas under migration: klassisk + PQC parallellt

---

## Tekniska utmaningar vid migration

| Utmaning | Beskrivning | Implikation |
|----------|-------------|-------------|
| Större nycklar | ML-KEM offentlig nyckel: ~1184 bytes (vs. ECDH: 64 bytes) | Prestanda-overhead i TLS, SSH |
| Bandbredd | ML-DSA signaturer: ~3300 bytes (vs. ECDSA: 64 bytes) | Nätverksbelastning |
| HSM-kompatibilitet | Hårdvarusäkerhetsmoduler behöver firmware-uppdatering | Lång ledtid, kritisk infrastruktur |
| PKI-infrastruktur | CA-certifikat, OCSP, CRL måste migrera | Komplex, global koordinering |
| Legacy-protokoll | TLS 1.2, SSH, S/MIME, IPsec måste PQC-anpassas | IETF-standarder under arbete |
| Protokollkompatibilitet | TLS 1.3 är grund för PQC-integration | TLS 1.3 är minimumkrav |

---

## Globala tidslinjer

### USA (Federal)
- **NIST IR 8547:** Migreringsplan för federala myndigheter
- **TLS 1.3 + PQC** krävs av US federal agencies: **1 januari 2030**
- NSA-tidslinje: RSA/ECDSA **deprecerat 2030**, **förbjudet 2035**
- CISA + NSA publicerar lista på quantum-safe produktkategorier (dec 2025)

### Europa
- **G7 Cyber Expert Group:** Gemensam PQC-färdplan finanssektor jan 2026
- **Högrisk-system:** PQC-migration klar 2030 (Europa)
- **BIS Project Leap:** PQC testat i produktionsbetalningssystem (ECB, Bundesbank) — migration tekniskt möjlig

### Sverige
- **FRA:** Ansvarig för kvantsäkert signalskydd
- **NCSS 2025–2029:** Kvantsäker kryptografi explicit nationellt mål
- **VR, U2024/01451:** Nationell kvantstrategi
- Upphandling av IT-system bör inkludera PQC-krav REDAN NU

---

## BIS Roadmap — Tre faser

**Fas 1 (2025–2026) — Inventering:**
- Identifiera alla system som använder klassisk kryptografi
- Prioritera utifrån datas känslighet och livslängd
- Skapa kryptoinventering (Crypto Bill of Materials)

**Fas 2 (2026–2028) — Migrationsplanering:**
- Prioritera system med känslig data med lång hållbarhet
- Upprätta hybrid-strategi (klassisk + PQC parallellt)
- Upphandla PQC-kompatibla leverantörslösningar
- Uppdatera kravspecifikationer och upphandlingsdokument

**Fas 3 (sent 2020-tal) — Aktiv migration:**
- Rulla ut PQC i produktionssystem
- Deprecera RSA/ECDSA
- Verifiera end-to-end PQC-skydd

---

## Praktisk checklista för offentlig sektor

**Omedelbart (2026):**
- [ ] Inventera kryptografianvändning i alla IT-system
- [ ] Identifiera data med >10 års sekretess
- [ ] Bedöm leverantörers PQC-planer (när levererar de FIPS 203/204/205-stöd?)
- [ ] Inkludera PQC-krav i nya IT-upphandlingar

**Kort sikt (2026–2028):**
- [ ] Aktivera hybridläge i TLS-infrastruktur
- [ ] Uppgradera HSM:er till PQC-stödjande firmware
- [ ] Testa PQC i dev/staging-miljöer
- [ ] Utbilda säkerhetspersonal i PQC-algoritmer

**Medellång sikt (2028–2030):**
- [ ] Migrerat högrisk-system till PQC
- [ ] Uppdaterat PKI-infrastruktur (CA, OCSP, CRL)
- [ ] Fasat ut RSA/ECDSA i högrisk-sammanhang

---

## SAI-implikationer

**Vad revisionsmyndigheter bör granska:**
1. Har myndigheter genomfört kryptoinventering?
2. Finns PQC-migrationsplan med tidslinje?
3. Inkluderar nya IT-upphandlingar PQC-krav?
4. Identifieras "harvest now, decrypt later"-exponering?
5. Har leverantörer av kritiska system FIPS 203/204/205-stöd på tidslinje?

**Varning:** Saknar en myndighet en PQC-plan 2026 är det en signifikant risk. Data som krypteras idag kan vara dekrypterat om 10–15 år.

---

## Quantum Computing — Teknikmognad

| System | Antal qubits | Felnivå | Praktisk kryptobrytning? |
|--------|-------------|---------|--------------------------|
| IBM Condor (2023) | 1 121 | ~0,1–1% | Nej — kräver milj. logiska qubits |
| Google Willow (2024) | 105 | Drastiskt reducerat | Nej — demonstrerar felkorrektion |
| Kryptobrytning RSA-2048 | ~4 000 | <0,001% | 10–15 år från idag (NIST-bedömning) |

**Slutsats:** Kvantkryptobrytning är inte omedelbar, men migration av stor infrastruktur tar 10–15 år — vi måste börja NU.

---

## Källor

- NIST FIPS 203, 204, 205 (aug 2024)
- NIST FIPS 206 (FALCON, väntad 2026)
- NIST IR 8547: Migration to Post-Quantum Cryptography
- Citi Institute: "Quantum Cyber Risk" (2025)
- BIS: "Quantum-readiness for the Financial System: A Roadmap" (juli 2025)
- BIS Project Leap: post-quantum cryptography in payment systems
- G7 Cyber Expert Group: PQC Roadmap Financial Sector (jan 2026)
- NSA: Commercial National Security Algorithm Suite 2.0
- IETF: TLS 1.3 + PQC draft standards (2025–2026)
- Nationell cybersäkerhetsstrategi 2025–2029 (Sverige)
- FRA: Kvantsäkerhet och signalskydd
- VR, U2024/01451: Nationell kvantstrategi Sverige
