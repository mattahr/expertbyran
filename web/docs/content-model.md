# Innehållsmodell

## Grundidé

Webbplatsens innehåll representeras som ett sammansatt snapshot (config + experter + expertområden). Config-delen (site/organization/marketplace) bundlas i imagen via `src/config/site-config.json`; experter och områden skapas och underhålls via webbappens REST API. Det finns ingen seed-mekanism — `web/site-data.json` i monorepot konsumeras inte av webben utan underhålls som marketplace-synkad presentationsdata.

Webbappen:

- läser innehåll via lagringsabstraktionen (`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`, `ForesightStore`)
- validerar det med Zod
- renderar katalogen

Innehållet lagras i SQLite-databasen `${DATA_DIR}/expertbyran.db`; lagringsbackenden kan bytas utan att konsumenterna ändras (en ny backend ska klara den delade kontraktssviten).

## Toppnivå

Snapshoten innehåller:

- `version`
- `updatedAt`
- `site`
- `organization`
- `marketplace`
- `expertAreas`
- `experts`

## Marketplace

`marketplace` beskriver GitHub-källan för marknadsplatsen och innehåller:

- `name`
- `repositoryUrl`
- `marketplaceJsonUrl`
- `installSource`
- `description`

## Experter

Varje expert har vanlig profilinformation och refererar till områden via `areaSlugs`.

## Referensintegritet

Valideringen avvisar bland annat:

- dubbla `id` eller `slug`
- ogiltiga `areaSlugs` på experter
- ogiltig `installSource`
- ogiltiga URL:er till marketplace eller repository

## Praktiska regler

- behandla `slug` som stabil identitet
- ändra inte `id` eller `slug` utan migrationsbehov
- regenerera schemafilerna när Zod-modellen ändras
