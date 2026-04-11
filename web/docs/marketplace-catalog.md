# Marketplace-katalog

## Syfte

Webbappen är en publik katalog för Expertbyråns externa Claude Code-marketplace. Den beskriver:

- vilka experter som finns
- vilka kuraterade team som finns
- vilka plugins som motsvarar dessa objekt
- var den kanoniska marketplace-definitionen och pluginkoden ligger

## Ansvarsfördelning

Webbappen ansvarar för:

- publik presentation av experter, team och expertområden
- validerad pluginmetadata i snapshoten
- länkar till monorepo och kanonisk `marketplace.json`
- publika schemafiler för vidareutveckling

Monorepot `mattahr/expertbyran` ansvarar för:

- kanonisk `web/site-data.json`
- publik `web/`-yta för katalogrelaterade artefakter
- versionssättning av katalogmetadata

Det separata pluginmonorepot ansvarar för:

- faktisk pluginkod
- `.claude-plugin/marketplace.json`
- filstruktur för plugins

Den externa backend-agenten ansvarar för:

- att uppdatera `site-data.json` i monorepot
- att hålla pluginmetadata i snapshoten i synk med pluginstruktur och version
- att publicera nya commits som webbappen sedan läser via `SITE_DATA_URL`

## Vad som visas på webbplatsen

Webbplatsen visar för varje expert och team:

- namn och profilinformation
- pluginets namn
- version
- repository path i monorepot
- om pluginet är listat i marketplace

På `/marknadsplats` visas även:

- `repositoryUrl`
- `marketplaceJsonUrl`
- `installSource`
- länkar till publika schemafiler

## Vad webbappen inte gör

Webbappen:

- genererar inte `marketplace.json`
- publicerar inte pluginfiler
- skriver inte till GitHub
- försöker inte hålla tvåvägssynk på egen hand
- exponerar inget skriv-API för katalogdata

Det är ett medvetet designval för att hålla webbappen enkel, publik och lätt att underhålla.
