# KONSULTCHEF_SKILL — tillfällig placering av `konsultchef-utveckling`-skillen

Denna mapp innehåller en **riktig Claude Code-skill** (`SKILL.md` med YAML-frontmatter och `references/`) som ska flyttas till Expertbyråns separata agent-repo för att köras av konsultchef-agenten.

Parallell till [EXPERT_SKILL/](../EXPERT_SKILL/) men för konsultchefens ansvarsområde (routing-infrastruktur) snarare än en experts egen kunskap.

## Filer

* [SKILL.md](SKILL.md) — själva skillen. Frontmatter: `name: konsultchef-utveckling`. Styrs när konsultchef-agenten ska underhålla routing-infrastrukturen: INDEX.md (expertkatalogen), pluginets router-SKILL.md, plugin.json, plugin-nivåns CLAUDE.md, eller `_TEMPLATE/EXPERT.md`.
* [references/routing-principer.md](references/routing-principer.md) — destillerade principer för routing-description, INDEX.md-rader, destillering från experters EXPERT.md, samt överlapp- och lucka-analys. Läses on demand av konsultchefen när substantiell formuleringsförändring görs.

## Rollfördelning: konsultchef vs expert

| Ansvarsområde | Vem | Skill |
|---|---|---|
| Sin egen EXPERT.md och `references/` | Expert-agenten | `expert-utveckling` |
| Routing-infrastruktur: SKILL.md, INDEX.md, plugin.json, plugin CLAUDE.md, `_TEMPLATE/` | Konsultchef-agenten | `konsultchef-utveckling` (denna) |
| Marketplace-manifest (`marketplace.json`), repo-rotens CLAUDE.md | Marketplace-ägare (människan) | — |

Konsultchefen **läser** experternas EXPERT.md för att destillera INDEX.md-rader, men **skriver aldrig** i dem. Det är expertens eget territorium. Omvänt: experter pekar på andra experter som rådgivning ("för X är Y-experten bättre") men styr inte routing.

## Varför "tillfällig" placering?

Samma resonemang som för EXPERT_SKILL: mappen ligger i marketplace-repots rot, utanför pluginet. Skillen ska flyttas till Expertbyråns agent-repo där konsultchef-agenten kör. När den flyttas, styr frontmatter-fältet `name` (konsultchef-utveckling) invocation — inte katalognamnet.

## Förhållande till `skill-creator`

Beslut: **konsultchef-agenten ska inte ha tillgång till `skill-creator`** när `konsultchef-utveckling` är installerad. Samma skäl som för expert-utveckling: fel processfokus (eval-loopar, description-optimering) och ingen inbyggd scope-disciplin. Beskrivningen säger explicit "använd ALLTID denna istället för skill-creator när uppgiften gäller konsultchefens egen infrastruktur".

## Granskning före flytt

Innan skillen flyttas, kör minst tre verkliga scenarier:

1. **Flöde A (registrera ny expert):** lägg till en riktig expert i `experts/` (via `expert-utveckling`), se sedan om konsultchefen korrekt läser dennes EXPERT.md och destillerar till en INDEX.md-rad utan att röra expertens egna filer.
2. **Flöde E (överlappsgranskning):** med minst två experter på plats, be konsultchefen analysera om deras triggers överlappar. Verifiera att rapporten är konkret och inte föreslår ändringar i experternas EXPERT.md.
3. **Flöde C (justera routing-description):** be konsultchefen skärpa SKILL.md:s frontmatter-description utifrån aktuell experter-mix. Verifiera att ändringen är liten (Edit, inte Write) och respekterar routing-principer.md.

Om något skaver — fixa här innan flytt.
