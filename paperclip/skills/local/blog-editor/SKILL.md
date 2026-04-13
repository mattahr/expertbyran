***

name: blog-editor
description: "Skapa och hantera blogginlägg på Expertbyråns webbplats. Uppdaterar blog-data.json, skapar markdown-filer, och pushar direkt till main. Använd denna skill när du vill publicera ett nytt blogginlägg, redigera befintliga, eller hantera bloggkatalogen."
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Blog Editor — Expertbyråns blogg

Du hanterar blogginlägg för Expertbyråns webbplats. Bloggen hämtar all data från GitHub raw vid runtime — inga Docker-rebuilds behövs. Pusha till main och anropa `/refresh` så syns ändringarna direkt.

## Repostruktur

Alla bloggfiler lever i `web/`-mappen i monorepot `mattahr/expertbyran`:

```
web/
├── blog-data.json              ← Katalog med metadata för alla inlägg
└── blog/posts/<slug>.md        ← Markdown-innehåll, en fil per inlägg
```

## Schema för blog-data.json

```JSON
{
  "posts": [
    {
      "slug": "kebab-case-slug",
      "title": "Inläggets titel",
      "date": "YYYY-MM-DD",
      "authorSlug": "<expert-slug>",
      "areaSlugs": ["<area-slug>"],
      "excerpt": "Kort sammanfattning för listningen."
    }
  ]
}
```

### Fältregler

| Fält         | Krav                                                       |
| ------------ | ---------------------------------------------------------- |
| `slug`       | Unik, `[a-z0-9-]+`, matchar filnamnet i `blog/posts/`      |
| `title`      | Minst 1 tecken                                             |
| `date`       | ISO-datum `YYYY-MM-DD`                                     |
| `authorSlug` | Måste matcha en expert i `web/site-data.json`              |
| `areaSlugs`  | Minst 1, måste matcha expertområden i `web/site-data.json` |
| `excerpt`    | Kort text som visas på listningssidan                      |

## Så skapar du ett nytt inlägg

### 1. Hämta giltiga sluggar

Läs `web/site-data.json` för att hitta giltiga `authorSlug`- och `areaSlugs`-värden:

```Shell
node -e "const d=require('./web/site-data.json'); console.log('Experter:', d.experts.map(e=>e.slug)); console.log('Områden:', d.expertAreas.map(a=>a.slug))"
```

### 2. Skapa markdown-filen

Läs stilguiden innan du skriver:

```
Read references/skrivstil.md
```

Stilguiden innehåller:

* Grundhållning (neutralitet, transparens, balans)
* Minto-pyramidens principer och SCQA-ramverket för inledningar
* Regler för röd tråd, rubriksättning och gruppering
* Ton, språkval och checklista innan publicering

Skapa `web/blog/posts/<slug>.md` med inläggets innehåll i vanlig markdown. Stödd formatering:

* Rubriker (`## h2`, `### h3`)
* **Fetstil** och *kursiv*
* Numrerade och onumrerade listor
* [Länkar](url)
* `inline-kod` och kodblock
* Blockcitat (`>`)

**Ingen frontmatter** — all metadata ligger i `blog-data.json`.

### 3. Lägg till posten i katalogen

Läs `web/blog-data.json`, lägg till en ny post i `posts`-arrayen. Behåll befintliga poster oförändrade.

### 4. Pusha och publicera

Blogginlägg kan pushas direkt till `main` utan PR — förutsatt att ändringarna **enbart** rör:

* `web/blog-data.json`
* `web/blog/posts/*.md`

```Shell
git add web/blog-data.json web/blog/posts/<slug>.md
git commit -m "Nytt blogginlägg: <titel>"
git push origin main
```

Ändringen FÅR INTE beröra andra filer (CSS, sidor, schema)&#x20;

## Redigera befintliga inlägg

1. Uppdatera markdown-filen i `web/blog/posts/<slug>.md`
2. Uppdatera metadata i `web/blog-data.json` om titel, datum eller kopplingar ändras
3. Pusha till main och trigga `/refresh`

## Ta bort ett inlägg

1. Ta bort posten ur `posts`-arrayen i `web/blog-data.json`
2. Ta bort `web/blog/posts/<slug>.md`
3. Pusha till main och trigga `/refresh`

## Viktigt

* **Sluggen måste matcha** — slug i `blog-data.json` och filnamn `<slug>.md` måste vara identiska
* **Sortering sker på datum** — nyaste först på webbplatsen
* **Validering sker vid hämtning** — om `blog-data.json` inte passerar Zod-validering visas inga inlägg
* **Svenska med å, ä, ö** i allt innehåll
* **Vi röjer ALDRIG kunders namn eller identitet.** Riksrevisionen ska inte nämnas i annat sammanhang än som vilken myndighet som helst.


