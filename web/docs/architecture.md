# Arkitektur

## Översikt

Expertbyrån är en enkel Next.js-applikation med en enda roll:

- publik webb på port `3000`

Allt innehåll läses som en validerad JSON-snapshot. Webbappen skriver inte data och exponerar inget admin-API.

## Huvuddelar

### 1. Publik katalog

Publika sidor renderar:

- startsida
- om-sida
- expertområden
- expertsidor
- teamsidor
- marknadsplatssida
- kontaktsida

Katalogen visar både mänsklig information och pluginmetadata.

### 2. Innehållslager

Snapshoten läses från `SITE_DATA_URL`. Standardvärdet pekar på:

- `https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json`

Snapshoten valideras alltid med Zod innan den används i renderingen.
Om fjärrläsningen misslyckas används senast giltiga snapshot i processminnet. Om ingen sådan finns ännu returnerar appen fel tills fjärrkällan åter är läsbar.

### 3. Marketplace-källor

Snapshoten `site-data.json` ligger i samma monorepo som webbappen (`mattahr/expertbyran`) under `web/site-data.json`. Den kanoniska Claude Code-marketplacen distribueras dock från ett separat pluginrepo:

- snapshot repository: `https://github.com/mattahr/expertbyran` (monorepo — webbapp, marketplace-plugin och snapshot)
- plugin repository: `https://github.com/mattahr/expertbyran-plugins`
- canonical marketplace: `https://raw.githubusercontent.com/mattahr/expertbyran-plugins/main/.claude-plugin/marketplace.json`

Webbappen håller bara referenser till dessa källor.

## Dataflöde

1. En request kommer in till webbappen.
2. Innehållslagret avgör om cachead snapshot fortfarande är färsk.
3. Om cache behöver uppdateras hämtas `SITE_DATA_URL`.
4. Snapshoten valideras.
5. Vid fel används senast cacheade snapshot i minnet om en sådan finns.
6. Sidan renderas med den senaste giltiga snapshoten.

## Publika schemafiler

Webbappen exponerar två publika schemafiler under `/schemas/`:

- `/schemas/site-data.schema.json`
- `/schemas/plugin-sync.schema.json`

De genereras från samma Zod-källa som webbappen använder vid runtime.
