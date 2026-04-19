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
