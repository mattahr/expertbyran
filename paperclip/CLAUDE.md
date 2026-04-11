# Expertbyrån — Paperclip-paketering

Denna mapp (`paperclip/`) är en **[Paperclip](https://paperclip.ing)-paketering** av Expertbyrån som ett virtuellt konsultbolag med 16 AI-agenter. Den är en del av monorepot `mattahr/expertbyran` — se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och förhållandet till `marketplace/` och `web/`.

## Syfte

Bemannar **Riksrevisionens effektivitetsrevision** med AI-agenter i rollerna projektledare, enhetschef, metodexperter, domänexperter, kvalitetsgranskare och opponenter. Expertbyrån har en enda kund — Riksrevisionen — och ett enda arbetsområde.

Detta är en annan implementation än Claude Code-plugin-versionen i [../marketplace/](../marketplace/). Paperclip-versionen är en kör-och-lever-byrå med heartbeat-driven agenter; plugin-versionen är en on-demand router för Claude Code-användare.

## Arkitektur

Agenterna, projekten, tasksen och körnings-konfigurationen definieras i **[.paperclip.yaml](.paperclip.yaml)** — det är den auktoritativa konfigurationsfilen. Paperclip-plattformen läser denna för att spinna upp agenterna.

| Komponent | Plats | Syfte |
|---|---|---|
| `.paperclip.yaml` | Rot | Agentdefinitioner, modeller, heartbeats, tasks, projects |
| `agents/[slug]/` | Per agent | `AGENTS.md`, `SOUL.md`, `HEARTBEAT.md`, `expertise.md`, minnen |
| `projects/` | | Kompetenskatalog, metodutveckling, exempeluppdrag |
| `skills/` | | 17 skills — både lokala och från externa plugin-repos |
| `tasks/` | | EXP-1 till EXP-11, konkreta uppdrag |

## Agenter (sammanfattning)

16 agenter i hierarki: **VD → konsultchefer (metod + domän) → metodexperter + domänexperter + utbildningsledare + webbmaster + klientkoordinator**. En fasadagent (`klient-riksrevisionen`) används enbart för API-autentisering av extern kund och körs aldrig.

Fullständig organisation och roll-till-uthyrning-tabell: [README.md](README.md).

## Modelval

* **VD**: `claude-opus-4-6`
* **Alla övriga**: `claude-sonnet-4-6`

Heartbeat är aktivt för operativa agenter; fasadagenten har heartbeat avstängt.

## Förhållande till övriga monorepo-mappar

* **Expertbyrån-manager-skill**: [skills/local/expertbyran-manager/](skills/local/expertbyran-manager/) används för att underhålla `marketplace/`-pluginen (lägga till experter, hålla `web/site-data.json` i synk). Den kör direkt i monorepot, inte i en tmp-klon.
* **Ingen teknisk koppling till `web/`** — paperclip-agenterna publicerar inte själva till webbplatsen; det gör expertbyran-manager-skillen indirekt via `site-data.json`.
* **Ingen överlappning med `marketplace/`-plugin-experterna** — det är två separata implementationer av samma koncept (Expertbyrån). Paperclip-agenterna opererar självständigt via Paperclip-plattformen; plugin-experterna laddas on-demand av Claude Code-användare.

## Konventioner

* **Svenska med korrekta å, ä, ö** i all text, inklusive agent-prompts, expertise-dokument och minnen.
* **Auktoritativa källor**: roll-till-uthyrning-tabellen upprepas identiskt på flera platser (README, klientkoordinatorn, kompetensmatchning-skillen). Ändringar måste synkas.
* **Minnen är per-agent** och persistenta — de ska inte redigeras manuellt av andra agenter utan stark anledning.

## Vidare läsning

* [README.md](README.md) — översikt, organisation, principer
* [.paperclip.yaml](.paperclip.yaml) — den auktoritativa konfigurationen
* [Paperclip.ing](https://paperclip.ing) — dokumentation för plattformen
