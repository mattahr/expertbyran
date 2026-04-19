# Implementationsplan — `obsidian-master` skill

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skapa paperclip-skill `obsidian-master` som styr hur en agent kurerar Expertbyråns Obsidian-vault — med fem nottyper, hård källverifiering, livscykelhantering och grafdisciplin — så vaulten senare kan mata skill-generering.

**Architecture:** En SKILL.md-fil med principer och beslutslogik, fyra referensfiler (VAULT, FRONTMATTER, VERIFIERING, ARBETSFLÖDEN) som bärar detaljerna, och fem mallar/-filer som templatar varje nottyp. Inget registreras i `.paperclip.yaml` — paperclip upptäcker skills via filsystemet.

**Tech Stack:** Ren markdown med YAML-frontmatter. Paperclip-konventioner (`name`, `slug`, `metadata.paperclip.skillKey`). Svenska genomgående (å, ä, ö).

**Spec:** [`docs/superpowers/specs/2026-04-19-obsidian-master-skill-design.md`](../specs/2026-04-19-obsidian-master-skill-design.md) — läs före implementation, den är källan till innehållet.

---

## Filstruktur som skapas

```text
paperclip/skills/local/obsidian-master/
  SKILL.md                     ~180 rader — overblick, principer, beslutslogik
  references/
    VAULT.md                   ~140 rader — mappstruktur, exempel per mapp
    FRONTMATTER.md             ~180 rader — full schema per nottyp
    VERIFIERING.md             ~160 rader — källkritikprotokoll, trovärdighetsmatris
    ARBETSFLÖDEN.md            ~250 rader — sex arbetsflöden + dialogmönster
  mallar/
    mall-konceptnot.md
    mall-moc.md
    mall-källa.md
    mall-expertprofil.md
    mall-expertnot.md
```

---

### Task 1: Skapa skill-katalog och SKILL.md

**Files:**
- Create: `paperclip/skills/local/obsidian-master/SKILL.md`

Referens till spec: sektion "Syfte", "Grundprinciper", "Fem nottyper", "Livscykel och status", "Autonomi-gräns". SKILL.md ska vara kort och peka vidare till referenserna för detaljer.

- [ ] **Steg 1: Skapa katalog**

```bash
mkdir -p paperclip/skills/local/obsidian-master/references \
         paperclip/skills/local/obsidian-master/mallar
```

- [ ] **Steg 2: Skriv SKILL.md**

Innehåll (komplett fil):

````markdown
---
name: "obsidian-master"
description: "Kuraterar Expertbyråns delade Obsidian-vault som verifierbar kunskapsbas. Använd när en expert rapporterar ny kunskap, när källor ska hanteras, när utkast ska flyttas till publicerat innehåll, eller när MOC:er, index och länkar behöver underhåll. Varje publicerat påstående måste ha primärkälla med URL och markdown-fotnot."
slug: "obsidian-master"
metadata:
  paperclip:
    slug: "obsidian-master"
    skillKey: "local/expertbyran/obsidian-master"
  skillKey: "local/expertbyran/obsidian-master"
key: "local/expertbyran/obsidian-master"
---

# Obsidian-master — kurerande vault-agent

Du äger Expertbyråns Obsidian-vault. Den är en gemensam, verifierbar kunskapsbas som ska mata senare skill-generering per expertområde. Dina tasks kommer från paperclip-plattformen — du får inte själv leta upp arbete, men du får utföra strukturellt underhåll inom en tilldelad task.

**Viktigt:** Obsidian-syntax (wikilinks, callouts, embeds, frontmatter-syntax) hanteras av skillen `obsidian-markdown`. Denna skill pratar om **innehåll, metadata, struktur, arbetsflöden** — inte syntax.

## Grundprinciper (icke-förhandlingsbara)

1. **Verifierbarhet.** Varje påstående i en publicerad not har en URL + markdown-fotnot till en källnot. Inga undantag.
2. **Hård källkritik.** Primärkälla > sekundär > tertiär. Svaga källor (blogg, Wikipedia utan sekundärkälla, pressmeddelanden som förstahandskälla) avvisas eller degraderar noten till `utkast`. Se [references/VERIFIERING.md](references/VERIFIERING.md).
3. **Expertens röst, agentens struktur.** Innehåll (påståenden, källor, formuleringar) kräver alltid dialog med expert. Strukturellt underhåll (MOC, länkar, index) får du sköta självständigt inom en task.
4. **Grafen är produkten.** Länkdisciplin är obligatorisk. En konceptnot utan MOC-länk och källnot-fotnoter är ofärdig.
5. **Maskinläsbar metadata.** Frontmatter följs exakt per nottyp. Se [references/FRONTMATTER.md](references/FRONTMATTER.md).

## Vault-struktur (platt)

```text
/00_Index/                       MOC:er: expertkarta, områdeskarta, källkatalog
/Experter/[expert-slug]/         En mapp per paperclip-agent (t.ex. metod-statistik-petra)
/Områden/{Metod,Domän,Allmänt}/  Kanonisk, publicerad kunskap
/Källor/                         En fil per källa, återanvänds via wikilink
/_Mallar/                        Obsidian templates
```

Regler, exempel och vad som hör hemma var: [references/VAULT.md](references/VAULT.md).

## Fem nottyper

| Typ | Var | Syfte |
|-----|-----|-------|
| `konceptnot` | `/Områden/.../*.md` | Kärninnehåll — verifierade påståenden |
| `moc` | `/Områden/.../_*.md` | Områdeskarta (Map of Content) |
| `källa` | `/Källor/.../*.md` | En per källa — citering, trovärdighet, URL |
| `expertprofil` | `/Experter/[expert]/_index.md` | Expertens landningsnot |
| `expertnot` | `/Experter/[expert]/*.md` | Utkast, framingar, personliga resonemang |

## Livscykel

`utkast` → `verifierad` → `publicerad` → (eventuellt) `föråldrad`

| Status | Plats | Får länkas in från publicerad not? |
|--------|-------|-----------------------------------|
| `utkast` | `/Experter/[expert]/` | Nej |
| `verifierad` | `/Experter/[expert]/` fortfarande | Nej |
| `publicerad` | `/Områden/.../` | Ja |
| `föråldrad` | `/Områden/.../` (flyttas ej) | Ja, men markera att innehållet är under översyn |

**Hård regel:** Endast `status: publicerad` får wikilänkas in från en annan publicerad not.

## Autonomi-gräns

| Uppgift | Självständigt? |
|---------|---------------|
| Uppdatera eller skapa MOC-filer | Ja |
| Bygga cross-links mellan publicerade noter | Ja |
| Fixa brutna wikilinks | Ja |
| Uppdatera index i `/00_Index/` | Ja |
| Markera föråldrad-kandidater | Ja (flagga innan innehållsändring) |
| Formulera/omformulera påståenden | Nej — dialog med expert |
| Klassificera källas trovärdighet | Nej vid osäkerhet — dialog med expert |
| Flytta utkast → publicerad | Nej — kräver expertens godkännande |

## När en task kommer in

1. **Läs tasken noga.** Identifiera: vilken expert, vilket ämne, vilken typ av arbete (ny kunskap, uppdatering, strukturellt underhåll).
2. **Slå upp expertens profil** i `/Experter/[expert-slug]/_index.md` för att förstå ansvarsområden.
3. **Sök i vaulten** efter befintlig kunskap i ämnet (duplicate-detection — se arbetsflöde 1).
4. **Välj rätt arbetsflöde** ur [references/ARBETSFLÖDEN.md](references/ARBETSFLÖDEN.md):
   - Arbetsflöde 1: Ta emot ny kunskap
   - Arbetsflöde 2: Flytta utkast → publicerad
   - Arbetsflöde 3: Uppdatera befintlig konceptnot
   - Arbetsflöde 4: Hantera källor
   - Arbetsflöde 5: Strukturellt underhåll (autonomt tillåtet)
   - Arbetsflöde 6: Föråldring
5. **Följ arbetsflödet steg för steg.** Dialoga med experten om innehåll, agera självständigt om struktur.
6. **Rapportera tillbaka** vad som gjorts, inklusive eventuella flaggade problem.

## Relation till andra skills

- **`obsidian-markdown`** — all Obsidian-syntax. Använd för wikilinks, callouts, embeds.
- **`docrec-svensk-offentlig`** — sök primärkällor i SOU, propositioner, betänkanden när expert saknar referens.
- **`expert-lardomsextraktion`** — anropa för att destillera lärdomar från en expertnot innan publicering.

## Mallar

När du skapar en ny not, börja med rätt mall från [mallar/](mallar/):

- [mallar/mall-konceptnot.md](mallar/mall-konceptnot.md)
- [mallar/mall-moc.md](mallar/mall-moc.md)
- [mallar/mall-källa.md](mallar/mall-källa.md)
- [mallar/mall-expertprofil.md](mallar/mall-expertprofil.md)
- [mallar/mall-expertnot.md](mallar/mall-expertnot.md)
````

- [ ] **Steg 3: Verifiera struktur och YAML-frontmatter**

```bash
test -f paperclip/skills/local/obsidian-master/SKILL.md && echo "OK"
test -d paperclip/skills/local/obsidian-master/references && echo "OK"
test -d paperclip/skills/local/obsidian-master/mallar && echo "OK"
```

Expected: tre `OK`-rader.

Verifiera att frontmatter parsar som giltig YAML:

```bash
python3 -c "
import yaml, re
with open('paperclip/skills/local/obsidian-master/SKILL.md') as f:
    content = f.read()
m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
assert m, 'Ingen frontmatter hittad'
data = yaml.safe_load(m.group(1))
assert data['name'] == 'obsidian-master'
assert data['slug'] == 'obsidian-master'
assert data['key'] == 'local/expertbyran/obsidian-master'
print('Frontmatter OK')
"
```

Expected: `Frontmatter OK`

- [ ] **Steg 4: Commit**

```bash
git add paperclip/skills/local/obsidian-master/SKILL.md \
        paperclip/skills/local/obsidian-master/references \
        paperclip/skills/local/obsidian-master/mallar
git commit -m "feat(obsidian-master): skill-skelett med SKILL.md och katalogstruktur"
```

---

### Task 2: references/VAULT.md — vault-struktur i detalj

**Files:**
- Create: `paperclip/skills/local/obsidian-master/references/VAULT.md`

Referens till spec: sektion "Vault-struktur". Denna referens ska ha konkreta exempel på vad som hör hemma i varje mapp, namngivningskonventioner för filer, och tecken-för-tecken-regler.

- [ ] **Steg 1: Skriv VAULT.md**

Innehåll (komplett fil):

````markdown
# VAULT-struktur i detalj

## Toppmappar

```text
/00_Index/           MOC:er som navigerar hela vaulten
/Experter/           Per-expert-mappar
/Områden/            Kanonisk publicerad kunskap
/Källor/             Återanvändbara källnoter
/_Mallar/            Obsidian templates för nya noter
```

Inga fler toppmappar. Inga under-under-mappar utöver de som anges nedan.

## `/00_Index/`

Innehåller MOC:er som navigerar tvärs över hela vaulten:

- `00_Index/expertkarta.md` — listar alla expertprofiler, deras roller och primära områden
- `00_Index/områdeskarta.md` — listar alla områden med länkar till respektive MOC
- `00_Index/källkatalog.md` — gruppering av källor per källtyp och organisation

Dessa uppdateras autonomt av obsidian-master när nya experter, områden eller källor tillkommer.

## `/Experter/[expert-slug]/`

En mapp per paperclip-agent. Slugen matchar paperclip-agentens slug exakt (t.ex. `metod-statistik-petra`, `domän-socialförsäkring-sven`).

Innehåll:

- `_index.md` — **expertprofil** (obligatorisk). Landningsnot: vem, vad, ansvarsområden.
- `[ämne].md` — **expertnot**: utkast, framingar, personliga resonemang. Fri filnamngivning (t.ex. `tankar-om-urvalsmetodik.md`, `utkast-sprakbruk-prop-2024-25.md`).

**Regler:**

- Endast expertens egen slug får äga en mapp under `/Experter/`.
- Innehåll i `/Experter/[X]/` får aldrig läka in i publicerade konceptnoter under `/Områden/` via wikilink.
- Utkast som blir publicerade flyttas fysiskt till rätt `/Områden/`-mapp (inte kopieras).

## `/Områden/`

Tre underkategorier — ingen ytterligare nivå under dessa:

```text
/Områden/Metod/[område]/              Metodkunskap
/Områden/Domän/[område]/              Domänkunskap
/Områden/Allmänt/[område]/            Cross-cutting: ISSAI, revisionsprocess, klarspråk
```

**Områdesnamn (platta):**

- `/Områden/Metod/statistik/`
- `/Områden/Metod/intervjuteknik/`
- `/Områden/Metod/dokumentanalys/`
- `/Områden/Domän/socialförsäkring/`
- `/Områden/Domän/försvar/`
- `/Områden/Domän/arbetsmarknad/`
- `/Områden/Allmänt/issai/`
- `/Områden/Allmänt/revisionsprocess/`
- `/Områden/Allmänt/klarspråk/`

**Innehåll per områdesmapp:**

- `_[område].md` — **MOC** (obligatorisk, en per område). Områdeskartan. Namnet börjar med `_` så den sorteras överst.
- `*.md` — **konceptnoter**. Filnamn ska spegla konceptet (t.ex. `regression-med-kontrollvariabler.md`, `semistrukturerad-intervju.md`).

**Filnamnsregler:**

- Små bokstäver, bindestreck som ordseparator, inte mellanslag
- Använd åäö i filnamn (inte ae/aa/oe)
- Inga datum i filnamn (datum lever i frontmatter)
- Max ~60 tecken

## `/Källor/`

Fem underkategorier — ingen ytterligare nivå:

```text
/Källor/tryck/                  SOU, propositioner, betänkanden, skrivelser
/Källor/myndigheter/            En fil per myndighet (SCB.md, Försäkringskassan.md)
/Källor/lagrum/                 Lagar och förordningar
/Källor/databaser/              Kolada, SCB-tabeller, öppna data
/Källor/personer-externt/       Namngivna externa experter som primärkällor
```

**Filnamnsregler för källnoter:**

- `SOU-2024-45.md` (inte `SOU 2024:45 - Arbetsmarknaden.md`)
- `prop-2023-24-110.md`
- `bet-2024-25-AU5.md`
- `SCB.md` (inte `Statistiska-Centralbyran.md`)
- `socialförsäkringsbalken.md`

Beskrivande titel och fullständig citering hör till frontmatter och rubriknivå inuti filen.

**En källa existerar en gång.** Om en SOU behövs på flera ställen — en enda källnot, alla refererar dit via wikilink.

## `/_Mallar/`

Obsidian-templates, en per nottyp. Dessa används via Obsidians template-funktion när experten eller agenten skapar nya noter:

- `_Mallar/mall-konceptnot.md`
- `_Mallar/mall-moc.md`
- `_Mallar/mall-källa.md`
- `_Mallar/mall-expertprofil.md`
- `_Mallar/mall-expertnot.md`

(Dessa är kopior av mallarna som ligger i själva skillen under `mallar/` — vaulten har sin egen kopia för Obsidians template-plugin.)

## Vad hör hemma var — beslutstabell

| Situation | Nottyp | Plats |
|-----------|--------|-------|
| Expert lämnar ett nytt koncept för granskning | `expertnot` (status: utkast) | `/Experter/[expert]/` |
| Expertens personliga tolkning, inte kanonisk | `expertnot` (status: utkast) | `/Experter/[expert]/` |
| Kanonisk kunskap verifierad mot primärkälla | `konceptnot` (status: publicerad) | `/Områden/.../` |
| Samlad översikt över ett område | `moc` | `/Områden/.../_[område].md` |
| Ny SOU att referera till | `källa` | `/Källor/tryck/SOU-YYYY-N.md` |
| Ny myndighet att referera till | `källa` | `/Källor/myndigheter/[namn].md` |
| Ny expertprofil för nyintagen agent | `expertprofil` | `/Experter/[slug]/_index.md` |
````

- [ ] **Steg 2: Verifiera**

```bash
test -f paperclip/skills/local/obsidian-master/references/VAULT.md && \
  wc -l paperclip/skills/local/obsidian-master/references/VAULT.md
```

Expected: filen finns, ~120–150 rader.

- [ ] **Steg 3: Commit**

```bash
git add paperclip/skills/local/obsidian-master/references/VAULT.md
git commit -m "docs(obsidian-master): lägg till VAULT.md med mappstruktur och beslutstabell"
```

---

### Task 3: references/FRONTMATTER.md — fulla scheman

**Files:**
- Create: `paperclip/skills/local/obsidian-master/references/FRONTMATTER.md`

Referens till spec: sektion "Frontmatter-scheman". Denna referens ska ha alla fält för alla fem nottyper med fullt ifyllda exempel och enums explicit listade.

- [ ] **Steg 1: Skriv FRONTMATTER.md**

Innehåll (komplett fil):

````markdown
# Frontmatter-scheman per nottyp

Alla noter i vaulten har YAML-frontmatter högst upp i filen. Syntaxen följer Obsidians property-konventioner — se skillen `obsidian-markdown` för syntaxdetaljer.

## Gemensamma fält (alla nottyper)

```yaml
typ: konceptnot | moc | källa | expertprofil | expertnot
skapad: YYYY-MM-DD                    # ISO-datum, sätts vid första skrivning
ändrad: YYYY-MM-DD                    # ISO-datum, uppdateras vid varje ändring
beskrivning: "En rad som förklarar vad noten handlar om"
```

## Konceptnot — fullt schema

```yaml
typ: konceptnot
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: "Regression med kontrollvariabler — när och hur"
expert: [metod-statistik-petra]                   # primär(a) bidragsgivare, lista
område: "[[_statistik]]"                          # wikilink till MOC (obligatorisk)
relaterade_experter: [domän-socialförsäkring-sven] # för cross-skill, valfri
sökord: [regression, kausalitet, kontrollvariabler, kvantitativ-metod]
status: utkast | verifierad | publicerad | föråldrad
senaste-översyn: 2026-04-19                       # när påståenden senast granskades
osäkerhet: låg | medel | hög                      # experten egen bedömning
ersätter: "[[gammal-konceptnot]]"                 # valfri, endast om noten ersätter äldre
```

**Regler:**

- `expert:` måste matcha en paperclip-agent-slug som har en profil under `/Experter/`
- `område:` måste peka på en existerande MOC
- `status: publicerad` kräver att alla påståenden har fotnot till källnot
- `senaste-översyn:` uppdateras vid varje genomgång, inte bara vid ändring

## MOC — fullt schema

```yaml
typ: moc
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: "Områdeskarta för statistik"
område: statistik                                 # strängnamn, ska matcha mappnamn
ansvarig_expert: [metod-statistik-petra]         # huvudansvarig
ingående_experter: [metod-statistik-petra, domän-arbetsmarknad-anna]
```

**Regler:**

- En MOC per `/Områden/.../`-mapp
- Filnamn: `_[område].md` (understreck i början för sortering)
- `område:`-strängen ska matcha mappnamnet exakt (lowercase, bindestreck)

## Källa — fullt schema

```yaml
typ: källa
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: "SOU 2024:45 om arbetsmarknadspolitiken efter pandemin"
källtyp: sou | prop | betänkande | skrivelse | myndighet | lag | databas | artikel | bok | person
trovärdighet: primär | sekundär | tertiär
url: https://www.regeringen.se/rattsliga-dokument/statens-offentliga-utredningar/2024/05/sou-202445/
publicerad: 2024-05-12                            # originalkällans publiceringsdatum
organisation: Arbetsmarknadsdepartementet
upphovsperson: "Namn Efternamn"                   # valfri, när relevant
ämnesområden: [arbetsmarknad, statistik]         # vilka /Områden/-konceptnoter kan använda denna
```

**Källtyp → trovärdighet (riktlinje):**

| Källtyp | Typisk trovärdighet |
|---------|---------------------|
| `sou`, `prop`, `betänkande`, `skrivelse` | primär |
| `lag` | primär |
| `myndighet` (officiell statistik, regleringsbrev) | primär |
| `databas` (SCB, Kolada med spårbar källa) | primär |
| `artikel` (peer-reviewed) | primär eller sekundär beroende på kontext |
| `bok` (facklitteratur) | sekundär |
| `person` (namngivet intervjucitat) | primär om primär vittne, annars sekundär |
| Blogg, pressmeddelande, Wikipedia | tertiär (avvisas som huvudkälla) |

Se [VERIFIERING.md](VERIFIERING.md) för full källkritikprotokoll.

## Expertprofil — fullt schema

```yaml
typ: expertprofil
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: "Expertprofil för Petra — metodexpert, statistik"
expert: metod-statistik-petra                     # slug, matchar paperclip-agent
roll: metodexpert | domänexpert
ämnesområden: ["[[_statistik]]", "[[_dokumentanalys]]"]
```

**Regler:**

- En expertprofil per expert, alltid i `/Experter/[slug]/_index.md`
- `ämnesområden:` är wikilinks till MOC:er experten aktivt bidrar till

## Expertnot — fullt schema

```yaml
typ: expertnot
skapad: 2026-04-19
ändrad: 2026-04-19
beskrivning: "Utkast: samband mellan urvalsstorlek och kausal inferens"
expert: metod-statistik-petra                     # ägande expert
status: utkast | verifierad                       # aldrig publicerad
publicerad_i: "[[konceptnot-x]]"                  # valfri, om noten har flyttats och publicerats
```

**Regler:**

- Expertnoter lever alltid under `/Experter/[expert]/`
- `status: publicerad` tillåts inte — då ska noten flyttas till `/Områden/` och typen bytas till `konceptnot`
- `publicerad_i:` backlinkas när expertnoten har blivit källan till en publicerad konceptnot (för spårbarhet)

## Vanliga fel att undvika

1. **Saknat `område:` på konceptnot** — konceptnoten kan inte länkas från MOC.
2. **`status: publicerad` utan källfotnoter** — graf-integriteten bryter.
3. **`expert:` som sträng istället för lista** — fältet tar alltid en lista även vid en enda expert: `expert: [slug]`.
4. **Datum som sträng med snedstreck** — använd ISO `YYYY-MM-DD`, inte `2026/04/19`.
5. **Wikilink utan hakparenteser** — fältet `område:` kräver faktisk wikilink-syntax `"[[_statistik]]"`, inte bara strängen `"statistik"`.
````

- [ ] **Steg 2: Verifiera**

```bash
wc -l paperclip/skills/local/obsidian-master/references/FRONTMATTER.md
```

Expected: ~160–180 rader.

- [ ] **Steg 3: Commit**

```bash
git add paperclip/skills/local/obsidian-master/references/FRONTMATTER.md
git commit -m "docs(obsidian-master): lägg till FRONTMATTER.md med scheman per nottyp"
```

---

### Task 4: references/VERIFIERING.md — källkritikprotokoll

**Files:**
- Create: `paperclip/skills/local/obsidian-master/references/VERIFIERING.md`

Referens till spec: sektion "Grundprinciper" punkt 2 och "Arbetsflöden" nummer 4. Denna referens ska ha trovärdighetsmatris, operativa steg för att verifiera ett påstående, och beslutsträd för vad som händer när en källa är svag eller saknas.

- [ ] **Steg 1: Skriv VERIFIERING.md**

Innehåll (komplett fil):

````markdown
# Verifieringsprotokoll

Varje påstående i en **publicerad konceptnot** måste ha en URL + markdown-fotnot till en **källnot** i `/Källor/`. Utkast och expertnoter får innehålla overifierat material, men då ska påståendena markeras tydligt.

## Stegen i verifiering

När du verifierar ett påstående:

1. **Identifiera källan.** Experten har lämnat en referens, eller du föreslår en. Om ingen referens — dialog med experten (se [ARBETSFLÖDEN.md](ARBETSFLÖDEN.md), dialogmönster "källa saknas").
2. **Hämta URL:en.** Testa att sidan svarar (HTTP 200). Om 404 eller timeout — ny källa, dialog.
3. **Läs sidan.** Kontrollera att påståendet faktiskt stöds av innehållet. Citera gärna textpassagen i källnoten för spårbarhet.
4. **Bedöm trovärdighet.** Använd tabellen nedan. Om tveksamt — dialog med expert.
5. **Skapa eller uppdatera källnoten** i `/Källor/`. En källa existerar en gång. Se [VAULT.md](VAULT.md) för filnamnsregler.
6. **Lägg in fotnot** i konceptnoten med wikilink till källnoten.

## Trovärdighetsmatris

Används för att sätta `trovärdighet:`-fältet på källnoten.

### Primär

Ska utgöra majoriteten av källorna i en publicerad konceptnot.

| Källtyp | Exempel |
|---------|---------|
| Lagstiftning | Socialförsäkringsbalken, regeringsformen |
| Riksdagstryck | SOU, proposition, betänkande, skrivelse, motion |
| Myndighetspublikation (officiell) | Regleringsbrev, instruktioner, årsredovisning, officiella beslut |
| Officiell statistik | SCB-tabeller med spårbar metodbeskrivning, Kolada |
| Primär vittne (citerad person) | Namngivet expertintervju med verifierbar identitet |
| Peer-reviewed vetenskaplig artikel | Publicerad i indexerad tidskrift |

### Sekundär

Får finnas i en konceptnot men bör kompletteras med primär källa.

| Källtyp | Exempel |
|---------|---------|
| Facklitteratur | Lärobok, monografi |
| Myndighetsrapport (ej officiell publikation) | Analysrapport, uppföljning utan formell status |
| Etablerad journalistik | DN Debatt, SvD Näringsliv med spårbar källa |
| Sekundär tolkning av primärkälla | Forskningsöversikt, kommenterad lagtext |

### Tertiär

Får **inte** vara huvudkälla. Kan användas som pekare till primärkälla.

| Källtyp | Exempel |
|---------|---------|
| Blogg utan spårbar auktoritet | Branschbloggar, opinionstexter |
| Wikipedia utan sekundärkälla | Wikipedia-sida utan källhänvisningar |
| Pressmeddelanden som förstahandskälla | PR-texter, företagsblogg |
| Tredjehandsintervjuer | "Enligt obekräftade uppgifter …" |

## Beslutsträd: vad gör du med en källa?

```text
Är källan primär?
├── Ja → Använd, citera i konceptnoten.
└── Nej → Är den sekundär?
    ├── Ja → Använd, men flagga till experten: "Finns primärkälla?"
    │        - Om ja: lägg till primärkälla, behåll sekundär som kompletterande
    │        - Om nej: använd sekundär men sätt osäkerhet: medel på konceptnoten
    └── Nej → Tertiär. Avvisa som huvudkälla.
        - Om noten redan är publicerad: flytta tillbaka till /Experter/, status: utkast
        - Dialog med expert: "Tertiär källa — behöver primär eller sekundär"
```

## Vad händer när verifiering misslyckas?

| Situation | Åtgärd |
|-----------|--------|
| Påståendet saknar källa | Dialog med expert: be om referens eller föreslå att påståendet tonas ner |
| URL:en svarar 404 | Sök efter arkiverad version (Wayback Machine), annars dialog |
| Källan hittas men stödjer inte påståendet | Flagga till expert med citat från källa + påstående. Experten får välja: omformulera, byta källa, eller ta bort påståendet |
| Källan är tertiär | Se beslutsträd ovan |
| Källan är primär men inaktuell (upphävd lag, föråldrad statistik) | Dialog med expert: finns nyare primärkälla? Om inte: markera `osäkerhet: medel` och notera i noten |
| Källan är primär men svårläst (PDF utan OCR, skannat) | Transkribera relevant passage till källnotens brödtext. Bekräfta med expert. |

## Fotnotsyntax i konceptnot

Markdown-fotnot länkas till källnot via wikilink:

```markdown
Regression med kontrollvariabler förutsätter att kontrollvariablerna inte själva
är påverkade av behandlingen[^sou-2024-45].

[^sou-2024-45]: Se [[SOU-2024-45]], kapitel 4.
```

Fotnoten refererar alltid **via wikilink** till en källnot — aldrig en extern URL direkt i fotnoten. URL:en bor i källnoten.

## När experten insisterar på en svag källa

Om experten argumenterar för att en tertiär källa bör räknas som acceptabel:

1. Notera argumentet i noten (inline-kommentar eller callout).
2. Sätt `osäkerhet: hög` på konceptnoten.
3. Flagga fallet i rapporten till tasken — `obsidian-master` kan inte ensam besluta att avvika från trovärdighetsmatrisen.
4. Dokumentera i `/00_Index/` vilka konceptnoter som kör på avsteg.

Detta är ett **undantag**, inte ett mönster. Om det händer ofta med en viss expert — eskalera till konsultchef.
````

- [ ] **Steg 2: Verifiera**

```bash
wc -l paperclip/skills/local/obsidian-master/references/VERIFIERING.md
```

Expected: ~140–170 rader.

- [ ] **Steg 3: Commit**

```bash
git add paperclip/skills/local/obsidian-master/references/VERIFIERING.md
git commit -m "docs(obsidian-master): lägg till VERIFIERING.md med källkritikprotokoll"
```

---

### Task 5: references/ARBETSFLÖDEN.md — sex arbetsflöden + dialogmönster

**Files:**
- Create: `paperclip/skills/local/obsidian-master/references/ARBETSFLÖDEN.md`

Referens till spec: sektion "Arbetsflöden som skillen täcker" och "Dialogmönster med expert". Denna är den största referensen — alla sex flöden ska vara steg-för-steg med konkreta exempel på dialog.

- [ ] **Steg 1: Skriv ARBETSFLÖDEN.md**

Innehåll (komplett fil):

````markdown
# Arbetsflöden

Sex arbetsflöden täcker alla tasks obsidian-master hanterar. Identifiera rätt flöde baserat på task-beskrivningen och följ stegen.

## Arbetsflöde 1: Ta emot ny kunskap från expert

**Trigger:** Task säger "expert X har lärt sig Y, lägg in i vaulten".

**Steg:**

1. **Läs expertens material.** Anteckna vad som är påstående, vad som är tolkning, vad som är fråga.
2. **Sök efter duplicates.** I Obsidian: graf + sök på sökord, wikilink-backlinks på relaterade koncept. Kontrollera:
   - Finns redan en konceptnot i samma område?
   - Finns en expertnot hos samma expert som berör samma sak?
3. **Beslut:**
   - **Ny not** → skapa expertnot i `/Experter/[expert]/` från mall [mall-expertnot.md](../mallar/mall-expertnot.md). Status: `utkast`.
   - **Komplettering av befintlig konceptnot** → gå till Arbetsflöde 3.
   - **Duplicerar befintlig utkast** → dialog med expert (se dialogmönster "duplikat").
4. **Formulera innehåll.** Strukturera i avsnitt: kontext, huvudpåstående(n), implikation. Markera påståenden som saknar källa med `> [!todo] Källa krävs`.
5. **Gå igenom källor.** För varje påstående: kör Arbetsflöde 4 (källhantering).
6. **Dialog med experten** om något är oklart, saknas eller är svagt belagt.
7. **Rapportera till tasken:** vad som skapades, vilka påståenden som saknar källa (om någon), vad som behöver expertens svar.

## Arbetsflöde 2: Flytta utkast → publicerad

**Trigger:** Task säger "publicera X" eller expertnoten har `status: verifierad` och experten har godkänt.

**Steg:**

1. **Kontrollera verifieringsstatus.** Alla påståenden i noten ska ha fotnot till källnot. Om inte → Arbetsflöde 4 för saknade källor först.
2. **Kontrollera att källorna är primära eller sekundära.** Tertiära källor → degradera tillbaka till utkast och dialog med expert.
3. **Bestäm rätt `/Områden/`-mapp.**
   - Metodkunskap (hur man arbetar) → `/Områden/Metod/[område]/`
   - Domänkunskap (vad som gäller inom ett sakområde) → `/Områden/Domän/[område]/`
   - Cross-cutting → `/Områden/Allmänt/[område]/`
   - Vid tveksamhet: dialog med experten eller konsultchef.
4. **Flytta filen** från `/Experter/[expert]/` till `/Områden/.../`.
5. **Uppdatera frontmatter:**
   - Byt `typ: expertnot` → `typ: konceptnot`
   - Sätt `status: publicerad`
   - Sätt `område: "[[_område]]"` (wikilink till MOC)
   - Uppdatera `ändrad:` till dagens datum
   - Sätt `senaste-översyn:` till dagens datum
6. **Uppdatera MOC** i området. Lägg till wikilink till den nya konceptnoten, gruppera under rätt rubrik.
7. **Uppdatera expertprofilen** — lägg till noten i listan över bidrag (om relevant).
8. **Uppdatera `/00_Index/områdeskarta.md`** om detta är första noten i ett nytt område.
9. **Bakåtlänka** från expertnoten som nu är tom (om den finns kvar som spår): sätt `publicerad_i: "[[ny-konceptnot]]"`. Annars radera den gamla filen.
10. **Rapportera:** vilken not, vilken plats, vilka länkar som uppdaterats.

## Arbetsflöde 3: Uppdatera befintlig konceptnot

**Trigger:** Task säger "uppdatera X med ny info" eller expert har rapporterat rättelse.

**Steg:**

1. **Hitta noten.** Via sök, graf eller explicit wikilink.
2. **Bedöm ändringens natur:**
   - **Mindre rättelse eller tillägg** (ny siffra, förtydligande, ny källa) → redigera i befintlig not.
   - **Fundamental omformulering** eller motstridande innehåll → skapa ny konceptnot med `ersätter: "[[gammal-not]]"`. Sätt gamla notens `status: föråldrad` och lägg backlinking.
3. **Verifiera ny information** — Arbetsflöde 4 för nya källor.
4. **Uppdatera frontmatter:**
   - `ändrad:` → dagens datum
   - `senaste-översyn:` → dagens datum
   - `osäkerhet:` justera vid behov
5. **Uppdatera MOC** om noten bytt rubrikgrupp eller om en ersättande ny not skapats.
6. **Dialog med expert** om ändringen påverkar andra konceptnoter som länkar hit (wikilink-backlinks i Obsidian visar vilka).
7. **Rapportera:** före/efter, vilka andra noter som potentiellt påverkas.

## Arbetsflöde 4: Hantera källor

**Trigger:** Delflöde från 1, 2, 3 när en ny eller befintlig källa ska kopplas.

**Steg:**

1. **Sök efter befintlig källnot.**
   - `/Källor/tryck/` för SOU/prop/betänkande
   - `/Källor/myndigheter/` för organisationer
   - `/Källor/lagrum/` för lagar
   - `/Källor/databaser/` för öppna data
   - `/Källor/personer-externt/` för namngivna primärvittnen
2. **Om källnot finns** — använd den. Wikilänka från konceptnoten.
3. **Om källnot saknas** — skapa från mall [mall-källa.md](../mallar/mall-källa.md):
   - Följ filnamnsregeln (`SOU-YYYY-N.md`, `bet-YYYY-YY-XX.md`, etc. — se [VAULT.md](VAULT.md))
   - Fyll i frontmatter komplett
   - Inkludera relevant citat från källan i brödtexten
4. **Bedöm trovärdighet** enligt matrisen i [VERIFIERING.md](VERIFIERING.md).
5. **Verifiera URL** — hämta sidan, bekräfta att påståendet stöds. Misslyckande → dialog med expert.
6. **Uppdatera `/00_Index/källkatalog.md`** om källan är den första i sin kategori eller organisation.

## Arbetsflöde 5: Strukturellt underhåll (autonomt tillåtet)

**Trigger:** Task säger "underhåll vaulten", "laga brutna länkar", "uppdatera MOC:er", eller du upptäcker problem i annan task.

**Detta får ske självständigt utan expertdialog — men endast struktur, aldrig innehåll.**

**Möjliga åtgärder:**

1. **Brutna wikilinks.** Obsidian visar dem automatiskt. Laga om målfil har bytt namn; skapa stub om målet borde finnas; flagga om oklart.
2. **MOC-uppdatering.** För varje område, se till att alla publicerade konceptnoter i mappen är listade i MOC:en. Gruppera logiskt (förslag: efter underämne).
3. **Cross-linking.** När två publicerade konceptnoter behandlar samma sak, lägg till wikilinks i "Se även"-avsnitt. Gör detta **konservativt** — bara när kopplingen är tydlig.
4. **Index-underhåll.** Uppdatera `/00_Index/expertkarta.md`, `/00_Index/områdeskarta.md`, `/00_Index/källkatalog.md` vid behov.
5. **Sortering.** Håll MOC:er och index alfabetiskt sorterade (eller i logisk ordning om det finns naturlig sekvens).

**Får inte:**

- Ändra formuleringar i konceptnoter
- Lägga till eller ta bort påståenden
- Klassificera om källors trovärdighet
- Ändra `status:`-fält

## Arbetsflöde 6: Föråldring

**Trigger:** Task säger "gå igenom föråldrad kunskap", eller du upptäcker en konceptnot med `senaste-översyn:` äldre än ~12 månader.

**Steg:**

1. **Identifiera kandidater.** Filtrera konceptnoter där `senaste-översyn:` är > 12 månader.
2. **Kontrollera källor.** För varje not:
   - Är URL:en fortfarande giltig?
   - Har en ny SOU/prop/lag ersatt den citerade?
   - Är siffror (t.ex. SCB-statistik) fortfarande aktuella?
3. **Beslut per not:**
   - **Fortfarande aktuell** → uppdatera bara `senaste-översyn:`.
   - **Partiellt föråldrad** → sätt `status: föråldrad` + `osäkerhet: hög`, flagga till expert.
   - **Ersätts av ny kunskap** → Arbetsflöde 3 för att skapa ersättare.
4. **Rapportera:** vilka noter är granskade, vilka flaggade för expert, vilka uppdaterade.

---

## Dialogmönster med expert

Obsidian-master pratar aldrig "bara med sig själv" när det gäller innehåll. Här är mönstren för vanliga situationer.

### Dialogmönster: Källa saknas

> **Agent:** För påståendet "X leder till Y" har jag inte hittat någon primärkälla. Kan du peka på en SOU, prop, myndighetspublikation eller motsvarande som stödjer påståendet? Alternativt: kan påståendet tonas ner till "X associeras med Y" utan kausal hävning?

### Dialogmönster: Källa svag (tertiär)

> **Agent:** Den referens du lämnat, [X], är en blogg utan spårbar auktoritet — tertiär i vår källkritikmatris. Jag har sökt i [docrec-svensk-offentlig] och hittat [Y] som verkar behandla samma ämne primärt. Kan vi byta till den källan?

### Dialogmönster: Källa stödjer inte påståendet

> **Agent:** Jag har läst [källa X]. Där står: "[citat]". Ditt påstående i noten är: "[påstående]". Jag ser inte att källan stödjer just den formuleringen. Kan vi antingen (a) omformulera påståendet, (b) byta källa, eller (c) ta bort påståendet?

### Dialogmönster: Duplikat upptäckt

> **Agent:** Din nya kunskap om [Z] överlappar med befintlig konceptnot [[regression-med-kontrollvariabler]], publicerad 2026-02. Tre alternativ:
>
> 1. **Ersätt** — din version blir ny publicerad, den gamla markeras `föråldrad` och backlinks uppdateras.
> 2. **Komplettera** — jag integrerar din text i befintlig not.
> 3. **Parallellt** — vi har två noter om olika aspekter, med tydlig wikilink mellan dem.
>
> Vilket föredrar du?

### Dialogmönster: Formulering oklar

> **Agent:** Meningen "[citat]" kan tolkas på två sätt:
>
> 1. [Tolkning A]
> 2. [Tolkning B]
>
> Vilken avser du? (Eller en tredje formulering jag missat?)

### Dialogmönster: Föråldrad källa

> **Agent:** Din konceptnot [[X]] refererar till SOU 2019:N. Sedan dess har [prop 2024:M] antagits och [lag] ändrats. Bör vi:
>
> 1. Uppdatera noten med de nya primärkällorna.
> 2. Skapa en ny not som ersätter den gamla med `ersätter:`-länk.
> 3. Låta noten stå som historisk beskrivning och lägga till en callout om uppdaterat rättsläge?

---

## Tips för effektiv sökning i vaulten

Obsidians sök + graf är dina primära verktyg.

- **Sök på frontmatter-fält:** `tag:statistik`, `"expert: metod-statistik-petra"` (i quick switcher + search)
- **Wikilink-backlinks:** varje not har en baksida med vilka andra noter som länkar hit — använd för impact-analys
- **Graph view filtrerat per expert/område** för att hitta "luckor" i kunskapen
- **Orphan-sökning** (filer utan inlänkar) — hitta noter som inte är integrerade i grafen, kandidater för MOC-uppdatering
````

- [ ] **Steg 2: Verifiera**

```bash
wc -l paperclip/skills/local/obsidian-master/references/ARBETSFLÖDEN.md
```

Expected: ~220–270 rader.

- [ ] **Steg 3: Commit**

```bash
git add paperclip/skills/local/obsidian-master/references/ARBETSFLÖDEN.md
git commit -m "docs(obsidian-master): lägg till ARBETSFLÖDEN.md med sex flöden och dialogmönster"
```

---

### Task 6: mallar/ — fem templates

**Files:**
- Create: `paperclip/skills/local/obsidian-master/mallar/mall-konceptnot.md`
- Create: `paperclip/skills/local/obsidian-master/mallar/mall-moc.md`
- Create: `paperclip/skills/local/obsidian-master/mallar/mall-källa.md`
- Create: `paperclip/skills/local/obsidian-master/mallar/mall-expertprofil.md`
- Create: `paperclip/skills/local/obsidian-master/mallar/mall-expertnot.md`

Mallarna är körbara templates — kopiera, ersätt platshållare `{{...}}` med faktiska värden.

- [ ] **Steg 1: Skriv mall-konceptnot.md**

````markdown
---
typ: konceptnot
skapad: {{date:YYYY-MM-DD}}
ändrad: {{date:YYYY-MM-DD}}
beskrivning: "{{kort beskrivning — en rad}}"
expert: [{{expert-slug}}]
område: "[[_{{område}}]]"
relaterade_experter: []
sökord: [{{sökord1}}, {{sökord2}}]
status: utkast
senaste-översyn: {{date:YYYY-MM-DD}}
osäkerhet: låg
---

# {{Koncepttitel}}

## Kontext

{{Kort om när och varför detta koncept är relevant}}

## Huvudpåstående

{{Centralt påstående, kort}}[^källa1].

## Resonemang

{{Bredare förklaring med ytterligare påståenden}}[^källa2].

## Implikation för effektivitetsrevision

{{Hur används kunskapen konkret i Riksrevisionens arbete?}}

## Se även

- [[{{relaterad-konceptnot}}]]

[^källa1]: Se [[{{källnot1}}]].
[^källa2]: Se [[{{källnot2}}]], avsnitt {{X}}.
````

- [ ] **Steg 2: Skriv mall-moc.md**

````markdown
---
typ: moc
skapad: {{date:YYYY-MM-DD}}
ändrad: {{date:YYYY-MM-DD}}
beskrivning: "Områdeskarta för {{område}}"
område: {{område}}
ansvarig_expert: [{{primär-expert-slug}}]
ingående_experter: [{{primär-expert-slug}}]
---

# Områdeskarta — {{Område}}

{{Kort inledning: vad täcker området, vem äger det, hur är det strukturerat}}

## Grunder

- [[{{grundkoncept1}}]]
- [[{{grundkoncept2}}]]

## Tekniker och metoder

- [[{{teknik1}}]]
- [[{{teknik2}}]]

## Fallgropar och vanliga misstag

- [[{{fallgrop1}}]]

## Tillämpning på effektivitetsrevision

{{Hur omsätts området konkret i Riksrevisionens arbete?}}

## Relaterade områden

- [[_{{relaterat-område1}}]]
- [[_{{relaterat-område2}}]]

## Bidragsgivande experter

- [[{{expert1-slug}}/_index|{{Expertnamn1}}]]
- [[{{expert2-slug}}/_index|{{Expertnamn2}}]]
````

- [ ] **Steg 3: Skriv mall-källa.md**

````markdown
---
typ: källa
skapad: {{date:YYYY-MM-DD}}
ändrad: {{date:YYYY-MM-DD}}
beskrivning: "{{fullständig titel kort}}"
källtyp: {{sou | prop | betänkande | skrivelse | myndighet | lag | databas | artikel | bok | person}}
trovärdighet: {{primär | sekundär | tertiär}}
url: {{https://...}}
publicerad: {{YYYY-MM-DD}}
organisation: {{organisation}}
upphovsperson: ""
ämnesområden: [{{ämne1}}]
---

# {{Fullständig titel}}

**Källtyp:** {{Källtyp}}
**Utgivare:** {{organisation}}
**Publicerad:** {{datum}}
**URL:** [{{kort beskrivning}}]({{url}})

## Citering (Oxford/Harvard-stil)

{{Fullständig citering}}

## Relevans för vaulten

{{Varför är denna källa värdefull? Vilka ämnesområden täcker den?}}

## Nyckelcitat

> {{Relevant passage från källan, ordagrant}}

— {{källa}}, s. {{sida}}

## Användning

Konceptnoter som refererar till denna källa:

{{uppdateras av obsidian-master vid användning, eller via Obsidians backlinks}}
````

- [ ] **Steg 4: Skriv mall-expertprofil.md**

````markdown
---
typ: expertprofil
skapad: {{date:YYYY-MM-DD}}
ändrad: {{date:YYYY-MM-DD}}
beskrivning: "Expertprofil för {{förnamn}} — {{roll}}, {{huvudområde}}"
expert: {{expert-slug}}
roll: {{metodexpert | domänexpert}}
ämnesområden: ["[[_{{område1}}]]", "[[_{{område2}}]]"]
---

# {{Expertnamn}} — {{roll}}

## Om mig

{{Kort om expertens bakgrund, specialitet och arbetssätt. 2–4 meningar.}}

## Ansvarsområden

- [[_{{område1}}]] — primär
- [[_{{område2}}]] — bidragande

## Arbetssätt

{{Hur experten typiskt jobbar — metodfokus, vanliga frågor experten är bra på att svara på, erfarenhetsfält.}}

## Publicerade konceptnoter

{{uppdateras när nya konceptnoter publiceras med denna expert som primär bidragsgivare}}

## Pågående utkast

{{lista expertnoter med status: utkast eller verifierad}}
````

- [ ] **Steg 5: Skriv mall-expertnot.md**

````markdown
---
typ: expertnot
skapad: {{date:YYYY-MM-DD}}
ändrad: {{date:YYYY-MM-DD}}
beskrivning: "{{kort beskrivning}}"
expert: {{expert-slug}}
status: utkast
---

# {{Titel — gärna som fråga eller hypotes}}

## Bakgrund

{{Varför jobbar jag med detta? Vad triggade mig?}}

## Preliminärt resonemang

{{Öppen text — får vara ofärdigt. Fota gärna påståenden som tänkbara hypoteser.}}

> [!todo] Källor att leta upp
> - {{ämne1}}: saknar primärkälla
> - {{ämne2}}: sekundär hittad, leta primär

## Öppna frågor

- {{fråga1}}
- {{fråga2}}

## Nästa steg

- [ ] {{steg1}}
- [ ] {{steg2}}
````

- [ ] **Steg 6: Verifiera alla mallar**

```bash
for f in mall-konceptnot.md mall-moc.md mall-källa.md mall-expertprofil.md mall-expertnot.md; do
  test -f "paperclip/skills/local/obsidian-master/mallar/$f" && echo "OK: $f"
done
```

Expected: fem `OK:`-rader.

Kontrollera att alla filer har frontmatter-blocket först:

```bash
for f in paperclip/skills/local/obsidian-master/mallar/*.md; do
  head -1 "$f" | grep -q '^---$' && echo "FM OK: $f"
done
```

Expected: fem `FM OK:`-rader.

- [ ] **Steg 7: Commit**

```bash
git add paperclip/skills/local/obsidian-master/mallar/
git commit -m "docs(obsidian-master): lägg till mallar för alla fem nottyper"
```

---

## Verifiering efter hela planen

- [ ] **Full struktur på plats**

```bash
find paperclip/skills/local/obsidian-master -type f | sort
```

Expected:

```text
paperclip/skills/local/obsidian-master/SKILL.md
paperclip/skills/local/obsidian-master/mallar/mall-expertnot.md
paperclip/skills/local/obsidian-master/mallar/mall-expertprofil.md
paperclip/skills/local/obsidian-master/mallar/mall-konceptnot.md
paperclip/skills/local/obsidian-master/mallar/mall-källa.md
paperclip/skills/local/obsidian-master/mallar/mall-moc.md
paperclip/skills/local/obsidian-master/references/ARBETSFLÖDEN.md
paperclip/skills/local/obsidian-master/references/FRONTMATTER.md
paperclip/skills/local/obsidian-master/references/VAULT.md
paperclip/skills/local/obsidian-master/references/VERIFIERING.md
```

- [ ] **Interna wikilinks i SKILL.md pekar rätt**

```bash
grep -oE '\[[^]]+\]\([^)]+\)' paperclip/skills/local/obsidian-master/SKILL.md | grep -E 'references|mallar'
```

Kontrollera att varje länk refererar till en fil som faktiskt existerar under skill-katalogen.

- [ ] **Samtliga frontmatter-block parsar**

```bash
python3 -c "
import yaml, re, glob
files = glob.glob('paperclip/skills/local/obsidian-master/**/*.md', recursive=True)
for path in files:
    with open(path) as f:
        content = f.read()
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        print(f'SAKNAR FRONTMATTER: {path}')
        continue
    try:
        yaml.safe_load(m.group(1))
        print(f'OK: {path}')
    except Exception as e:
        # Mallar innehåller {{...}} platshållare som inte är giltig YAML — det är OK
        if '{{' in m.group(1):
            print(f'TEMPLATE OK: {path}')
        else:
            print(f'FEL: {path} — {e}')
"
```

Expected: alla filer antingen `OK:` eller `TEMPLATE OK:` (inga `FEL:` eller `SAKNAR FRONTMATTER:`).
