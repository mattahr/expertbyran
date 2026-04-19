# `obsidian-master` — skill-design

**Datum:** 2026-04-19
**Scope:** `paperclip/skills/local/obsidian-master/`
**Syfte:** Definiera hur en paperclip-agent arbetar i en Obsidian-vault som fungerar som kurerad kunskapsbas för Expertbyråns experter. Vaulten ska senare kunna mata skill-generering per expertområde.

## Bakgrund

Expertbyråns 16 paperclip-agenter (metod- och domänexperter) lär sig och fortbildar sig löpande. När de lär sig något nytt ska det rapporteras in i en gemensam Obsidian-vault där kunskapen kureras, verifieras mot primärkällor och struktureras för att senare kunna destilleras till skills.

`obsidian-master` är agenten som äger vaulten. Den får tasks via paperclip-plattformen — hur tasks levereras ligger utanför denna skill. Skillen beskriver *hur* obsidian-master arbetar när en task kommer in, och vad agenten får göra självständigt.

**Obsidian-syntax** (wikilinks, callouts, embeds, frontmatter-syntax) delegeras till skillen **`obsidian-markdown`**. Denna skill pratar om *innehåll, metadata, struktur, arbetsflöden* — inte syntax.

## Grundprinciper

1. **Verifierbarhet är ett hårt krav.** Varje påstående i en publicerad not ska ha en URL + markdown-fotnot till en källnot. Påståenden utan primärkälla publiceras aldrig.
2. **Hård källkritik.** Källor klassificeras `primär | sekundär | tertiär`. Svaga källor (blogg, Wikipedia utan sekundärkälla, pressmeddelanden som förstahandskälla) avvisas, eller — om noten redan är publicerad — leder till att den flyttas tillbaka till `/Experter/[expert]/` med status `utkast` tills en primärkälla hittas. Agenten gör en självständig trovärdighetsbedömning och hämtar källan för att kontrollera att påståendet stöds.
3. **Expertens röst, agentens struktur.** Innehåll (påståenden, källor, formuleringar) kräver alltid dialog med ansvarig expert. Strukturellt underhåll (MOC-uppdatering, länkar, index, brutna referenser) får agenten sköta självständigt inom en task.
4. **Grafen är produkten.** Vaulten ska vara navigerbar och sökbar, både för att underhålla kunskapen och för att senare destillera den till skills. Länkdisciplin är icke-förhandlingsbar.
5. **Maskinläsbar metadata.** Frontmatter används så att en skill-generator senare kan filtrera fram "allt publicerat och verifierat, ägt av expert X, i område Y".

## Vault-struktur

Platt struktur — inga under-under-mappar. Navigation sker via graf, sök och MOC-filer.

```text
/00_Index/                       MOC:er: expertkarta, områdeskarta, källkatalog
/Experter/
  /[expert-slug]/                En mapp per expert (t.ex. metod-statistik-petra)
/Områden/
  /Metod/                        Metodkunskap (statistik, intervjuteknik, dokumentanalys …)
  /Domän/                        Domänkunskap (socialförsäkring, försvar, arbetsmarknad …)
  /Allmänt/                      Cross-cutting: ISSAI, revisionsprocess, klarspråk
/Källor/
  /tryck/                        SOU, propositioner, betänkanden, skrivelser
  /myndigheter/                  Myndighetsnoter (SCB.md, Försäkringskassan.md …)
  /lagrum/                       Lagar och förordningar
  /databaser/                    Kolada, SCB-tabeller, öppna data
  /personer-externt/             Namngivna externa experter som primärkällor
/_Mallar/                        Obsidian templates per nottyp
```

**Regler:**
- Varje expert äger sin mapp under `/Experter/` — där lever utkast, personliga resonemang och tolkningar. Mapp-slug matchar paperclip-agentens slug (t.ex. `metod-statistik-petra`).
- `/Områden/` är den kanoniska, publicerade kunskapen. Skill-generering utgår härifrån.
- `/Källor/` innehåller en fil per källa. En källa existerar **en gång**. Kunskapsnoter refererar via wikilink — aldrig copy-paste av citering.
- Mappdjupet stannar på den nivå som visas ovan. Underkategorisering inom t.ex. `/Områden/Metod/statistik/` sker via frontmatter och MOC, inte via mappar.

## Fem nottyper

| Typ | Var | Syfte |
|---|---|---|
| **konceptnot** | `/Områden/.../*.md` | Kärninnehåll — avgränsat koncept med verifierade påståenden |
| **moc** | `/Områden/.../_*.md` | Områdeskarta (Map of Content) — strukturerar och länkar konceptnoter i ett område |
| **källa** | `/Källor/.../*.md` | En per källa — citering, trovärdighet, URL, metadata |
| **expertprofil** | `/Experter/[expert]/_index.md` | Expertens landningsnot — vem, vad, ansvarsområden |
| **expertnot** | `/Experter/[expert]/*.md` | Personliga noter: utkast, framingar, pågående resonemang |

## Livscykel och status

En enda `status`-sekvens speglar både livscykel och verifieringsnivå:

| Status | Innebörd | Plats |
|---|---|---|
| `utkast` | Under arbete, ofullständig/ingen verifiering | `/Experter/[expert]/` |
| `verifierad` | Alla påståenden har primärkällor, källor är granskade | `/Experter/[expert]/` fortfarande |
| `publicerad` | Verifierad och placerad i `/Områden/` | `/Områden/.../` |
| `föråldrad` | Tidigare publicerad, behöver översyn | `/Områden/.../` (flyttas ej) |

**Hård länkdisciplin:** Endast `status: publicerad` får wikilänkas *in* från en annan publicerad not. Utkast och expertnoter får aldrig länkas in i kanonisk kunskap — de är expertens privata arbetsyta.

## Frontmatter-scheman

### Gemensamt för alla nottyper

```yaml
typ: konceptnot | moc | källa | expertprofil | expertnot
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: En rad som förklarar vad noten handlar om
```

### Konceptnot

```yaml
typ: konceptnot
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: Kort beskrivning
expert: [metod-statistik-petra]             # primär(a) bidragsgivare
område: "[[_statistik]]"                    # wikilink till MOC
relaterade_experter: [domän-socialförsäkring-sven]
sökord: [regression, kausalitet]
status: publicerad
senaste-översyn: 2026-04-19                 # när påståenden senast granskades
osäkerhet: låg                              # låg | medel | hög
ersätter: "[[gammal-not]]"                  # endast om noten ersätter äldre version
```

### MOC

```yaml
typ: moc
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: Områdeskarta för statistik
område: statistik
ansvarig_expert: [metod-statistik-petra]
ingående_experter: [metod-statistik-petra, domän-arbetsmarknad-anna]
```

### Källa

```yaml
typ: källa
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: SOU 2024:45 om arbetsmarknadspolitik
källtyp: sou | prop | betänkande | skrivelse | myndighet | lag | databas | artikel | bok | person
trovärdighet: primär | sekundär | tertiär
url: https://www.regeringen.se/...
publicerad: 2024-05-12
organisation: Arbetsmarknadsdepartementet
upphovsperson: "Namn Efternamn"             # om relevant
ämnesområden: [arbetsmarknad, statistik]
```

### Expertprofil

```yaml
typ: expertprofil
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: Expertprofil för Petra (metodexpert — statistik)
expert: metod-statistik-petra
roll: metodexpert                           # metodexpert | domänexpert
ämnesområden: ["[[_statistik]]", "[[_dokumentanalys]]"]
```

### Expertnot

```yaml
typ: expertnot
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: Min utkastlogik för ...
expert: metod-statistik-petra
status: utkast | verifierad                 # aldrig publicerad — då flyttas noten
publicerad_i: "[[konceptnot-x]]"            # om noten sedan har flyttats; backlinking
```

## Länkdisciplin (obligatorisk)

- Varje **konceptnot** måste länka till sin MOC (`område:`-fältet + inline-länk i brödtext)
- Varje **påstående** i en konceptnot måste ha markdown-fotnot till en källnot
- Varje **källnot** står ensam i `/Källor/` (aldrig duplicera citering i konceptnoten)
- **MOC** listar alla ingående konceptnoter — uppdateras när ny konceptnot publiceras
- **Expertprofil** listar publicerade konceptnoter där experten är primär bidragsgivare
- **Aldrig länka** från en publicerad konceptnot till en expertnot eller ett utkast

## Arbetsflöden som skillen täcker

1. **Ta emot ny kunskap från expert** — skapa utkast i `/Experter/[expert]/`, sök duplicates, dialoga med experten för källor och formulering.
2. **Flytta utkast → publicerad** — verifiera alla påståenden, uppdatera frontmatter, flytta till rätt `/Områden/`-mapp, uppdatera relevant MOC.
3. **Uppdatera befintlig konceptnot** — bedöm om ändringen är i skala med befintlig not eller om en ny not ska skapas som `ersätter:` den gamla. Uppdatera `ändrad:` och `senaste-översyn:`.
4. **Hantera källor** — vid nytt källreferens: sök befintlig källnot; om saknas, skapa; klassificera trovärdighet; degradera eller avvisa svaga källor.
5. **Strukturellt underhåll** (autonomt tillåtet) — hitta och fixa brutna wikilinks, uppdatera MOC:er, bygga cross-links mellan publicerade noter där det finns ämnessamband, sortera och städa index.
6. **Föråldring** — vid task eller autonom upptäckt av gammal `senaste-översyn:`, markera `status: föråldrad` och notifiera ansvarig expert.

Varje flöde beskrivs steg-för-steg i `references/ARBETSFLÖDEN.md`.

## Autonomi-gräns

| Uppgift | Självständigt? |
|---|---|
| Skapa, uppdatera eller flytta MOC:er | Ja |
| Bygga cross-links mellan publicerade noter | Ja |
| Fixa brutna wikilinks | Ja |
| Uppdatera index i `/00_Index/` | Ja |
| Markera föråldrad-kandidater | Ja (men flagga till expert innan ändring av innehåll) |
| Formulera eller omformulera påståenden | Nej — alltid expertdialog |
| Skapa eller ändra en källnots trovärdighetsbedömning | Nej — dialog med expert om osäkert |
| Flytta utkast till publicerad | Nej — kräver explicit godkännande |

## Dialogmönster med expert

När agenten behöver expert-input:
- **Källa saknas** för ett påstående → be experten om URL, eller föreslå att påståendet tonas ner/tas bort.
- **Källa svag** (tertiär, otydlig upphovsman) → be experten om bättre primärkälla eller godkännande att markera påståendet som `osäkerhet: hög`.
- **Formulering oklar** → citera den otydliga meningen, föreslå 2–3 alternativ, låt experten välja.
- **Duplikat upptäckt** → visa befintlig konceptnot och nya utkastet, fråga om ersättning, komplement, eller sammanslagning.

Detaljer i `references/ARBETSFLÖDEN.md`.

## Filstruktur för skillen

```text
paperclip/skills/local/obsidian-master/
  SKILL.md                    # Överblick, grundprinciper, beslutspunkter
  references/
    VAULT.md                  # Mappstruktur i detalj, vad hör hemma var, exempel
    FRONTMATTER.md            # Full schema-referens per nottyp, alla fält, exempel
    VERIFIERING.md            # Källkritik, trovärdighetsmatris, hantering av misslyckad verifiering
    ARBETSFLÖDEN.md           # Steg-för-steg för de sex flödena, dialogmönster
  mallar/
    mall-konceptnot.md        # Template med korrekt frontmatter och struktur
    mall-moc.md
    mall-källa.md
    mall-expertprofil.md
    mall-expertnot.md
```

`SKILL.md` hålls kort och pekar in i `references/` för detaljer. Agenten läser `SKILL.md` först, sedan bara de referenser som behövs för den aktuella tasken.

## Relation till andra skills

- **`obsidian-markdown`** — all Obsidian-syntax (wikilinks, callouts, embeds, frontmatter-syntax). Denna skill använder men beskriver inte syntaxen.
- **`docrec-svensk-offentlig`** — används av obsidian-master för att hitta primärkällor i svenska offentliga dokument (SOU, propositioner, betänkanden) när en expert saknar referens.
- **`expert-lardomsextraktion`** — kan anropas för att destillera lärdomar från en expertnot innan publicering.

## Icke-mål

- Hantering av hur tasks levereras (paperclip-plattformen sköter det).
- Skill-generering från vaulten (separat framtida arbete).
- Stöd för icke-svenska källor — skillen antar svensk kontext (SOU, propositioner, myndigheter).
- Obsidian-plugins eller -konfiguration — antar bara en standard Obsidian-vault.
- Versionskontroll av vaultens historia — antas skötas av Obsidian/Git utanför skillens scope.

## Framgångskriterier

1. Agenten kan på egen hand ta en expertrapport och producera ett utkast med korrekt frontmatter och rätt placering i vaulten.
2. Alla publicerade konceptnoter har verifierade primärkällor och fungerande fotnoter.
3. Grafen är sammanhängande — varje konceptnot är nåbar via minst en MOC och har minst en källnot-länk per påstående.
4. En framtida skill-generator kan filtrera fram "publicerade konceptnoter ägda av expert X i område Y" via frontmatter.
5. Agenten skiljer tydligt på vad den får göra självständigt (struktur) och vad som kräver expertdialog (innehåll).
