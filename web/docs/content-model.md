# Innehållsmodell

## Grundidé

Webbplatsens innehåll representeras som en fullständig snapshot. Snapshoten byggs och publiceras utanför webbappen, normalt i ett GitHub-monorepo.

Webbappen:

- läser snapshoten från `SITE_DATA_URL`
- validerar den
- renderar katalogen

Den lagrar inte någon lokal runtime-kopia av snapshoten.

## Toppnivå

Snapshoten innehåller:

- `version`
- `updatedAt`
- `site`
- `organization`
- `marketplace`
- `expertAreas`
- `teams`
- `experts`

## Marketplace

`marketplace` beskriver GitHub-källan för marknadsplatsen och innehåller:

- `name`
- `repositoryUrl`
- `marketplaceJsonUrl`
- `installSource`
- `description`

## Team

Team är förstaklassiga katalogobjekt och motsvarar kuraterade teampluginer i monorepot.

Varje team har minst:

- `id`
- `slug`
- `sortOrder`
- `featured`
- `name`
- `shortDescription`
- `description`
- `promptSummary`
- `expertSlugs`

## Experter

Varje expert har vanlig profilinformation och refererar till områden via `areaSlugs`.

## Referensintegritet

Valideringen avvisar bland annat:

- dubbla `id` eller `slug`
- ogiltiga `areaSlugs` på experter
- brutna `expertSlugs` i team
- ogiltig `installSource`
- ogiltiga URL:er till marketplace eller repository

## Praktiska regler

- behandla `slug` som stabil identitet
- ändra inte `id` eller `slug` utan migrationsbehov
- regenerera schemafilerna när Zod-modellen ändras
