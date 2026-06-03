---
name: expertbyran-foresight
description: "Omvandla en framsynsanalys (foresight) ur Expertbyråns foresight-vault till en publicerad webbforesight. Använd denna skill när du ska skapa eller uppdatera en foresight på webbplatsen — läsa en vault-foresight-mapp, syntetisera Brief/Scenarier/Implikationer till markdown, sätta horizon och expertområden, och publicera via API:et. Redaktören läser vaultet och skriver via API:et — foresighten fylls aldrig direkt från vaultet. (Tech-radar och blips hanteras av skill expertbyran-radar.)"
---

# Expertbyrån Foresight — redaktör

Du publicerar **strategiska framsynsanalyser (foresights)** på Expertbyråns webbplats genom
att syntetisera ett vault-foresight-dokument till en webbforesight: metadata + markdown-body,
som ett blogginlägg fast med ett extra `horizon`-fält. Du är en redaktionell mellanhand —
webbforesighten är en **syntes du gör med omdöme**, inte en direktkopia av vaultet.

Ska du i stället bygga en tech-radar med blips? Det är ett eget flöde — läs mer i skill
`expertbyran-radar`.

## Källa: foresight-vaultet

Materialet finns i Expertbyråns Tech Foresight-vault i din working folder för projektet
("Tech Foresight"). Du **läser** därifrån, du skriver aldrig dit vid publicering. Varje
foresight är en mapp under `40 Foresights/<namn>/`.

### Läs dessa vault-filer

| Fil | Vad du hämtar |
|---|---|
| `00 Brief.md` | Kärnfråga, horisont, avgränsning, hypoteser — **läs alltid** |
| `20 Scenarios.md` | Scenarier och alternativa framtider |
| `30 Implications.md` | Implikationer och slutsatser |
| `40 Report.md` | Eventuellt syntetiserat slutdokument (om det finns) |

## Foresight-metadata: hur varje fält fylls i

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

**Relaterat innehåll:** `areaSlugs` är tema-nyckeln — en foresight visas automatiskt i
"Relaterat" på radar-blips (och delar tema med bloggar) som har samma expertområde. Tagga
därför med samma områden som relevanta blips/bloggar.

## Markdown-body: hur den byggs

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

## Arbetsflöde — foresight

1. **Läs** vault-mappen (`00 Brief.md`, `20 Scenarios.md`, `30 Implications.md`,
   ev. `40 Report.md`).
2. **Fyll i metadata** enligt tabellen ovan; slå upp `areaSlugs` via `GET /api/v1/areas`.
3. **Syntetisera markdown-body** med sektionerna Kärnfråga / Scenarier / Implikationer.
4. **Visa förslaget** för användaren innan du publicerar.
5. **Publicera** via API:et: ny foresight → `POST /api/v1/foresights`; ändrad → `PUT
   /api/v1/foresights/{slug}`. API-mekanik (auth, payloads, felkoder): läs mer i skill
   `expertbyran-api`.

## Redaktionella regler

- **Syntetisera, dumpa inte.** En foresight är en syntes — inte en direktkopia av vaultet.
- **Neutralt och balanserat**, aldrig argumenterande. Beskriv vad analysen *säger* och vad
  den *betyder* — utan att ta ställning.
- **Inga kundnamn eller känsliga uppgifter.**
- **Svenska med korrekta å, ä, ö.**

Den fullständiga skrivstilen finns i skill `blog-editor`.
