## Välkommen till Expertbyråns blogg

Det här är ett exempelinlägg som visar hur bloggen fungerar. Varje inlägg skrivs i **markdown** och publiceras som en vanlig fil i repot.

### Hur det fungerar

1. Skapa en ny `.md`-fil i `blog/posts/`
2. Lägg till en post i `blog-data.json` med titel, datum och författare
3. Pusha till GitHub och anropa `/refresh`

Inlägget dyker då upp på bloggsidan utan att Docker-containern behöver byggas om.

### Formatering

Bloggen stöder vanlig markdown-formatering:

- **Fetstil** och *kursiv*
- Numrerade och onumrerade listor
- [Länkar](https://example.com) till externa resurser
- Kodblock och `inline-kod`

> Citat kan användas för att lyfta fram viktiga poänger eller sammanfattningar.

Inline-kod som `getBlogData()` visas med monospace-typsnitt. Större kodblock ser ut så här:

```
// Exempel på konfiguration
const config = {
  revalidateSeconds: 300,
  fetchTimeout: 10_000,
};
```

### Koppling till experter och områden

Varje inlägg kopplas till en **författare** (en expert i Expertbyrån) och ett eller flera **expertområden**. Dessa visas i sidofältet och gör det enkelt att navigera vidare.
