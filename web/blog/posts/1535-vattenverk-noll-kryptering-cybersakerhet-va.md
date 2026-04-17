Sveriges dricksvattenförsörjning vilar på 200 000 kilometer kommunala VA-ledningar och 1 535 vattenverk — en infrastruktur som betjänar varje hushåll, sjukhus och skola i landet. Det är samhällskritisk verksamhet av högsta dignitet.

Samtidigt styrs denna infrastruktur av industriella styrsystem (SCADA) som designades för tillförlitlighet, inte säkerhet. Protokollen som styr vattenpumpar, reningsverk och distributionsnät — Modbus (1979), DNP3 (1993), Profibus (1989) — saknar inbyggd autentisering och kryptering. En Modbus-frame kan inte bära kryptografi utan att hela systemet byts ut.

Denna analys undersöker skärningspunkten mellan VA-infrastrukturens investeringsskuld och det cyberhotlandskap som kommunal kritisk infrastruktur möter 2026.

## Protokollnivån är problemets kärna

Industriella styrsystem har en livscykel på 20 år eller mer. De var aldrig tänkta att vara uppkopplade mot internet. Men av effektivitetsskäl har de flesta SCADA-system nu anslutits via TCP/IP-konverterare — det som säkerhetsforskare kallar *air-gap-erosion*.

SOU 2021:63 (*Sveriges säkerhet*) konstaterar:

> Stora delar av den samhällsviktiga infrastrukturen har industriella informations- och styrsystem som är uppkopplade mot internet. Många av dessa system är äldre och har därför ofta sårbarheter som en hotaktör kan utnyttja.

Antalet ICS-specifika sårbarheter ökar kraftigt. Systemen kan inte säkerhetsuppdateras utan driftstopp — och ett vattenverk kan inte stängas för uppgradering.

## SCADA-operatörer styr från hemmet

Dricksvattenutredningen (SOU 2016:32) dokumenterade en anmärkningsvärd bild: SCADA-operatörer övervakar och fjärrstyr pumpar, ventiler och nätfunktionalitet från centrala arbetsplatser — som "inte alltid är en skyddad driftcentral, utan kan utgöras av en bärbar dator i hemmet".

Information om sårbara punkter genom kartor och ritningar kan delvis nås via nätet. Identifiering av inträffade händelser och informationsbehandling saknas i stor utsträckning.

Shodan.io — sökmotorn för uppkopplade enheter — indexerar exponerade SCADA-system i realtid, inklusive svenska. Detta är inte teori utan dokumenterad verklighet.

## Internationella incidenter som referenspunkter

Oldsmar, Florida 2021: en operatör såg musen röra sig av sig själv på SCADA-skärmen. Någon hade fjärranslutit sig och justerat natriumhydroxid till 111 gånger normal nivå. Incidenten upptäcktes av en alert operatör — inte av något säkerhetssystem.

Colonial Pipeline 2021: en IT/OT-konvergens möjliggjorde den attack som stängde bränsleförsörjningen på USA:s östkust i sex dagar.

I Sverige rapporterade MSB:s CERT-SE under 2024 om ökade skanningar mot kommunal infrastruktur. Hotbilden är inte hypotetisk.

## NIS2-paradoxen: reglering som möter tekniska begränsningar

Den 15 januari 2026 trädde Sveriges nya cybersäkerhetslag i kraft — implementeringen av EU:s NIS2-direktiv. Lagen utökar antalet omfattade sektorer från 7 till 18. Dricksvatten och avloppsvatten är nu explicit reglerade.

NIS2 kräver:
- Incidentrapportering inom 24 timmar
- Riskhanteringsåtgärder baserade på aktuell hotbild
- Säkerhetsövervakning av IT- och OT-system

Den nationella cybersäkerhetsstrategin 2025–2029 (Skr. 2024/25:121) sätter ett mål för 2030: OT-skyddet ska dimensioneras utifrån infrastrukturens samhällsbetydelse och hotbild.

Paradoxen är att legacy OT-system *inte kan* uppfylla ZTA-principer (Zero Trust Architecture). Patch-cykler för industriella styrsystem är 10–15 år, jämfört med 3–6 månader för enterprise IT. Protokollen saknar stöd för kryptering och autentisering. Det handlar inte om bristande vilja — det handlar om teknisk omöjlighet utan fullständigt systembyte.

Realistisk bedömning: NIS2-compliance för kommunal OT-infrastruktur är 5–10 år bort.

## Investeringsskulden: 31 miljarder per år

Cybersäkerhetsgapet existerar inte i vakuum. Det sammanfaller med en massiv investeringsskuld i den fysiska VA-infrastrukturen.

Svenskt Vatten beräknar det totala investeringsbehovet till **31,3 miljarder kronor per år** under perioden 2022–2040. Hälften av ledningsnätet härstammar från 1960- och 70-talen. Förnyelsetakten ligger på 0,4 procent — behovet är minst 0,7 procent.

Riksrevisionen konstaterade i RiR 2025:2 (*Tillgången till kommunalt vatten och avlopp*) att staten i för liten utsträckning har säkerställt att kommunerna underhåller och förnyar sina VA-anläggningar. Länsstyrelsernas tillsyn är otillräcklig. Statlig vägledning för vattentjänstplaner har inte tagits fram trots att regeringen själv identifierade behovet.

SOU 2024:82 (*Ökad VA-beredskap*) föreslår etappmål: alla kommuner ska ha kartlagt och planerat förnyelse senast 2030, och den nationella förnyelsetakten ska nå minst 1 procent till 2040.

I denna investeringskö saknar cybersäkerhet hittills prioritering.

## Tre dolda riskfaktorer

### Leverantörernas fjärråtkomst
SCADA-leverantörer som Schneider Electric, Siemens och ABB tillhandahåller inbyggd fjärraccess för service och underhåll. Tekniskt är dessa inte bakdörrar — men de fungerar som externa anslutningspunkter. Remote access-portar utan stark autentisering ger en anslutningsväg som sällan övervakas.

### Insider-exponering
Kommunala driftoperatörer har ofta direktaccess till SCADA-system utan multifaktorautentisering. I en tid av ökade insiderhot — och med den nationella hotbilden som MSB beskriver — är detta en sårbarhet som sällan uppmärksammas.

### Fragmenterad styrning
290 kommuner ansvarar var och en för sin VA-infrastruktur. OECD har kritiserat fragmenteringen. Ingen myndighet har helhetsansvar för cybersäkerheten i kommunal VA. MSB ansvarar för cybersäkerhet generellt, Livsmedelsverket för dricksvattenkvalitet, länsstyrelserna för tillsyn av vattentjänstlagen — men ingen granskar cyber-exponeringen systematiskt.

## Möjliga åtgärder

**Kort sikt (0–2 år):**
- Nationell kartläggning av SCADA-exponering i alla 1 535 vattenverk — idag finns ingen samlad bild
- Obligatorisk nätverkssegmentering: separera OT-nät från internet-ansluten IT
- Incidentövningar specifikt för VA-cyberscenarier

**Medellång sikt (2–5 år):**
- Krav på krypterad kommunikation i alla nyupphandlade styrsystem
- Centraliserad säkerhetsövervakning (SOC) för kommunal kritisk infrastruktur — 290 kommuner kan inte ha var sin
- 5G private networks som migrationsväg för OT-kommunikation (medför dock ny attackyta som behöver hanteras)

**Lång sikt (5–10 år):**
- Fullständig migration från legacy-protokoll till säkerhetsdesignade alternativ
- Eventuellt statligt övertagande av VA-infrastruktur av nationell betydelse, som SOU 2024:82 antyder

## En granskning som saknas

Riksrevisionen har granskat VA-infrastrukturens fysiska tillstånd (RiR 2025:2). Men cybersäkerheten i samma infrastruktur har inte granskats systematiskt. Den centrala frågeställningen:

*Är NIS2-compliance ens tekniskt möjlig för befintliga SCADA-installationer i Sveriges 1 535 vattenverk — och om inte, vilken interimstrategi har kommunerna för att hantera den cyberrisk som föreligger?*

Exponeringen handlar inte om sofistikerade zero-day-attacker. Det handlar om system utan lösenord, utan kryptering, utan loggning — anslutna till internet via en TCP/IP-konverterare.

---

*Denna analys bygger på ett samarbete mellan policyanalys och teknisk OT-säkerhetskompetens. Källor inkluderar SOU 2016:32, SOU 2021:63, SOU 2024:18, SOU 2024:82, RiR 2025:2, Prop. 2025/26:28, Skr. 2024/25:121, samt internationell OT-säkerhetsforskning.*
