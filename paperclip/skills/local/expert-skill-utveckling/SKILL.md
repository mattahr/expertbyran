---
name: expert-skill-utveckling
description: Använd när du som expert på Expertbyrån ska skapa, förfina eller utöka din EGEN expertis — din EXPERT.md, dina principer, din arbetsmetod eller filerna under din egen references/-mapp. Triggar på uppgifter som "lär dig X", "uppdatera din profil", "förfina principen om Y", "lägg till en referens om Z", "skapa din EXPERT.md från mallen", eller "addera en ny uppgiftstyp till din kompetens". Garanterar (1) strikt scope så att du bara rör din egen mapp, (2) förfining-över-omskrivning så att din kunskap byggs över tid utan att raderas, och (3) korrekt SKILL.md/EXPERT.md-struktur. Använd ALLTID denna skill istället för "skill-creator" när uppgiften gäller dig själv som expert — skill-creator är byggd för fristående skills med eval-loopar och har fel processfokus för expertutveckling.
---

# Expert-skill-utveckling

Du är en expert på Expertbyrån. Den här skill:en hjälper dig att utveckla **din egen** expertis över tid — initiera, förfina, eller utöka din profil och ditt referensmaterial. Inget annat.

## Två lager: EXPERT.md för identitet, references/ för djup

Din kunskap fördelar sig på två lager. Förstå skillnaden innan du skriver något:

* **EXPERT.md** är din **identitet och arbetsmetod** — vem du är, vilka principer du följer, hur du tar dig an typiska uppgifter, vilka uppgifter du *inte* tar. Den läses *varje gång* konsultchefen routar till dig och bör vara relativt stabil över tid. Här lägger du saker som påverkar varje konsultation.
* **`references/`** är ditt **djupmaterial** — lagtexter, ordlistor, stilguider, doktriner, citerade källtexter, längre exempel, faktatabeller. Dessa filer laddas *bara* när en specifik uppgift kräver dem. Här lägger du saker som växer kontinuerligt och som inte alltid är relevanta.

**Tumregel:** läses *varje gång* du arbetar → EXPERT.md. Läses *vid specifika uppgifter* → `references/`.

**Konkret bild:** en försvarsexpert har en kort EXPERT.md som beskriver hur hen analyserar säkerhetspolitiska frågor, vilka principer hen följer, och vilka typer av uppdrag hen tar. Hens `references/` växer däremot organiskt över tid: en ny fil när en doktrin ändras, en ny fil för varje konflikt hen behöver kunna analysera, en för svenska försvarsmaktens organisationsstruktur, en för NATO-terminologi. Varje ny referens listas i EXPERT.md:s `## Referensmaterial`-sektion med en mening om innehållet och en konkret "Läs när"-trigger — så att hen själv (och konsultchefen) kan avgöra relevans utan att öppna filen.

Om du står i begrepp att lägga till mer än ett par stycken substansiellt nytt material i EXPERT.md — fråga dig själv om det egentligen hör hemma i en ny `references/`-fil med en pekare i EXPERT.md.

## Var du sparar ditt arbete

Du har tillgång till **två platser**. Förstå skillnaden — annars kan ditt arbete försvinna in i tomma intet.

* **Din runtime-kontext** — ditt agent-repo (`$AGENT_HOME`), denna konversation, eventuella andra filer du har tillgång till. Det är **källan** för din kunskap: vem du är som expert, ditt domänkunnande, dina principer och erfarenheter.
* **`expertbyran_marketplace`-repot** — specifikt under `plugins/expertbyran/skills/expertbyran/experts/<ditt-namn>/`. Det är **destinationen** för allt du skapar och uppdaterar: din EXPERT.md och dina `references/`-filer.

**Kunskapsflödet:** hämta från runtime-kontext → strukturera enligt format → **spara i `expertbyran_marketplace`-repot**.

Allt du skriver med Write eller Edit **måste hamna i marketplace-repots expertmapp**. Det är därifrån pluginet distribueras till installerade användare. Filer som hamnar någon annanstans (i ditt agent-repo, under `$AGENT_HOME`, i denna sessions temp-utrymme) **når aldrig användarna** — det är bortkastat arbete.

**Verifiera alltid:** sökvägen i ditt Write/Edit-anrop börjar med `expertbyran_marketplace`-repots rot och leder till `plugins/expertbyran/skills/expertbyran/experts/<ditt-namn>/`. Pekar sökvägen någon annanstans — du är på fel plats. Stanna och korrigera innan du skriver.

(Om marketplace-repot har flyttats eller döpts om — använd det aktuella namnet, men principen står: destinationen är **det repo där pluginet distribueras från**, inte ditt eget agent-repo.)

## Kunskapsinnehåll
Den kunskap du ska omvandla till en EXPERT.md och referensfiler är alltså den du har tillgång till om dig själv som expert.
Det innebär:
$AGENT_HOME/AGENTS.md — din roll och ansvarsområde
$AGENT_HOME/expertise.md — din nuvarande kompetens (CV)
$AGENT_HOME/life/areas/<domän>.md — din kunskapsbas
Men även annan information du har som rör ditt expertområde.

All denna kunskap ska du alltså omvandla till en EXPERT.md och referensfiler som beskriver vem du är som expert, vilka principer du följer, hur du tar dig an uppgifter, och vilket djupmaterial du har att slå i när det behövs. Det ska vara omfattande och detaljerat och omfatta ALL din expertis, utan hänvisningar till annat än EXPERT.md och referensfiler. 
Uppdatera hellre än skriv om.

## Du skriver i en annan kontext än du körs i

Detta är en av de viktigaste sakerna att internalisera, och en vanlig fallgrop som förtjänar fördjupning utöver "Kunskapsinnehåll" ovan:

**Just nu** (när du skriver/uppdaterar din skill) har du sannolikt rik kontext: tillgång till denna konversation, andra filer i ditt arbetsträd (`$AGENT_HOME` och annat), möjligen webbresurser, andra skills, ditt eget tränade kunnande. Det är frestande att skriva *"se dokumentet X"* eller *"som vi diskuterade ovan"* eller *"hämta uppdaterad version från [URL]"*.

**När du senare körs** (en framtida konsultation) har du **bara**: din EXPERT.md, dina `references/`-filer, och de verktyg konsultchefen ger dig i den sessionen. Inget av det andra finns kvar.

**Konsekvenser för hur du skriver:**

* **Allt du behöver för att utföra ditt arbete måste finnas inlinad i dina egna filer.** Om du behöver en stilguide när du arbetar — kopiera in den (eller relevanta delar) i `references/<stilguide>.md`. Om du behöver en lagtext — citera den i `references/<lagtext>.md`. Räkna inte med att källan finns när du körs.
* **Hänvisa aldrig till filer utanför din egen expertmapp.** Inga sökvägar till `$AGENT_HOME`, inga sökvägar till andra delar av repot, inga referenser till andra agenters arbeten. De kommer inte att vara åtkomliga vid körtid.
* **URL:er är OK som källattribution men inte som beroende.** *"Källa: Språkrådet, [url]"* är fint. Men citera tillräckligt av innehållet i din egen text så att uppgiften kan utföras *utan* att URL:n behöver hämtas.
* **Konversationskontext gäller inte.** Skriv inte *"som vi etablerade ovan"* eller *"se mitt tidigare svar"*. Den framtida sessionen ser inte detta.

**Praktiskt test:** läs din EXPERT.md och varje `references/`-fil **som om du läste dem för första gången utan annan kontext**. Är allting fortfarande begripligt och utförbart? Om nej — något beror på extern kontext och måste inlineas.

## Strikt scope

Du får röra precis dessa filer, men inga andra:

**Tillåtet (din egen expertmapp):**

* Din `EXPERT.md` — profil, principer, arbetsmetod, referenslista. Skapa eller förfina.
* Din `references/*.md` — ditt referensmaterial. Skapa, förfina, omorganisera.
* Nya filer eller underkataloger under din expertmapp om du genuint behöver dem (förklara då i EXPERT.md varför strukturen finns).

**Förbjudet:**

* Andra experters mappar — rör aldrig.
* Mallen (`_TEMPLATE/` eller motsvarande) — endast plugin-underhållarna ändrar den.
* Routerns expertkatalog (`INDEX.md` eller motsvarande) — det är inte din uppgift att registrera dig själv. Om du är nyanställd och saknas där, säg det till användaren och be hen registrera dig.
* Routerns skill-fil (`SKILL.md` på router-nivå) — aldrig.
* Plugin-manifest (`plugin.json`), marketplace-manifest (`marketplace.json`), `CLAUDE.md`-filer, `README.md` — aldrig.
* Allt utanför din egen expertmapp.

**Om du är osäker om något är inom scope: det är det inte.** Säg till användaren och låt hen avgöra.

### Hänvisa till andra experter — rådgivande, inte styrande

Du får (och bör) i din EXPERT.md nämna andra experter som rätt eller bättre lämpade för specifika typer av uppgifter — använd då sektionen `## När jag INTE är rätt expert` för att säga *"för X-aspekter är `<annan-expert>` bättre lämpad"*. Detta är **rådgivande** input som hjälper konsultchefen att routa rätt.

Du ska **inte** skriva ut explicita styrkommandon som *"konsultera juridik-experten efter min granskning"* eller försöka orkestrera flera experter — det är konsultchefens ansvar att avgöra om en, två eller flera experter ska engageras. Att röra andra experters filer är dessutom förbjudet enligt scope-reglerna ovan.

Om en helt ny samarbetspartner (en expert som inte finns på byrån än) skulle vara värdefull för ditt område — säg det till användaren, så får hen avgöra om den ska skapas.

## Du bumpar inte version själv — be konsultchefen göra det

Pluginet använder semantic versioning i `plugin.json`. **Utan version-bump ser inga installerade användare dina ändringar** (Claude Code cachar per version). Men `plugin.json` ligger utanför ditt scope.

Därför: när du har gjort en uppdatering du anser värd att distribuera, **avsluta med att be användaren om en version-bump**:

> *"Klart med [vad jag ändrat]. För att ändringarna ska nå installerade användare behöver konsultchefen bumpa pluginets version i `plugin.json` — PATCH-bump räcker för en profilförfining eller reference-uppdatering. Vill du att jag flaggar det till hen?"*

Bumpa **inte själv**, även om du är frestad. Konsultchefen håller koll på vad som ackumuleras och kan batcha flera experters uppdateringar i en bump — vilket sparar uppdateringscykler för användarna.

## Princip: förfining över omskrivning

Du bygger kunskap **över tid**. Varje uppdatering ska lämna spår i din profil — inte sudda och börja om. Konkret:

1. **Read alltid först.** Läs hela din EXPERT.md (och eventuella refererade filer) innan du rör något. Förstå vad som redan står där och varför.
2. **Använd Edit för riktade ändringar.** Ändra bara de rader som faktiskt ska ändras. Bevara resten.
3. **Använd Write bara när filen inte finns.** Skriv aldrig om en befintlig fil från scratch. Om du tror att en omfattande omarbetning är motiverad — stanna och fråga användaren först.
4. **Behåll strukturen.** Mallens rubriker (`## Profil`, `## När jag ska anropas`, `## Mina principer`, osv.) är ett gränssnitt mot konsultchefen och framtida läsare. Ändra inte ordningen eller rubrikerna utan mycket god anledning.
5. **Lägg till, förtydliga, korrigera.** Undvik att ta bort innehåll som fortfarande stämmer bara för att du skriver en uppdatering.

## Arbetsflöden

### A. Förfina en befintlig princip eller arbetsmetod

1. Read din `EXPERT.md`.
2. Lokalisera det stycke eller den punkt som ska justeras.
3. Använd Edit med tillräcklig kontext för att säkra unik matchning av `old_string`.
4. Verifiera att omgivande text fortfarande är konsistent med ändringen.

### B. Lägga till en ny princip, uppgiftstyp eller annan sektion

1. Read din `EXPERT.md`.
2. Identifiera rätt rubrik att addera under (ny princip → under `## Mina principer`; ny uppgiftstyp → under `## Vanliga uppgifter`).
3. Använd Edit för att lägga till just där det hör hemma. Behåll numrering, indentering och format konsekvent med befintliga punkter.

### C. Lägga till ett nytt referensmaterial

1. **Skapa filen:** Write `references/<beskrivande-namn>.md`. Fyll med faktisk substans — aldrig en platshållare.
2. **Registrera den i din EXPERT.md:** Edit sektionen `## Referensmaterial` (eller motsvarande). Lägg till en rad enligt mönstret:
   ```
   - `references/<beskrivande-namn>.md` — <en mening om innehållet>. Läs när: <konkret trigger>.
   ```
3. Beskriv **när** filen ska läsas så tydligt att konsultchefen och du själv kan avgöra relevans utan att öppna den.

### D. Förfina en befintlig referensfil

1. Read filen.
2. Edit riktade ändringar.
3. Om filens omfattning eller fokus ändras väsentligt — uppdatera dess beskrivning i EXPERT.md:s `## Referensmaterial`.

### E. Initiera EXPERT.md första gången (du är nyanställd)

Gäller när din mapp finns men EXPERT.md saknas.

1. **Kontrollera förutsättningar:** din mapp `experts/<ditt-namn>/` (eller motsvarande) måste redan existera. Skapa den inte själv — det är plugin-underhållarens ansvar.
2. **Read mallen:** `_TEMPLATE/EXPERT.md` (eller motsvarande). Förstå vilka rubriker som förväntas.
3. **Read** **[references/skrivprinciper.md](references/skrivprinciper.md)** för att förstå hur du skriver innehåll som faktiskt fungerar för en LLM-agent.
4. **Read** **`experts/_EXEMPEL/EXPERT.md`** (i marketplace-repot, om åtkomligt) som konkret förebild för struktur och ton.
5. **Write din EXPERT.md** med substans i alla rubriker — ingen skelett-text lämnas kvar. Behåll mallens rubrikordning; substansifiera, härma inte mekaniskt.
6. **Skapa eventuella initiala referensfiler** under `references/`, en åt gången enligt flöde C ovan.
7. **Avsluta med att säga till användaren:** *"Jag är nu initierad. För att jag ska synas för konsultchefen behöver du registrera mig i [routerns expertkatalog] samt bumpa pluginets version (MINOR-bump). Förslag på INDEX.md-rad: …"*. Gör **inte** registreringen eller version-bumpen själv.

## Skrivkvalitet

Två resurser hjälper dig att skriva innehåll som faktiskt fungerar för en LLM-agent:

1. **[references/skrivprinciper.md](references/skrivprinciper.md)** — destillerade principer för EXPERT.md-skrivande. Täcker progressive disclosure (EXPERT.md vs references/), skriva för en LLM-läsare (förklara *varför*, undvik MUSTs/ALWAYS), profilens roll, beskriva triggers, och vanliga fallgropar.

2. **`experts/_EXEMPEL/EXPERT.md`** i marketplace-repot (om du har läs-access dit) — en komplett, färdigskriven referens-EXPERT.md för en klarspråksexpert med tillhörande `references/riktlinjer.md`. Använd den som konkret förebild för struktur, ton, sektionernas omfång, och hur referensregistrering ser ut. Den är medvetet placerad utanför INDEX.md (icke-routningsbar) just för att vara en stabil referens.

Läs dem inte varje gång — bara när du är osäker eller skriver något substantiellt nytt. Vid initiering av en helt ny EXPERT.md är båda värda att läsa innan du börjar.

## När du stöter på något utanför scope

Stanna och säg till användaren. Exempel:

* Du upptäcker en brist i en annan experts arbete → säg det, rör inget.
* Du vill föreslå en ny generell riktlinje för hela byrån → föreslå att plugin-underhållaren uppdaterar sin CLAUDE.md.
* Du tycker att mallen borde ha en ny rubrik → säg det.
* Du vill byta namn på din egen mapp → säg det. Mappnamnet matchar din registrering i routerns katalog och sådana byten kräver koordination.
* Du vill ta bort en befintlig princip eller uppgift från din EXPERT.md → motivera det för användaren först. Förfining är default; subtraktion kräver explicit godkännande.

## Checklista innan du avslutar en utvecklingssession

Verifiera kort att du:

* [ ] Bara har rört filer inom din egen expertmapp.
* [ ] Inte har rört INDEX.md, andra experter, router-SKILL.md, plugin/marketplace-manifest eller CLAUDE.md-filer.
* [ ] Behållit din EXPERT.md:s rubrikstruktur.
* [ ] Använt Edit (inte Write) för befintliga filer.
* [ ] Registrerat eventuella nya referensfiler i `## Referensmaterial` med tydlig "Läs när"-beskrivning.
* [ ] Om du är nyanställd: bett användaren om INDEX.md-registrering, inte gjort den själv.
* [ ] Bara ändrat det som behövde ändras — inget mer.
* [ ] Allt jag skrivit är fristående — inga hänvisningar till filer utanför min mapp eller till denna sessions kontext.
* [ ] Vid uppdatering: scannat befintligt innehåll först och bara adderat genuint nytt material (inte återskapat det som redan finns).
* [ ] Bett användaren om version-bump om mina ändringar är värda att distribueras till installerade användare.
* [ ] Allt jag skrivit ligger i `expertbyran_marketplace`-repot under min expertmapp — inte i mitt agent-repo, `$AGENT_HOME` eller annan plats.

Om en punkt inte är sann: åtgärda eller säg till användaren innan du avslutar.
