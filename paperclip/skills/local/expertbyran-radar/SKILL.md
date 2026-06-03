---
name: expertbyran-radar
description: "Kurera foresight-signaler till en tech-radar och publicera strategiska framsynsanalyser (foresights) på Expertbyråns webbplats. Använd denna skill när du ska bygga eller uppdatera en radar, välja signaler, sätta hållning och segment, eller när du ska omvandla ett vault-foresight-dokument till en publicerad webbforesight. Redaktören läser foresight-vaultet och skriver via API:et — varken radarn eller foresighten fylls direkt från vaultet."
---

# Expertbyrån Radar & Foresight — redaktör

Du hanterar **två redaktionella flöden** som båda läser ur samma foresight-vault och
publicerar via web-API:et:

1. **Radar-flödet** — kurera signaler till blips på en rund tech-radar.
2. **Foresight-flödet** — omvandla ett syntetiserat vault-foresight-dokument till en
   publicerad webbforesight.

Du är alltid en redaktionell mellanhand. Innehållet speglar inte vaultet automatiskt — det
är ett **urval och en syntes du gör med omdöme**.

## Källa: foresight-vaultet

Materialet finns i Expertbyråns Tech Foresight-vault i din working folder för projektet ("Tech Foresight").
Du **läser** därifrån, du skriver aldrig dit vid publicering. Relevant struktur:

- `30 Signals/` — signalnoter (primära blip-kandidater för radarn).
- `40 Foresights/<namn>/` — syntetiserade foresight-mappar (källa för foresight-flödet).
- `20 Topics/` — MOC:er per tema (hjälper namnge segment).
- `99 Meta/Taxonomy.md` — den kontrollerade vokabulären (`domain/*`, `topic/*`, `signal/*`).

---

## Flöde 1: Radar — så fylls varje del i

En radar = `meta` (inkl. namngivna `segments`) + en lista `blips`.

### Radarns metadata (`meta`)

| Fält | Härleds ur |
|---|---|
| `title` | Redaktionellt — t.ex. "Teknikradar 2026" |
| `subtitle` | Redaktionellt, valfri underrubrik |
| `version` | Redaktionellt, t.ex. `"1.0"` |
| `date` | Utgivningsdatum, ISO 8601 |
| `segments` | 4–6 teman redaktören namnger; vaultets `domain/*` är en bra utgångspunkt |

### Ringarna (fasta — redaktionell hållning)

| Ring (`ring`) | Hållning | Innebörd |
|---|---|---|
| `anta` | Anta | I drift, hög mognad |
| `prova` | Pröva | Pilot, bygg kompetens |
| `bevaka` | Bevaka | Följ utvecklingen aktivt |
| `avvakta` | Avvakta | Omogen / hög osäkerhet |

### Signal → blip: hur varje fält fylls i

| Blip-fält | Härleds ur signalen |
|---|---|
| `name` | Kort namn (2–5 ord) ur signalens titel |
| `segmentId` | Tematiskt segment — `domain/*` är utgångspunkt, men du namnger segmenten själv |
| `ring` | **Redaktionell hållning** du sätter utifrån mognad och osäkerhet (se nedan) |
| `description` | EN neutral mening ur `## Påstående` |
| `implications` | EN mening ur `## Implikationer` (vad det betyder) |
| `areaSlugs` | Expertområden (slugs) blippen rör — mappa vaultets `domain/topic` → närmaste expertområde (slå upp via `GET /api/v1/areas`). Styr vilket relaterat innehåll (foresights/bloggar) som visas i blip-panelen. |

**Ringen är en bedömning, inte en mekanisk översättning.** `signal/*`-styrkan i taxonomin
är bara startpunkt: `megatrend`/`trend` lutar mot Anta/Pröva, `strong` mot Pröva/Bevaka,
`weak` mot Bevaka/Avvakta. Du avgör den faktiska hållningen utifrån mognad och osäkerhet.

**Relaterat innehåll:** blippens `areaSlugs` är tema-nyckeln. Radarpanelen visar
automatiskt foresights och blogginlägg som delar minst ett expertområde med blippen — så
tagga blippen med samma områden som relevanta foresights/bloggar för att koppla ihop dem.

### Arbetsflöde — radar

1. **Läs** relevanta signaler i `30 Signals/` och bestäm radarns segment (4–6 teman).
2. **Föreslå blips** för användaren — namn, segment, föreslagen ring, beskrivning,
   implikationer. Visa urvalet innan du skriver något.
3. **Användaren godkänner/justerar** segment, ringar och urval.
4. **Publicera** via API:et: ny radar → `POST /api/v1/radars`; ändrad → `PUT
   /api/v1/radars/{slug}`. API-mekanik (auth, payloads, felkoder): läs mer i skill
   `expertbyran-api`.

---

## Flöde 2: Foresight — så fylls varje del i

En foresight är en strategisk framsynsanalys: metadata + markdown-body, med ett extra
`horizon`-fält jämfört med ett blogginlägg.

### Läs dessa vault-filer (i `40 Foresights/<namn>/`)

| Fil | Vad du hämtar |
|---|---|
| `00 Brief.md` | Kärnfråga, horisont, avgränsning, hypoteser — **läs alltid** |
| `20 Scenarios.md` | Scenarier och alternativa framtider |
| `30 Implications.md` | Implikationer och slutsatser |
| `40 Report.md` | Eventuellt syntetiserat slutdokument (om det finns) |

### Foresight-metadata: hur varje fält fylls i

| Fält | Härleds ur |
|---|---|
| `title` | Ur Brief-titeln (ofta h1 i `00 Brief.md`) |
| `date` | Utgivningsdatum, ISO 8601 (redaktionellt) |
| `horizon` | Ur Brief-fältet `horizon`, t.ex. `"2026–2030"` |
| `authorName` | Vaultets `owner`-fält eller ansvarig analytiker |
| `authorRole` | Analytikerns roll, t.ex. `"Analytiker, Expertbyrån"` |
| `excerpt` | 1–2 meningar som sammanfattar kärnfrågan (ur `00 Brief.md`) |
| `areaSlugs` | Mappa vaultets `domain/topic` → närmaste expertområde; slå upp tillgängliga områden via `GET /api/v1/areas` |

**Författarregel:** minst en av `authorSlug` och `authorName` måste anges.

### Markdown-body: hur den byggs

Syntetisera ett neutralt dokument med följande sektioner — **sammanfatta, kopiera inte
stora verbatim-block**:

```markdown
## Kärnfråga

(Ur 00 Brief.md — vad foresighten undersöker och varför)

## Scenarier

(Ur 20 Scenarios.md — de alternativa framtiderna, neutralt presenterade)

## Implikationer

(Ur 30 Implications.md — vad scenarierna betyder för verksamheten)
```

Om `40 Report.md` finns kan den komplettera, men Brief + Scenarios + Implications är basen.

### Arbetsflöde — foresight

1. **Läs** vault-mappen (`00 Brief.md`, `20 Scenarios.md`, `30 Implications.md`,
   ev. `40 Report.md`).
2. **Fyll i metadata** enligt tabellen ovan; slå upp `areaSlugs` via `GET /api/v1/areas`.
3. **Syntetisera markdown-body** med sektionerna Kärnfråga / Scenarier / Implikationer.
4. **Visa förslaget** för användaren innan du publicerar.
5. **Publicera** via API:et: ny foresight → `POST /api/v1/foresights`; ändrad → `PUT
   /api/v1/foresights/{slug}`. API-mekanik (auth, payloads, felkoder): läs mer i skill
   `expertbyran-api`.

---

## Redaktionella regler (båda flödena)

- **Kurera, dumpa inte.** En radar är ett urval; en foresight är en syntes — inte en
  direktkopia av vaultet.
- **Neutralt och balanserat**, aldrig argumenterande. Beskrivningen säger vad signalen/
  foresighten *är*; implikationen vad den *betyder* — utan att ta ställning.
- **Inga kundnamn eller känsliga uppgifter.**
- **Svenska med korrekta å, ä, ö.**

Den fullständiga skrivstilen finns i skill `blog-editor`.
