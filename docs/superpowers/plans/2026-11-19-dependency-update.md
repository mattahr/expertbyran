# Uppdatering av projektets beroenden

**Mål:** Uppdatera samtliga körbara beroenden till senaste stabila version och kontrollera kända sårbarheter.

**Omfattning:** npm och transitiva beroenden i `web/`, Node och Docker-basavbilder, GitHub Actions samt Python- och CDN-beroenden i Paperclips lokala verktyg. Befintliga lokala ändringar beaktas. Ingen publicering eller driftsättning.

## Genomförande

- [x] Inventera manifest, låsfiler, containerdefinitioner, arbetsflöden och externa script.
- [x] Kontrollera aktuella versioner mot respektive utgivares register.
- [x] Uppdatera beroenden och nödvändiga kompatibilitetsanpassningar.
- [x] Kontrollpunkt: npm audit, npm outdated, lint, typkontroll och webbens befintliga tester. Gemensamma beroenden påverkar både frontend och API.
- [x] Kontrollpunkt: produktionsbygge i uppdaterad container, startkontroll och sårbarhetsskanning av slutavbilden; verifiera Python- och CDN-beroenden separat.
- [x] Granska diff och dokumentera resultat samt eventuella kvarstående begränsningar.

## Kontrolljournal

Gröna kontroller upprepas bara om deras berörda kod eller beroenden ändras. Inga nya tester för enbart versionsändringar. Ingen separat e2e-svit finns i projektet.

- Utgångsläge: lokal ändring av `@types/node` till 22.20.0 i package.json och låsfilen.
- `npm update` uppdaterade även transitiva beroenden. Direkta versioner är exakt låsta.
- `npm audit`: 25 sårbara paket före uppdateringen (1 kritisk, 12 höga, 11 måttliga, 1 låg); 0 efter uppdateringen, inklusive utvecklingsberoenden.
- `npm outdated --json`: endast ESLint kvar. Version 9.39.5 är senaste kompatibla version; Nexts senaste import-, React- och tillgänglighetsplugin accepterar ännu inte ESLint 10. ESLint 9 är markerad som utgången hos utgivaren, men audit hittar ingen känd sårbarhet. Uppgradering till 10 återstår när pluginen stöder den.
- TypeScript 7.0.2 används för `tsc` via aliaset `typescript-native`; Microsofts senaste `@typescript/typescript6` 6.0.2 används som API-kompatibilitet för Next och typescript-eslint. Namnet undviker en kollision med typescript-eslints valfria `@typescript/native`-peer, som kräver TypeScript 7.1 beta.
- `npm ls --all --json`: inga ogiltiga eller saknade beroenden efter aliasanpassningen.
- `npm test`: 42 filer, 270 tester godkända. Efter komplettering av två IntersectionObserver-mockar kördes endast deras två filer igen: 7 tester godkända. Övriga tester upprepades inte.
- `tsc --noEmit`: godkänd efter mockanpassningen. Aliasnamnsbytet ändrar inte kompilatorversionen.
- `npm run lint`: godkänd. Tre befintliga monteringseffekter har lokalt motiverade undantag för den skärpta set-state-in-effect-regeln; beteendet är oförändrat.
- `docker build`: godkänd med ren `npm ci` och produktionsbygge. Efter det korrigerade aliaset byggdes slutavbilden på nytt. Node-version i runnern: 26.13.1. Byggare och runner använder Debian 13 och låsta image-digests.
- Startkontroll: SQLite-migrering 1–4 godkända. HTTP 200 och giltiga svar för `/`, `/blogg`, `/radar`, `/foresight`, `/admin/login` och `/api/v1/site-data`. Isolerad tillfällig databas; testcontainern stoppades efteråt.
- `pip-audit -r paperclip/skills/local/skill-creator/requirements.txt --no-deps --disable-pip`: inga kända sårbarheter i PyYAML 6.0.3. Skill-validatorn kördes med denna version och godkändes. Ändrat GitHub-workflow kunde parsas som YAML.
- SheetJS 0.20.3 är redan senaste version enligt [utgivarens CDN](https://cdn.sheetjs.com/). Scriptets SHA-384 verifierades mot befintligt integrity-attribut; ingen ändring behövdes.
- Trivy 0.76.2 på slutavbilden: 0 fynd i Node-paketen. Debian: 72 paketträffar (55 måttliga, 14 låga, 3 okända), motsvarande 44 unika CVE:er; samtliga saknar tillgänglig rättning. Inga träffar har filtrerats bort. Detaljer finns i [granskningsresultatet](../../dependency-audit-2026-11-19.json).
- `git diff --check`: godkänd. Ingen publicering eller driftsättning utförd; GitHub-workflowet har inte körts mot GHCR.

## Kvarstående begränsning

Uppdateringen tar bort alla rapporterade npm-sårbarheter, men målet om noll CVE:er totalt är inte uppnått eftersom senaste Debianbasen har kända fynd utan patch. De behöver följas upp vid nya basavbilder. Att byta distributionsfamilj eller tysta fynden ingår inte i denna uppdatering.
