---
name: "obsidian-global"
description: "Grundläggande skrivning i Expertbyråns delade Obsidian-vault. Använd när du vill skriva ett utkast eller en expertprofil i din egen mapp (/Experter/[din-slug]/). För kritik eller publicering till kanonisk kunskap — skapa task till obsidian-master i projektet 'Obsidian knowledgebase'."
slug: "obsidian-global"
metadata:
  paperclip:
    slug: "obsidian-global"
    skillKey: "local/expertbyran/obsidian-global"
  skillKey: "local/expertbyran/obsidian-global"
key: "local/expertbyran/obsidian-global"
---

# Obsidian-global — grundläggande vault-skrivning

Du bidrar till Expertbyråns delade Obsidian-vault. Denna skill ger dig minimum för att skriva utkast direkt i din egen mapp. Detaljerad verifiering, publicering och vaultens övergripande struktur sköts av **obsidian-master** — en specialiserad agent du kan be om hjälp via task.

För Obsidian-syntax (wikilinks, callouts, embeds, fotnoter) — se skillen `obsidian-markdown`.

## Din arena

Din mapp: `/Experter/[din-agent-slug]/` (t.ex. `/Experter/metod-statistik-petra/`)

**Du får skriva i:**

- `/Experter/[din-slug]/_index.md` — din expertprofil (en per expert)
- `/Experter/[din-slug]/*.md` — expertnoter (utkast, framingar, reflektioner, dagbokstyp)

**Du får INTE skriva i:**

- Andra experters mappar (`/Experter/annan-slug/`)
- `/Områden/` — kanonisk, publicerad kunskap; ägs av obsidian-master
- `/Källor/` — återanvändbart källbibliotek; ägs av obsidian-master
- `/00_Index/`, `/_Mallar/` — vaultens infrastruktur

**Specialregel för utbildningsledaren:** du får även skriva utkast i andra experters mappar under dialog eller retrospektiv — t.ex. skissa en not åt en expert baserat på hens dialogsvar. Sätt då `expert: [expertens-slug]` i frontmatter, inte din egen.

## Två nottyper du skapar själv

### Expertnot — din privata arbetsyta

Utkast, framingar, reflektioner. Fria rubriker, fri struktur. Kräver bara minimal frontmatter:

```yaml
---
typ: expertnot
skapad: YYYY-MM-DD
ändrad: YYYY-MM-DD
beskrivning: "En rad som förklarar vad noten handlar om"
expert: din-agent-slug
status: utkast
---
```

När en expertnot är klar att bli kanonisk kunskap i `/Områden/` — skicka den till obsidian-master via `Obsidian-publicera:`-task (se nedan). Du flyttar den inte själv.

### Expertprofil — din landningsnot

En per expert, alltid i `_index.md`. Beskriver vem du är, din roll och dina ansvarsområden.

```yaml
---
typ: expertprofil
skapad: YYYY-MM-DD
ändrad: YYYY-MM-DD
beskrivning: "Expertprofil för Förnamn — metodexpert|domänexpert, huvudområde"
expert: din-agent-slug
roll: metodexpert | domänexpert
ämnesområden: ["[[_område1]]", "[[_område2]]"]
---
```

Skriv kort: vem du är, vad du äger, hur du arbetar.

## Filnamnsregler

- Små bokstäver, bindestreck som ordseparator, inga mellanslag
- Använd åäö direkt i filnamn (`språkbruk.md`, inte `sprakbruk.md`)
- Inga datum i filnamn — datum lever i frontmatter
- Max ~60 tecken
- Din expertprofil: alltid `_index.md`

## Två sätt att be obsidian-master om hjälp

Skicka task i projektet **"Obsidian knowledgebase"** med tydlig titel-prefix så obsidian-master vet vad du vill.

### `Obsidian-feedback:` — du vill ha råd, ingen publicering ännu

Använd när du är osäker på formulering, källor, eller om noten alls bör publiceras. Obsidian-master läser, kommenterar, föreslår.

```
POST /api/companies/{cid}/issues
{
  "title": "Obsidian-feedback: <kort ämne>",
  "description": "Länk: [[/Experter/din-slug/fil]]\n\nVad jag vill ha feedback på:\n- <fråga eller oro>\n- <ev. källor jag är osäker på>",
  "assigneeAgentId": "obsidian-master",
  "projectId": "<obsidian-knowledgebase-projekt-id>",
  "priority": "low"
}
```

### `Obsidian-publicera:` — flytt till kanonisk kunskap i /Områden/

Använd när noten är färdig och du vill att den ska bli publicerad konceptnot.

**Innan du skickar, kontrollera att:**

- Varje påstående har primär- eller sekundärkälla med fungerande URL
- Du har läst källan och verifierat att den stödjer påståendet
- Noten är tillräckligt generell för att vara återanvändbar av flera experter, inte bunden till ett specifikt uppdrag

```
POST /api/companies/{cid}/issues
{
  "title": "Obsidian-publicera: <kort ämne>",
  "description": "Länk: [[/Experter/din-slug/fil]]\n\nKällor jag använt:\n- <URL 1 + kort beskrivning>\n- <URL 2 + kort beskrivning>\n\nFörslag till område: metod|domän|allmänt / <område>\n\nMotivering att kunskapen är kanonisk: <en rad>",
  "assigneeAgentId": "obsidian-master",
  "projectId": "<obsidian-knowledgebase-projekt-id>",
  "priority": "low"
}
```

Obsidian-master svarar via dialog — räkna med följdfrågor om källor, formulering eller placering. Ev. avvisning eller degradering om källorna inte håller — då hamnar noten tillbaka hos dig som utkast.

## Vad obsidian-master gör (för din kännedom)

Du behöver inte kunna hela vaulten, men det hjälper att veta:

- Verifierar alla källor mot primärkälle-principen (hård källkritik)
- Skapar eller återanvänder källnoter i `/Källor/`
- Skriver fotnoter och wikilinks
- Flyttar din not till rätt `/Områden/`-mapp
- Uppdaterar relevant områdeskarta (MOC)
- Kan avvisa eller degradera om källor inte håller

Det betyder att **din utkasttext får vara rå**. Du behöver inte fylla i alla frontmatter-fält som en publicerad konceptnot har — obsidian-master fyller i de tekniska delarna vid publicering. Du fokuserar på innehållet och källorna.

## När du jobbar med utkast över flera heartbeats

- Uppdatera `ändrad:` varje gång du redigerar
- Behåll `status: utkast` tills obsidian-master har publicerat
- Flera utkast i samma mapp är OK — fri filnamngivning
- Länka gärna mellan dina egna expertnoter (wikilinks funkar direkt)
- Länka INTE in från ett utkast till en publicerad konceptnot i `/Områden/` utan att läsa den först — grafen ska hålla
