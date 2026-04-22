# Routing-principer för konsultchefen

Destillerade principer för hur du formulerar routing-infrastruktur som faktiskt styr pluginet rätt. Läs när du formulerar om något substantiellt i SKILL.md eller INDEX.md, eller när du är osäker.

## Vad gör en bra SKILL.md `description` (frontmatter)?

`description` är pluginets trigger — den avgör om Claude aktivt kallar in Expertbyrån när en användare ber om hjälp. Den ska:

* **Triggra på bredden av byråns domäntäckning** utan att nämna specifika expertnamn (de lever i INDEX.md, inte i frontmatter — det håller description stabil när experter kommer och går).
* **Vara konkret om typen av uppgifter** ("textgranskning, juridisk analys, klarspråk, korrektur, säkerhetsbedömning, UX-feedback, m.fl.") snarare än svepande ("allt som rör språk").
* **Täcka det implicita behovet.** Många användare säger inte "jag behöver en expert" — de säger "kan du granska detta?". Beskriv när pluginet hjälper, inte bara när användaren uttryckligen frågar efter det.
* **Vara kort.** Under 500 tecken. En mening som förklarar vad pluginet gör, en mening som förklarar när det ska triggas.

**Bra exempel:**
> Expertbyråns konsultchef — routar uppgifter till rätt domänexpert(er). Använd denna skill när du behöver specialisthjälp: textgranskning, klarspråk, juridik, eller annan expertis. Konsultchefen analyserar uppgiften, väljer rätt expert(er), och koordinerar arbetet.

**Sämre exempel:**

* *"Denna skill kan hjälpa dig med språkliga frågor"* — för svepande, saknar triggering-kraft.
* *"Använd alltid denna skill för ALLA frågor"* — överdrivet, triggas för ofta.
* *"Konsulterar Sven (klarspråk), Anna (juridik), Per (korrektur)…"* — nämner specifika experter, bryts så fort mixen ändras.

## Vad gör en bra rad i INDEX.md?

Varje expert-rad ska innehålla tre saker:

| Kolumn | Krav | Dåligt | Bra |
|---|---|---|---|
| Expertnamn | Matchar mappnamnet exakt (ASCII kebab-case) | `Klarspråk` | `klarsprak` |
| Roll | Kort titel i klartext, 1–4 ord | `Expert` | `Klarspråksexpert` |
| Anropa när | Konkret trigger som distinkterar från andra experter | `Språkliga frågor` | `Svensk text ska bli enklare, tydligare eller mer läsarvänlig. Granska, skriva om, eller kommentera språkbruk i myndighetstext, instruktioner, e-post, webbtext m.m.` |

**Triggern är det viktigaste fältet.** Den läses av dig själv (konsultchefen) vid varje användarfråga för att välja rätt expert. Om den är vag triggar du fel expert. Om den är för snäv missar du relevanta uppdrag.

**Skärpning genom kontrast:** formulera trigger så att den inte *råkar* överlappa en annan experts trigger. Om klarspråk säger "granska svensk text" och korrektur säger "granska skriven text" — båda triggar på samma typ av uppdrag. Skärp: klarspråk = "enklare/tydligare/läsarvänligare", korrektur = "stavning, interpunktion, grammatik".

## Hur destillerar du triggern från expertens EXPERT.md?

Expertens egen `## När jag ska anropas` är din källa. Men den är oftast skriven i bred form (4–8 bullets). Din uppgift är att destillera till 1–2 meningar som fångar kärnan utan att tappa distinktion mot andra experter.

**Process:**

1. Läs expertens `## När jag ska anropas` — lista alla triggers.
2. Läs expertens `## När jag INTE är rätt expert` — se vad som *inte* ska routas dit.
3. Identifiera 2–4 nyckelord eller korta fraser som är specifika för experten.
4. Formulera en mening: "[typ av text/uppgift] där [specifikt fokus] — [vanliga kanaler/domäner]."
5. Kontrollera mot andra experters triggers i INDEX.md — finns överlapp?

**Om du inte kan destillera tydligt:** experten har troligen en otydlig självbild. Säg till användaren — det är ett signal för expert-utveckling, inte för att du själv ska gissa.

## Hur bedömer du överlapp mellan experter?

Överlapp = två experter skulle rimligen ta samma typ av uppdrag.

**Metod:**

1. Gör en lista över "typ-uppdrag" som byrån täcker (baserat på alla experters triggers).
2. För varje typ-uppdrag: vilken expert är *primär*? Vilken är *sekundär* (bra att konsultera också)?
3. Om två experter båda är primära för samma uppdragstyp — det är genuint överlapp.

**Exempel på genuint överlapp:** *"språkgranskning av myndighetstext"* triggar både klarsprak (enklare/tydligare) och korrektur (stavning/grammatik). Detta är **bra överlapp** om experterna är tydligt komplementära (konsultchefen routar till båda för tvärfunktionella uppdrag).

**Exempel på problematiskt överlapp:** två experter med liknande trigger-formulering som båda säger *"granska svensk text"*. Konsultchefen kan inte välja — båda verkar lika rätt. **Åtgärd:** skärp triggers i INDEX.md, eller (om scopet genuint är identiskt) föreslå konsolidering till användaren.

## Hur bedömer du luckor?

Lucka = typer av uppdrag som ingen expert anger att de tar.

**Metod:**

1. Tänk på vanliga användarfrågor som kommer till Expertbyrån.
2. För varje: kan du utifrån INDEX.md avgöra vilken expert som ska route:as?
3. Om svaret är "ingen passar" — det är en lucka.

**När lucka finns:** rapportera till användaren. Konsultchefen skapar inte nya experter själv, men kan flagga var en expert vore värdefull.

## När du justerar SKILL.md body (routing-logiken)

Bodyn beskriver hur du (konsultchefen) ska gå tillväga. Justeringar där sker sällan. Vanliga motiv:

* **Multi-expert-orkestrering:** lägga till eller skärpa regler för när flera experter ska engageras parallellt eller sekventiellt.
* **No-match-hantering:** vad du säger till användaren när ingen expert matchar. Ska vara transparent — "ingen av byråns experter täcker detta; vill du att jag hjälper generellt utan expertroll?".
* **Transparens:** säga vilken/vilka experter som engagerats i början av svaret. Reglerna för detta hör i body.

**Håll bodyn kort.** Den ska vara läsbar på under en minut. Om den sväller — flytta detaljer till en ny `references/`-fil på router-nivå (skapa den då — analog med hur experter lägger djup i `references/`).

## Sammanfattning

* **SKILL.md description:** bred, stabil, inga namn; triggar på domäntäckning.
* **INDEX.md-rad:** expertnamn + kort roll + konkret, distinkt trigger.
* **Trigger skärps genom kontrast mot andra experters triggers.**
* **Du destillerar från expertens egen EXPERT.md — hittar inte på.**
* **Överlapp kan vara bra (komplement) eller problematiskt (identisk trigger).**
* **Luckor rapporteras, skapas inte.**
* **Body-ändringar i SKILL.md är sällsynta och koordinerade.**
