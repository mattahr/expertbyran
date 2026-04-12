# Marketplace-katalog

## Syfte

Webbappen är en publik katalog för Expertbyråns marknadsplats på GitHub. Den beskriver:

- vilka experter som finns
- vilka kuraterade team som finns
- vilka plugins som motsvarar dessa objekt
- var GitHub-repot för marknadsplatsen finns

## Ansvarsfördelning

Webbappen ansvarar för:

- publik presentation av experter, team och expertområden
- validerad pluginmetadata i snapshoten
- länk till GitHub-repot för marknadsplatsen
- publika schemafiler för vidareutveckling

Monorepot `mattahr/expertbyran` ansvarar för:

- kanonisk `web/site-data.json`
- `.claude-plugin/marketplace.json`
- faktisk pluginkod
- publik `web/`-yta för katalogrelaterade artefakter
- versionssättning av katalogmetadata

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

- en enkel hänvisning till `https://github.com/mattahr/expertbyran`

## Vad webbappen inte gör

Webbappen:

- genererar inte `marketplace.json`
- publicerar inte pluginfiler
- skriver inte till GitHub
- försöker inte hålla tvåvägssynk på egen hand
- exponerar inget skriv-API för katalogdata

Det är ett medvetet designval för att hålla webbappen enkel, publik och lätt att underhålla.
