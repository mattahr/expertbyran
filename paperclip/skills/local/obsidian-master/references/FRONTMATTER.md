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
