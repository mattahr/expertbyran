# Expertbyrån Marketplace

Claude Code-plugin för Expertbyrån — ett virtuellt konsultbolag. Denna mapp (`marketplace/`) är en del av monorepot `mattahr/expertbyran`.

## Arkitektur

Sökvägar nedan är relativa till denna mapp (`marketplace/`) om inget annat anges.

* `skills/konsultchef/` — Enda synliga skillen. Routar uppgifter till experter.
* `experts/[namn]/` — Domänexperter som dokument (inte skills). Laddas av subagenter on-demand.
* `experts/[namn]/EXPERT.md` — Expertens identitet, metodik och kunskapsbas.
* `experts/[namn]/references/` — Fördjupningsmaterial (progressive disclosure).
* `../web/site-data.json` — Presentationsdata för webbplatsen (ligger i monorepots `web/`-mapp). Genereras från expert-registret. MÅSTE följa angivet schema.

## Konventioner

* Alla texter på svenska med korrekta å, ä, ö.
* Experter definieras som EXPERT.md med YAML-frontmatter (name, domain, triggers, capabilities, can\_chain\_to).
* Expert-registret (`skills/konsultchef/expert-registry.md`) måste uppdateras när nya experter läggs till.

