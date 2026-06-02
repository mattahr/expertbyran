# Innehållsmodell

## Grundidé

Webbplatsens innehåll representeras som ett sammansatt snapshot (config + experter + expertområden). Det seedas från `web/site-data.json` i monorepot och underhålls därefter via webbappens REST API.

Webbappen:

- läser innehåll via lagringsabstraktionen (`ConfigStore`, `ContentStore`, `BlogStore`)
- validerar det med Zod
- renderar katalogen

Innehållet lagras under `DATA_DIR`; lagringsimplementationen är filbaserad i dag men kan bytas mot en databasbackend utan att konsumenterna ändras.

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
