# Expertbyrån — Claude Code-plugin

Denna mapp (`marketplace/`) är **Claude Code-plugin-delen** av monorepot `mattahr/expertbyran`. Se [../CLAUDE.md](../CLAUDE.md) för monorepo-översikten och hur denna mapp förhåller sig till `web/` och `paperclip/`.

## Syfte

Plugin som exponerar en **konsultchef** — en skill som routar uppgifter till rätt domänexpert(er) on-demand. Konsultchefen är den enda synliga skillen; experterna laddas som subagenter när de behövs.

## Plugin-exponering

Pluginen distribueras via [../.claude-plugin/marketplace.json](../.claude-plugin/marketplace.json) i repots rot. Själva pluginmanifestet ligger i [.claude-plugin/plugin.json](.claude-plugin/plugin.json). När någon kör `/plugin marketplace add mattahr/expertbyran` kopieras denna mapp in i plugin-cachen och exponeras som pluginen `expertbyran`.

**Versionsstyrning**: Bumpa `version` i `.claude-plugin/plugin.json` vid varje meningsfull ändring. Claude Code uppdaterar installerade klienter utifrån versionsnumret, inte git-commits.

## Struktur (sökvägar relativa till marketplace-roten)

| Sökväg | Syfte |
|---|---|
| `.claude-plugin/plugin.json` | Pluginmanifest (namn, version, metadata) |
| `skills/konsultchef/SKILL.md` | Enda synliga skillen — router som matchar uppgifter mot experter |
| `skills/konsultchef/expert-registry.md` | Kompakt register som konsultchefen läser vid varje uppgift |
| `experts/[slug]/EXPERT.md` | Expertens identitet, metodik och kedjningsregler — laddas av subagenter |
| `experts/[slug]/references/` | Fördjupningsmaterial (progressive disclosure) |

## Regler för sökvägar i plugin-filer

**Alla file-reads i skills och experter måste använda `${CLAUDE_PLUGIN_ROOT}`-prefix.** Plugin-filer körs från `~/.claude/plugins/cache/...`, inte från användarens CWD — råa relativa sökvägar fungerar inte där.

Rätt:
```
Read ${CLAUDE_PLUGIN_ROOT}/skills/konsultchef/expert-registry.md
```

Fel (kommer läsa från fel plats):
```
Read skills/konsultchef/expert-registry.md
Read [CLAUDE_PLUGIN_ROOT]/skills/...  # kantparenteser tolkas inte
```

## Konventioner

* **Svenska med korrekta å, ä, ö** i all text (innehåll, kodkommentarer, commits).
* **Experter definieras som `EXPERT.md`** med YAML-frontmatter: `name`, `domain`, `triggers`, `capabilities`, `can_chain_to`.
* **Expert-registret MÅSTE uppdateras** när en ny expert läggs till eller triggers/capabilities ändras — konsultchefen läser enbart registret, inte EXPERT.md-filerna.
* **Inga sökvägar utanför marketplace-roten** — plugin-cachen innehåller bara denna mapps innehåll. Referenser som `../web/` bryts när pluginen installeras. Hör sådant till monorepot, hör det till root-`CLAUDE.md`, inte hit.

## Underhåll

När nya experter ska läggas till eller befintliga uppdateras, använd skillen [paperclip/skills/local/expertbyran-manager/](../paperclip/skills/local/expertbyran-manager/). Den håller EXPERT.md, expert-registry och `web/site-data.json` i synk.
