# Expertbyrån — monorepo

Detta är ett monorepo som innehåller **tre olika projekt** under samma tak. Alla tre relaterar till det virtuella konsultkonceptet "Expertbyrån" men är byggda på olika plattformar och har olika syften. De kom ursprungligen från varsitt separat repo och lever nu sida vid sida.

## Projektmapparna

| Mapp | Vad | Plattform |
|---|---|---|
| [marketplace/](marketplace/) | Claude Code-plugin — konsultchef som routar uppgifter till domänexperter | Claude Code plugin |
| [web/](web/) | Publik Next.js-webbplats som presenterar experter och team | Next.js 16 (statisk snapshot) |
| [paperclip/](paperclip/) | Paperclip-paketering — 16 AI-agenter som bemannar Riksrevisionens effektivitetsrevision | [Paperclip](https://paperclip.ing) |

Varje projekt har sin egen `CLAUDE.md` med detaljer om scope, konventioner och struktur. Läs den innan du arbetar i respektive mapp.

## Hur de hänger ihop

* **Datafil som delas**: [web/site-data.json](web/site-data.json) är den kanoniska presentationsdatan för experterna. Den konsumeras av webbplatsen (`web/`) via `SITE_DATA_URL` och underhålls när nya experter läggs till i `marketplace/`-pluginen.
* **Teknisk koppling**: Projekten är annars tekniskt oberoende. `marketplace/` och `paperclip/` känner inte till `web/`; `web/` läser `site-data.json` via URL (inte från disk), så den har ingen build-time-koppling till de andra.
* **Pluginkedja**: `paperclip/skills/local/expertbyran-manager/` är en skill som paperclip-agenter använder för att underhålla marketplace-pluginen (lägga till experter, hålla expert-registry i synk).

## Claude Code-plugin

Repots rot innehåller [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) som exponerar `marketplace/`-innehållet som en installerbar Claude Code-plugin:

```
/plugin marketplace add mattahr/expertbyran_plugin
/plugin install expertbyran@expertbyran
```

Plugin-sourcen pekar på `./marketplace`; själva pluginmanifestet ligger i [marketplace/.claude-plugin/plugin.json](marketplace/.claude-plugin/plugin.json).

## CI/CD

Monorepots GitHub Actions-workflows ligger i [.github/workflows/](.github/workflows/). För närvarande finns endast [publish-web-container.yml](.github/workflows/publish-web-container.yml) — manuellt triggad Docker-image-publicering för `web/`.

## Konventioner för alla projekt

* **Svenska i allt innehåll** — dokumentation, kodkommentarer, commit-meddelanden, UI-text. Korrekta å, ä, ö.
* **Per-projekt-scope** — ändringar i ett projekt ska inte läcka över i ett annat utan uttrycklig anledning.
* **Varje projekt äger sin egen `.gitignore`** utöver den globala i repo-roten.
