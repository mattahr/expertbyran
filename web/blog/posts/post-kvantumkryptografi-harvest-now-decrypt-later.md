# Ditt lösenord är säkert idag — men är det säkert om tio år?

Den kryptografi som skyddar skattedeklarationer, folkbokföringsdata och försvarsunderrättelser bygger på ett enkelt antagande: att det finns matematiska problem som tar så lång tid att lösa att det är praktiskt omöjligt. Det antagandet håller — för dagens datorer. Men en ny typ av dator är på väg som kan bryta hela fundamentet. Det allvarligaste är inte att kvantdatorn inte finns än. Det allvarligaste är att angripare redan i dag samlar in krypterad data för att dekryptera den när tekniken väl är mogen.

Den migrationen måste börja nu.

## "Harvest now, decrypt later" — ett hot som redan är verklighet

Kvantdatorns praktiska genombrott ligger sannolikt tio till femton år bort. Men det spelar ingen roll för den data som samlas in i dag.

Aktörer med tillräckliga resurser — statliga underrättelsetjänster, välfinansierade kriminella nätverk — kan i dag skörda krypterad trafik och lagra den. Tekniken kallas *harvest now, decrypt later* (HNDL). Logiken är enkel: om du i dag krypterar ett dokument med en giltighetstid på tjugo år med RSA-2048, och en tillräckligt kraftfull kvantdator finns tillgänglig om femton år, är dokumentet redan exponerat — även om du aldrig märker det.

Det amerikanska National Security Agency har bedömt att RSA och ECDSA (elliptisk kurva) utgör en oacceptabel säkerhetsrisk i kryptografiska system avsedda för nationell säkerhet. NSA:s tidslinje är tydlig: RSA och ECDSA ska vara *deprecated* senast 2030 och är förbjudna i känsliga system från 2035 (NSA CNSA 2.0, 2022). Tidslinjerna är inte aspirationer — de är planeringshorisonter för statliga aktörer.

## NIST har satt standarden — nu handlar det om implementation

I augusti 2024 publicerade det amerikanska National Institute of Standards and Technology de tre första standarderna för post-kvantumkryptografi (PQC):

- **FIPS 203** — ML-KEM (baserat på CRYSTALS-Kyber) för nyckelutbyte och kryptering
- **FIPS 204** — ML-DSA (baserat på CRYSTALS-Dilithium) för digitala signaturer
- **FIPS 205** — SLH-DSA (baserat på SPHINCS+) för hashbaserade signaturer

Dessa algoritmer är konstruerade för att vara resistenta mot attacker från kvantdatorer. De är inte experimentella — de har granskats i ett decennelangt offentligt valideringsarbete och är nu den globala standarden för kvantresistent kryptering.

Standarderna är ett nödvändigt villkor, men inte ett tillräckligt sådant. För Sverige gäller nu frågan om implementation.

## Banken för internationella betalningar pekar vägen — och risken

Bank for International Settlements (BIS) driver sedan 2024 *Project Leap* — ett internationellt initiativ för att testa PQC-migration i finansiella system (BIS Working Paper, 2024). Projektet syftar till att identifiera de tekniska, operativa och styrningsrelaterade hinder som uppstår när centralbankssystem och betalningsinfrastruktur migreras till kvantresistenta algoritmer.

Slutsatsen från Project Leap är belysande: migrationen är tekniskt möjlig, men komplexiteten underskattas systematiskt. Integrationspunkter är fler än organisationer inser, äldre system (*legacy*) skapar oväntat höga kostnader, och kompetensen att genomföra migrationen är en knapp resurs.

Om detta gäller finansiella system med relativt väldefinierad arkitektur, är utmaningen ännu större i den heterogena IT-miljö som kännetecknar svensk offentlig förvaltning.

## Svensk offentlig sektor är exponerad — och underberedd

Sveriges nationella kvantstrategi och den nationella cyberssäkerhetsstrategin (NCSS 2025–2029) identifierar kvantsäker kryptografi som ett prioriterat område (Regeringskansliet, 2024). Det är välkommet. Men identifiering och implementation är inte samma sak.

En rimlig bedömning är att en betydande andel av de statliga system som i dag hanterar sekretessklassad information med sekretessgrunder om tio år eller längre — folkbokföring, socialförsäkring, hälsodata, försvarsunderlag — inte har påbörjat inventering av sina kryptografiska beroenden. Ännu färre har definierat en migrationstidslinje.

Det är ett strukturellt problem med tre dimensioner:

**Kompetensunderskott.** PQC-kompetens är extremt sällsynt. Att bedöma vilka kryptografiska primitiver ett system använder, och hur de ska bytas ut utan att bryta befintlig funktionalitet, kräver specialiserad teknisk kompetens som få myndigheter har internt.

**Inventeringsluckor.** Många myndigheter saknar fullständig bild av sina kryptografiska beroenden — vilka algoritmer som används, i vilka system, och med vilka integrationer mot externa aktörer. Utan inventering är migration omöjlig att planera.

**Prioriteringsfel.** HNDL-hotet är svårt att kommunicera: skadan uppstår i framtiden, angriparen syns inte, och konsekvenserna kan inte mätas förrän det är för sent. Det konkurrerar med mer synliga och omedelbara krav och prioriteras systematiskt ned.

## Vad som behöver hända — och vem som bär ansvaret

NIST:s PQC-standarder och NSA:s tidslinje ger en klar referenspunkt. Sweden bör tillämpa samma logik som det amerikanska försvaret: systemen med längst sekretessperioder och högst skyddsvärde ska migreras först.

Det kräver tre parallella spår:

1. **Kryptografisk inventering** — alla myndigheter som hanterar information med sekretessgrunder bortom 2035 bör genomföra en systematisk inventering av kryptografiska algoritmer och integrationer.

2. **Kompetensuppbyggnad** — MSB, FRA och NCSC bör koordinera utbildningsinsatser och samnyttja den begränsade PQC-kompetens som finns i Sverige, i stället för att varje myndighet söker kompetensen individuellt.

3. **Granskningsberedskap** — den myndighet som har i uppdrag att bedöma statliga myndigheters interna styrning och kontroll bör ta fram metodik för att bedöma om myndigheter aktivt hanterar kryptografisk sårbarhet. Det är en ny typ av IT-granskning, men principen är välkänd: risk måste identifieras och hanteras — inte ignoreras tills den materialiseras.

HNDL-problemet påminner om klimatpolitikens grunddilemma: kostnaden för att agera betalas i dag, skadan av att inte agera uppstår imorgon. Men till skillnad från klimatfrågan är det kryptografiska problemet lösbart — standarderna finns, tekniken finns, och tidslinjen är känd. Det som saknas är systematisk styrning och prioritering.

Kvantdatorn kanske är tio år bort. Dess offer är redan utsedda.

---

## Källor

- NSA, *Commercial National Security Algorithm Suite 2.0 (CNSA 2.0)*, september 2022.
- NIST, *FIPS 203: Module-Lattice-Based Key-Encapsulation Mechanism Standard*, augusti 2024.
- NIST, *FIPS 204: Module-Lattice-Based Digital Signature Standard*, augusti 2024.
- NIST, *FIPS 205: Stateless Hash-Based Digital Signature Standard*, augusti 2024.
- BIS, *Project Leap: Quantum-proofing the financial system*, Working Paper nr 1164, 2024.
- Regeringskansliet, *Nationell strategi för cybersäkerhet 2025–2029*, 2024.
- Regeringskansliet, *Sveriges nationella kvantstrategi*, 2024.
