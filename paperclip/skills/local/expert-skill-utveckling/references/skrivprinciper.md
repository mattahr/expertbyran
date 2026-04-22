# Skrivprinciper för EXPERT.md och referensfiler

Denna fil destillerar det viktigaste från Anthropics `skill-creator` (som vi inte använder direkt) plus erfarenheter specifika för Expertbyråns uppställning. Läs den när du skriver något substantiellt nytt eller är osäker på hur du formulerar dig.

## Progressive disclosure: vad hör hemma var?

Du har två lager att fördela innehåll mellan:

1. **EXPERT.md** — laddas in när konsultchefen routar till dig. Bör vara fokuserad och under \~500 rader. Innehåller din profil, principer, arbetsmetod, vanliga uppgifter, och en lista över dina referensfiler.
2. **`references/`** — laddas bara on demand när en specifik uppgift kräver djupare faktaunderlag.

Riktlinjer:

* **Profil, principer, arbetsmetod** hör i EXPERT.md. De definierar vem du är som expert och styr varje konsultation.
* **Lagar, ordlistor, stilguider, tabeller, långa exempel, citerade källtexter** hör i `references/`. De är referensmaterial du slår i — inte din kärnidentitet.
* **Tumregel:** om något läses *varje gång* du arbetar → EXPERT.md. Om något läses *vid specifika uppgifter* → `references/`.

För varje referensfil i `## Referensmaterial`-sektionen, beskriv **när** den ska läsas så konkret att du och konsultchefen kan avgöra relevans utan att öppna filen:

```
- `references/lagtext-pul.md` — citerade utdrag ur GDPR och dataskyddsförordningen. Läs när: uppdraget rör behandling av personuppgifter eller du behöver citera lagrum för användaren.
```

Dåligt: *"Läs när: relevant"*. Bra: *"Läs när: uppdraget rör* *<konkret situation>"*.

## Skriv för en LLM-läsare

Din EXPERT.md läses av en stor språkmodell (Claude) som ska "spela" dig som expert. Den är smart men bokstavlig. Tre konsekvenser:

### Förklara *varför*, inte bara *vad*

Skriv inte bara "använd aktiv form". Skriv: "använd aktiv form, eftersom passiv ofta döljer vem som handlar och gör instruktioner svåra att följa". Modellen kan då bedöma kantfall — t.ex. när passiv är motiverad — istället för att blint följa regeln.

### Undvik aggressiva absoluter (ALDRIG / ALLTID / MÅSTE)

Heavy-handed MUSTs i versaler är en yellow flag. De säger "jag vet inte hur jag ska få modellen att förstå detta, så jag skriker". Bättre: förklara situationen, förklara konsekvenserna, låt modellen välja.

Undantag: **strikt scope** (t.ex. "rör aldrig andra experters filer") där det inte finns kantfall — där är direktiv på sin plats.

### Använd imperativ form

"Read EXPERT.md först" — inte "Du bör läsa EXPERT.md först" eller "EXPERT.md ska läsas först". Imperativ är direkt och otvetydig.

## Lär av exemplet

I marketplace-repot (om du har läs-access dit) finns `experts/_EXEMPEL/EXPERT.md` — en komplett, färdigskriven EXPERT.md för en klarspråksexpert. Den är medvetet icke-routningsbar (ligger inte i INDEX.md) just för att vara en stabil förebild. Läs den när du:

* Initierar en ny EXPERT.md från mallen och vill se hur en färdig variant är fylld.
* Är osäker på sektionernas omfång — hur lång ska "Profil" vara, hur många principer är rimligt?
* Vill se hur referensregistreringen i `## Referensmaterial` formuleras i praktiken.

Härma inte ordval eller specifika exempel — `_EXEMPEL/` är klarspråksexpert, du är något annat. Härma struktur, ton och nivå av specificitet.

## Profilen är central

Sektionen `## Profil` i EXPERT.md är inte dekoration — det är det som gör att modellen rollar in i karaktären istället för att svara generiskt. Investera i den.

Bra profil:

* Skriven i första person ("Jag är klarspråksexperten…")
* Specifikt fokus, inte allmänt ("mitt fokus är myndighetstext, webbtext, instruktioner och e-post" — inte "jag jobbar med språk")
* Tydlig värdeproposition ("jag hjälper dig skriva svenska som är lätt att läsa och förstå")
* En personlig metodik antydd ("…för den läsare du faktiskt vänder dig till")

Dålig profil:

* Tredje person ("Klarspråksexperten arbetar med…")
* Svepande ("Jag kan hjälpa till med det mesta som rör språk")
* Abstrakt ("Jag tillämpar moderna språkprinciper")

## Beskriv tydligt när du INTE är rätt expert

Sektionen `## När jag INTE är rätt expert` är lika viktig som `## När jag ska anropas`. Den hjälper konsultchefen att routa rätt och hindrar dig från att ta uppdrag du inte är bäst på.

Skriv konkret: vad är *inte* din uppgift, och vem på byrån är bättre lämpad? Om ingen finns ännu — säg "denna typ av uppgift har vi ingen expert för i dag".

## Vanliga fallgropar

### Fluff och utfyllnad

Varje stycke i EXPERT.md ska tjäna ett syfte: definiera dig, hjälpa modellen att utföra ett konkret arbetssätt, eller etablera scope. Stryk meningar som låter bra men inte ändrar hur en konsultation utförs.

Test: "Om jag tar bort denna mening, blir mina svar mätbart sämre?" Om nej — stryk.

### Övergeneralisering

Frestelsen att skriva "Jag arbetar med all sorts text" är stor. Motstå. Smala, specifika expertroller fungerar bättre än breda — både för triggering och för kvalitet i utförandet.

### Dolda antaganden

Du vet vad du menar, men modellen läser bokstavligt. Säg "läsare av myndighetstext är ofta i en stressad situation och letar efter en handling att utföra" — inte "läsare är ofta utsatta".

### Kopiera mallen utan att substansifiera

Mallens rubriker är ett skelett. Att lämna platshållartext eller skriva en mening per rubrik bara för att fylla i är värre än att inte ha sektionen alls. Skriv inget förrän du har något konkret att säga.

### Lägga in långa exempel direkt i EXPERT.md

Ett kort illustrerande exempel hör i EXPERT.md. Ett 30-rader-exempel hör i `references/exempel-<ämne>.md`. Annars sväller EXPERT.md och konsultchefens kontext.

## Iterativ förbättring

Du utvecklar din profil i små steg över tid. Varje pass:

1. Identifiera **en sak** att förbättra (en princip som är otydlig, en uppgiftstyp som saknas, en referens som behövs).
2. Gör ändringen riktat.
3. Stanna. Inte alla bra idéer hör till denna session — fler kommer nästa gång.

Frestelsen att "städa upp" hela EXPERT.md medan du är inne är vanlig. Motstå om du inte fått explicit uppdrag. Stora omarbetningar utan koordination skapar ojämnhet i hur experter beter sig.

## Vad du *inte* ska härma från generella skill-creator-principer

Vissa råd som passar fristående skills passar inte expertroller:

* **"Skriv pushigt i description"** — för fristående skills kan beskrivningen behöva överdriva för att triggas. Du behöver inte detta: konsultchefen routar till dig baserat på din profil och INDEX.md, inte på en frontmatter-description som tävlar med andra skills.
* **"Bygg eval-loopar med assertions"** — overkill för en expert. Du itererar på din profil baserat på faktisk användning och feedback, inte på automatiserade tester.
* **"Optimera description för triggering"** — irrelevant för dig. Optimera istället tydligheten i din profil och i `## När jag ska anropas`.

## Sammanfattning

* **EXPERT.md är fokuserad och under \~500 rader.** Tungt material i `references/`.
* **Förklara varför, inte bara vad.** Undvik MUSTs/ALWAYS/NEVER utom för strikt scope.
* **Profilen är central.** Första person, specifik, värdeproposition tydlig.
* **Stryk fluff.** Varje mening ska påverka hur konsultationer utförs.
* **Iterera i små steg.** En sak åt gången.

