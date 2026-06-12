# Expertbyrån Docs

Det här dokumentbiblioteket beskriver hur webbappen fungerar som publik katalog för experter, expertområden och en extern Claude Code-marketplace. Innehåll nås via en lagringsabstraktion och muteras enbart via webbappens REST API.

## Läsordning

1. `architecture.md`
   Systemets huvuddelar, dataflöde och driftmodell.
2. `content-model.md`
   Snapshotformatet, valideringsregler och hur experter och pluginmetadata modelleras.
3. `marketplace-catalog.md`
   Hur webbappen relaterar till monorepot `mattahr/expertbyran` och det separata pluginmonorepot.
4. `development-guide.md`
   Lokal utveckling, testning och drift.
5. `../public/schemas/site-data.schema.json`
   Maskinläsbart JSON Schema för hela snapshoten.
6. `../public/schemas/plugin-sync.schema.json`
   Maskinläsbart JSON Schema för pluginrelaterad metadata.

## Viktigt i korthet

- Innehåll nås via en lagringsabstraktion (`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`, `ForesightStore`) med SQLite-backend (`${DATA_DIR}/expertbyran.db`).
- Webbappens REST API är den enda skrivvägen för innehåll; konfigurationsdata bundlas i imagen via `src/config/site-config.json`. Inga seeds — nyinstallation ger tom databas, gamla JSON-filer på volymen importeras automatiskt.
- Cachning sker i webblagret via `unstable_cache` + taggar, invaliderad med `revalidateTag`. Inget innehåll prerendras vid build.
- `mattahr/expertbyran` är källa för marknadsplatsens GitHub-referens; `web/site-data.json` underhålls som marketplace-synkad presentationsdata och läses inte av webbappen.
