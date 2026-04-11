# Expertbyrån Docs

Det här dokumentbiblioteket beskriver hur webbappen fungerar som publik katalog för experter, team och en extern Claude Code-marketplace, med `site-data.json` hämtad från en fjärr-URL.

## Läsordning

1. `architecture.md`
   Systemets huvuddelar, dataflöde och driftmodell.
2. `content-model.md`
   Snapshotformatet, valideringsregler och hur experter, team och pluginmetadata modelleras.
3. `marketplace-catalog.md`
   Hur webbappen relaterar till monorepot `mattahr/expertbyran` och det separata pluginmonorepot.
4. `development-guide.md`
   Lokal utveckling, testning och drift.
5. `../public/schemas/site-data.schema.json`
   Maskinläsbart JSON Schema för hela snapshoten.
6. `../public/schemas/plugin-sync.schema.json`
   Maskinläsbart JSON Schema för pluginrelaterad metadata.

## Viktigt i korthet

- Webbappen är read-only i drift.
- `site-data.json` hämtas från `SITE_DATA_URL`.
- Det finns ingen skrivväg eller admin-API i denna app.
- `mattahr/expertbyran` är källa för katalogsnapshoten (`web/site-data.json`); pluginer distribueras via extern marketplace/pluginrepo (`mattahr/expertbyran-plugins`).
