# Payloads — fältscheman

Alla skrivanrop valideras med Zod. Slug matchar `^[a-z0-9-]+$`. Datum är ISO 8601
(t.ex. `2026-04-15T10:00:00.000Z`).

## Expert

| Fält | Typ | Not |
|------|-----|-----|
| `id` | string | unikt |
| `slug` | string (slug) | unikt |
| `sortOrder` | heltal ≥ 0 | sorteringsordning |
| `featured` | boolean | utvald på startsidan |
| `name` | string | |
| `role` | string | |
| `location` | string | |
| `availability` | string | |
| `areaSlugs` | string[] (slug), ≥ 1 | måste matcha befintliga områden |
| `summary` | string | |
| `profileQuote` | string | |
| `strengths` | string[] ≥ 3 | |
| `metrics` | `{label, value, description?}`[] ≥ 2 | |
| `selectedEngagements` | `{title, client, period, summary, impact}`[] ≥ 2 | |
| `experience` | `{title, organization, period, summary}`[] ≥ 2 | |
| `knowledge` | string[] ≥ 1 | |
| `capabilities` | string[] ≥ 1 | |
| `tools` | string[] ≥ 3 | |
| `methods` | string[] ≥ 3 | |
| `contactLinks` | `{id, label, type, url, description}`[] ≥ 2 | `type` ∈ email/calendar/linkedin/website; email-url måste börja med `mailto:`, övriga med `http(s)://` |

## ExpertArea

| Fält | Typ | Not |
|------|-----|-----|
| `id` | string | unikt |
| `slug` | string (slug) | unikt |
| `sortOrder` | heltal ≥ 0 | |
| `featured` | boolean | |
| `accent` | string | hex-färg `#rrggbb` |
| `name` | string | |
| `shortDescription` | string | |
| `description` | string | |
| `signals` | string[] ≥ 2 | när området används |
| `deliverables` | string[] ≥ 2 | typiska leverabler |

## BlogPostEntry (metadata)

| Fält | Typ | Not |
|------|-----|-----|
| `slug` | string (slug) | unikt |
| `title` | string | |
| `date` | ISO 8601 | |
| `authorSlug` | string (slug), valfri | om den matchar en expert länkas inlägget till expertsidan |
| `authorName` | string, valfri | visningsnamn; krävs när `authorSlug` saknas/inte matchar |
| `authorRole` | string, valfri | fri roll-text |
| `areaSlugs` | string[] (slug) ≥ 1 | |
| `excerpt` | string | sammanfattning för listningen |

**Författarregel:** minst en av `authorSlug` och `authorName` måste anges. Markdown skickas
separat (fältet `markdown` i POST/PUT-body), inte i metadata-objektet.

## Radar

En radar skickas som `{ meta, blips }`. `meta` beskriver radaren och dess segment; `blips`
är posterna som placeras ut.

### RadarMeta (`meta`)

| Fält | Typ | Not |
|------|-----|-----|
| `slug` | string (slug) | unikt |
| `title` | string | |
| `subtitle` | string, valfri | kort underrubrik |
| `version` | string, valfri | t.ex. `"1.0"` |
| `date` | ISO 8601 | |
| `segments` | `{id, name}`[] 4–6 | `id` är slug, unik inom radarn; redaktören namnger |

### Blip (`blips[]`)

| Fält | Typ | Not |
|------|-----|-----|
| `id` | string (slug) | unik inom radarn |
| `name` | string | kort blip-namn |
| `segmentId` | string (slug) | måste matcha ett `segments[].id` |
| `ring` | `anta` \| `prova` \| `bevaka` \| `avvakta` | fast ringuppsättning, se nedan |
| `description` | string | neutral beskrivning av vad signalen är |
| `implications` | string | varför det spelar roll / vad det betyder |

### Ringar (fasta — redaktionell hållning)

| `ring` | Hållning | Innebörd |
|--------|----------|----------|
| `anta` | Anta | I drift, hög mognad |
| `prova` | Pröva | Pilot, bygg kompetens |
| `bevaka` | Bevaka | Följ utvecklingen aktivt |
| `avvakta` | Avvakta | Omogen / hög osäkerhet |

Ringarna är desamma för alla radarer och definieras inte per radar. Inre ring = `anta`,
yttre = `avvakta`.
