# Arkitektur

## Översikt

Expertbyrån är en enkel Next.js-applikation med en enda roll:

- publik webb på port `3000`

Allt innehåll nås via en lagringsabstraktion och valideras med Zod. Innehåll muteras enbart via webbappens REST API; en publik route finns för att tvinga cacheinvalidering.

## Huvuddelar

### 1. Publik katalog

Publika sidor renderar:

- startsida
- om-sida
- expertområden
- expertsidor
- marknadsplatssida

Katalogen visar både mänsklig information och pluginmetadata.

### 2. Innehållslager

Innehåll nås via en **lagringsabstraktion** med tre gränssnitt bakom en gemensam kompositionsrot:

- `ConfigStore` — site/organization/marketplace (fil- och seed-hanterad, ej muterbar via API)
- `ContentStore` — experter och expertområden
- `BlogStore` — blogginlägg (metadata + markdown)

Implementationerna är **filbaserade** i dag (data under `DATA_DIR`) men kan bytas mot en databasbackend utan att konsumenterna ändras — konsumenter rör aldrig filer direkt. All data valideras med Zod.

Den **enda** skrivvägen för innehåll är REST API:et (`/api/v1/...`). Cachning sker i webblagret via Next 16 `unstable_cache` med taggar (`experts`, `areas`, `blog`); API:et invaliderar berörda taggar med `revalidateTag(tag, "max")` efter skrivningar.

### 3. Marketplace-källor

Snapshoten `site-data.json` ligger i samma monorepo som webbappen (`mattahr/expertbyran`) under `web/site-data.json`. Marknadsplatsreferensen pekar också på samma repo:

- snapshot repository: `https://github.com/mattahr/expertbyran` (monorepo — webbapp, marketplace-plugin och snapshot)
- marketplace repository: `https://github.com/mattahr/expertbyran`
- marketplace.json: `https://raw.githubusercontent.com/mattahr/expertbyran/main/.claude-plugin/marketplace.json`

Webbappen håller bara referenser till dessa källor.

## Dataflöde

Läsväg:

1. En request kommer in till webbappen.
2. Sidan läser innehåll via lagringsabstraktionen, inpackad i `unstable_cache` med taggar (`experts`, `areas`, `blog`).
3. Vid cache-träff returneras cachat resultat; annars läser stores från `DATA_DIR` och resultatet valideras med Zod.
4. Sidan renderas.

Skrivväg:

1. Ett muterande anrop går till REST API:et (`/api/v1/...`) med `API_TOKEN`.
2. Stores skriver till `DATA_DIR` efter Zod-validering.
3. API:et invaliderar berörda taggar med `revalidateTag(tag, "max")`.

`GET /refresh` invaliderar alla innehållstaggar och tvingar därmed omläsning vid nästa request.

## Publika schemafiler

Webbappen exponerar två publika schemafiler under `/schemas/`:

- `/schemas/site-data.schema.json`
- `/schemas/plugin-sync.schema.json`

De genereras från samma Zod-källa som webbappen använder vid runtime.
