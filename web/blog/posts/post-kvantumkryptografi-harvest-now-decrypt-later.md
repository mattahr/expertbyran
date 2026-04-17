# Post-kvantumkryptografi och harvest now, decrypt later — nuläge och beredskap

Den kryptografi som skyddar skattedeklarationer, folkbokföringsdata och försvarsunderrättelser bygger på ett enkelt antagande: att det finns matematiska problem som tar så lång tid att lösa att det är praktiskt omöjligt. Det antagandet håller för dagens datorer. En ny typ av dator är dock under utveckling som potentiellt kan bryta hela fundamentet. Den mest kritiska aspekten är inte att kvantdatorn ännu saknar tillräcklig kapacitet, utan att angripare redan idag samlar in krypterad data för att dekryptera den när tekniken väl är mogen.

Det innebär att migrationen till kvantresistent kryptografi behöver påbörjas nu.

## "Harvest now, decrypt later" — ett hot som redan är verklighet

Kvantdatorns praktiska genombrott ligger sannolikt tio till femton år bort. Det spelar dock ingen roll för den data som samlas in idag.

Aktörer med tillräckliga resurser — statliga underrättelsetjänster, välfinansierade kriminella nätverk — kan idag skörda krypterad trafik och lagra den. Tekniken kallas *harvest now, decrypt later* (HNDL). Logiken är enkel: om ett dokument med en giltighetstid på tjugo år krypteras med RSA-2048 idag, och en tillräckligt kraftfull kvantdator finns tillgänglig om femton år, är dokumentet redan exponerat — utan att det märks.

Det amerikanska National Security Agency har bedömt att RSA och ECDSA (elliptisk kurva) utgör en oacceptabel säkerhetsrisk i kryptografiska system avsedda för nationell säkerhet. NSA:s tidslinje specificerar att RSA och ECDSA ska vara *deprecated* senast 2030 och förbjudna i känsliga system från 2035 (NSA CNSA 2.0, 2022). Tidslinjerna utgör planeringshorisonter för statliga aktörer.

## NIST har satt standarden — implementationsfasen har inletts

I augusti 2024 publicerade det amerikanska National Institute of Standards and Technology de tre första standarderna för post-kvantumkryptografi (PQC):

- **FIPS 203** — ML-KEM (baserat på CRYSTALS-Kyber) för nyckelutbyte och kryptering
- **FIPS 204** — ML-DSA (baserat på CRYSTALS-Dilithium) för digitala signaturer
- **FIPS 205** — SLH-DSA (baserat på SPHINCS+) för hashbaserade signaturer

Dessa algoritmer är konstruerade för att vara resistenta mot attacker från kvantdatorer. De har granskats i ett decennelangt offentligt valideringsarbete och utgör nu den globala standarden för kvantresistent kryptering.

Standarderna är ett nödvändigt villkor, men inte ett tillräckligt sådant. För Sverige gäller nu frågan om implementation.

## Banken för internationella betalningar pekar på komplexiteten

Bank for International Settlements (BIS) driver sedan 2024 *Project Leap* — ett internationellt initiativ för att testa PQC-migration i finansiella system (BIS Working Paper, 2024). Projektet syftar till att identifiera de tekniska, operativa och styrningsrelaterade hinder som uppstår när centralbankssystem och betalningsinfrastruktur migreras till kvantresistenta algoritmer.

Slutsatsen från Project Leap är belysande: migrationen är tekniskt möjlig, men komplexiteten underskattas systematiskt. Integrationspunkter är fler än organisationer inser, äldre system (*legacy*) skapar oväntat höga kostnader, och kompetensen att genomföra migrationen är en knapp resurs.

Om detta gäller finansiella system med relativt väldefinierad arkitektur, är utmaningen sannolikt ännu större i den heterogena IT-miljö som kännetecknar svensk offentlig förvaltning.

## Svensk offentlig sektor — exponering och beredskapsläge

Sveriges nationella kvantstrategi och den nationella cybersäkerhetsstrategin (NCSS 2025–2029) identifierar kvantsäker kryptografi som ett prioriterat område (Regeringskansliet, 2024). Identifiering och implementation är dock inte samma sak.

En rimlig bedömning är att en betydande andel av de statliga system som idag hanterar sekretessklassad information med sekretessgrunder om tio år eller längre — folkbokföring, socialförsäkring, hälsodata, försvarsunderlag — inte har påbörjat inventering av sina kryptografiska beroenden. Ännu färre har definierat en migrationstidslinje.

Det är ett strukturellt problem med tre dimensioner:

**Kompetensunderskott.** PQC-kompetens är extremt sällsynt. Att bedöma vilka kryptografiska primitiver ett system använder, och hur de ska bytas ut utan att bryta befintlig funktionalitet, kräver specialiserad teknisk kompetens som få myndigheter har internt.

**Inventeringsluckor.** Många myndigheter saknar fullständig bild av sina kryptografiska beroenden — vilka algoritmer som används, i vilka system, och med vilka integrationer mot externa aktörer. Utan inventering är migration omöjlig att planera.

**Prioriteringskonkurrens.** HNDL-hotet är svårt att kommunicera: skadan uppstår i framtiden, angriparen syns inte, och konsekvenserna kan inte mätas förrän det är för sent. Det konkurrerar med mer synliga och omedelbara krav och tenderar att prioriteras ned.

## Möjliga vägar framåt

NIST:s PQC-standarder och NSA:s tidslinje ger en tydlig referenspunkt. Samma logik som det amerikanska försvaret tillämpar kan överföras: systemen med längst sekretessperioder och högst skyddsvärde bör migreras först.

Det kräver tre parallella spår:

1. **Kryptografisk inventering** — alla myndigheter som hanterar information med sekretessgrunder bortom 2035 bör genomföra en systematisk inventering av kryptografiska algoritmer och integrationer.

2. **Kompetensuppbyggnad** — MSB, FRA och NCSC bör koordinera utbildningsinsatser och samnyttja den begränsade PQC-kompetens som finns i Sverige, i stället för att varje myndighet söker kompetensen individuellt.

3. **Granskningsberedskap** — den myndighet som har i uppdrag att bedöma statliga myndigheters interna styrning och kontroll bör ta fram metodik för att bedöma om myndigheter aktivt hanterar kryptografisk sårbarhet. Det är en ny typ av IT-granskning, men principen är densamma: risk måste identifieras och hanteras — inte ignoreras tills den materialiseras.

HNDL-problemet påminner om klimatpolitikens grunddilemma: kostnaden för att agera betalas idag, skadan av att inte agera uppstår imorgon. Till skillnad från klimatfrågan är det kryptografiska problemet tekniskt lösbart — standarderna finns, tekniken finns, och tidslinjen är känd. Det som saknas är systematisk styrning och prioritering.

Kvantdatorn befinner sig sannolikt ett decennium bort. Exponeringen av data med lång sekretess pågår redan nu.

---

## Källor

- NSA, *Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)*, september 2022.
- NIST, *FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard*, augusti 2024.
- NIST, *FIPS 204: Module-Lattice-Based Digital Signature Standard*, augusti 2024.
- NIST, *FIPS 205: Stateless Hash-Based Digital Signature Standard*, augusti 2024.
- BIS, *Project Leap: Quantum-proofing the financial system*, Working Paper nr 1164, 2024.
- Regeringskansliet, *Nationell strategi för cybersäkerhet 2025–2029*, 2024.
- Regeringskansliet, *Sveriges nationella kvantstrategi*, 2024.
