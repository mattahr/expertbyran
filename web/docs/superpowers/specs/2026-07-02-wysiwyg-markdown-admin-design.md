# Designspec: WYSIWYG-markdownredigering i admin (MDXEditor)

**Datum:** 2026-07-02
**Projekt:** `web/` (Expertbyråns publika Next.js-webbplats)
**Status:** Godkänd design, redo för implementationsplan

## Bakgrund & mål

Admin-panelen (`/admin`) redigerar markdown-innehåll i en rå `<textarea>` med
monospace-font. Målet är en trevligare redigeringsupplevelse: en **WYSIWYG-editor
("enklare ordbehandlare") som standard**, med en **Källa-flik** för att redigera rå
markdown vid behov. Ändringen ska vara väl avgränsad — den får inte påverka den
publika sajten, render-pipelinen eller lagringen.

## Omfattning

**Ingår.** De två markdown-fälten i admin, som redan delar komponenten
`MarkdownContentAdmin`:

| Innehållstyp | Admin-sida | Fält |
|---|---|---|
| Blogginlägg | `/admin/blogg` | "Innehåll (Markdown)" |
| Foresight | `/admin/foresight` | "Innehåll (Markdown)" |

**Ingår inte (non-goals).**
- Fältet **Utdrag** (`excerpt`) förblir en vanlig `<textarea>` — kort sammanfattning,
  WYSIWYG vore overkill.
- **Radar** (`/admin/radar`) använder inte markdown (rena textfält) — orört.
- Experter/områden redigeras inte i admin-UI:t — orört.
- Ingen ändring av render-pipeline, API, lagring eller publik rendering.
- Ingen *visuell* fotnotsredigering i Rich-läget (se Fotnots-hantering).

## Nuläge (integrationspunkt)

- Delad komponent: `web/src/components/admin/MarkdownContentAdmin.tsx`
  (`"use client"`), används av `web/src/app/admin/blogg/page.tsx` och
  `web/src/app/admin/foresight/page.tsx` via `BLOG_CONFIG` / `FORESIGHT_CONFIG`.
- Markdown-fältet är en kontrollerad `<textarea>` (rad 214–222) med state
  `draftMarkdown` (rad 46) och `originalMarkdown` (rad 47, för dirty-koll).
- Wrappern `Field` (rad 31–38) ger etikett + layout; CSS-modul importeras som
  `styles` från `@/app/admin/admin.module.css`.
- **Markdown är källan.** Vid sparning skickar formuläret markdown-strängen till
  `PUT /api/v1/blog/posts/[slug]` resp. `PUT /api/v1/foresights/[slug]`. API:t
  renderar HTML vid skrivning (`renderBlogMarkdown` i `web/src/lib/blog/markdown.ts`)
  och lagrar `markdown` + `html` + `renderer_version` i SQLite. Läsvägen serverar
  färdig HTML via `dangerouslySetInnerHTML`.
- Renderaren är **`marked` (GFM)** plus en **egen fotnots-extension**
  (`[^label]`-syntax, `web/src/lib/blog/markdown.ts`).
- Faktisk användning idag (live-DB): 44 blogginlägg + 2 foresights. **0 använder
  fotnoter.** 3 inlägg använder GFM-tabeller. Ingen rå HTML.

## Vald lösning: MDXEditor

**`@mdxeditor/editor` v4.0.4** (peer-dep `react: ">= 18 || >= 19"` — kompatibel med
projektets React 19.2 / Next 16.2). Vald i brainstorming framför
`@uiw/react-md-editor` (ej äkta WYSIWYG) och Toast UI Editor (ej React-native, tyngre,
daterad styling). MDXEditor läser och skriver markdown, är React-native (byggd på
Lexical) och har en inbyggd Rich/Källa-växlare — exakt den efterfrågade UX:en.

### Komponentstruktur

MDXEditor rör webbläsar-API:er och måste laddas client-only. Vi följer MDXEditors
officiella Next.js-App-Router-mönster (tre filer under
`web/src/components/admin/markdown-editor/`):

1. `InitializedMDXEditor.tsx` — `"use client"`. Importerar `MDXEditor`, plugin-listan
   och `@mdxeditor/editor/style.css`. Tar emot `value`/`onChange` och forwardar en
   `MDXEditorMethods`-ref.
2. `MarkdownEditor.tsx` — `"use client"`. Laddar (1) via
   `dynamic(() => import("./InitializedMDXEditor"), { ssr: false })` och forwardar ref.
   Publikt gränssnitt: `{ value: string; onChange: (md: string) => void }`. Visar en
   enkel "Laddar editor…"-fallback under laddning.
3. `MarkdownContentAdmin.tsx` — ersätter `<textarea>` (rad 214–222) med
   `<MarkdownEditor value={draftMarkdown} onChange={setDraftMarkdown} />`. Editorn
   monteras om per post via `key={editing}` så initialvärdet sätts rent vid postbyte.
   `Field`-wrappern och `markdownLoading`-tillståndet behålls.

### WYSIWYG-funktioner (plugins)

Plugin-listan i `InitializedMDXEditor.tsx`:

- `headingsPlugin()` — rubriker
- `listsPlugin()` — ordnade & oordnade listor
- `quotePlugin()` — citat
- `thematicBreakPlugin()` — horisontell avdelare
- `linkPlugin()`, `linkDialogPlugin()` — länkar
- `imagePlugin()` — bilder (stöds av renderaren)
- `tablePlugin()` — GFM-tabeller (3 inlägg använder dem)
- `codeBlockPlugin()` + `codeMirrorPlugin({ codeBlockLanguages: … })` — kodblock med språk
- `markdownShortcutPlugin()` — omvandlar `**fet**`, `# `, `- ` osv. medan man skriver
  (ordbehandlarkänslan)
- `diffSourcePlugin({ viewMode: "rich-text" })` — Källa-läget (se nedan)
- `toolbarPlugin({ toolbarContents: … })` — verktygsrad

Verktygsrad: `UndoRedo`, `BoldItalicUnderlineToggles`, `BlockTypeSelect`,
`ListsToggle`, `CreateLink`, `InsertImage`, `InsertTable`, `InsertThematicBreak`,
`InsertCodeBlock`, samt Rich/Källa-växlaren.

### Källa/RAW-växlaren

`diffSourcePlugin` + `DiffSourceToggleWrapper` ger växlaren. **Endast Rich och Källa**
exponeras — diff-alternativet döljs (via wrapper-konfiguration; annars via CSS).
Källa-läget är en CodeMirror-ruta som visar rå markdown i monospace — samma känsla som
dagens textarea. Redigeringar i Källa-läget propageras via `onChange` **byte-exakt**
(ingen AST-round-trip).

### Fotnots-hantering

MDXEditors parser kör GFM och **felar på noder utan matchande plugin** (dokumenterat:
editorn blir tom, `onError` anropas). Fotnoter har ingen plugin, så fotnotsinnehåll får
aldrig nå Rich-läget. Lösning som ger **full fotnots-funktionalitet utan risk**:

- Ren hjälpfunktion `containsFootnotes(md: string): boolean` upptäcker en
  fotnots-**definition** (`/^\[\^[^\]\r\n]+\]:/m`). En definition är det som gör att
  renderaren över huvud taget behandlar `[^x]` som en fotnot, så det är rätt signal.
  (Enkelt medvetet val: en definition inuti ett kodblock ger en falsk positiv → editorn
  stannar i Källa-läget, vilket är säkert. Kan förfinas senare vid behov.)
- Har posten fotnoter → editorn **öppnas i Källa-läget**.
- Växlaren till Rich **blockeras** (avstängd med förklarande tooltip) så länge
  innehållet innehåller fotnoter, eftersom Rich-läget annars skulle fela på dem. Vill
  användaren ha den visuella vyn får hen ta bort fotnoterna; annars redigeras posten i
  Källa-läget.
- `onError` kopplas defensivt: om MDXEditor ändå felar → tvinga Källa-läget istället för
  en tom ruta.

Netto: fotnoter skrivs och redigeras fritt i Källa-läget, bevaras byte-exakt, och
renderas oförändrat på publika sajten (render-pipelinen är orörd). Det enda som avstås
är visuell förhandsvisning av just fotnots-poster.

### Round-trip-semantik (normalisering)

I Rich-läget re-serialiserar MDXEditor markdown från sin egen modell. Första sparningen
av en äldre post kan därför ge **kosmetiska** skillnader (punkttecken, escaping,
radbrytningar). Detta är funktionellt ofarligt: den renderade HTML:en regenereras ändå
vid varje save via den befintliga pipelinen och blir likvärdig. Källa-läget gör ingen
round-trip och är alltid byte-exakt.

### Styling

- Importera `@mdxeditor/editor/style.css` i `InitializedMDXEditor.tsx`.
- Ny CSS-modul (`markdown-editor.module.css`) som wrappar editorn och mappar MDXEditors
  CSS-variabler till projektets design-tokens (`web/src/app/globals.css`): `--accent`
  för fokus-ring, `--gray-300` för border, `--radius-sm`, projektets typsnitt. Målet är
  att editorn smälter in i det befintliga `.input`-utseendet. Källa-lägets CodeMirror
  renderas i monospace.

### Perf / SSR

Editorn är lazy-laddad och client-only (`ssr: false`). Den påverkar **inte** publika
sajten, SSR eller bundeln utanför admin — MDXEditor (inkl. Lexical/CodeMirror) hämtas
först när ett redigeringsformulär öppnas i admin.

### Beroenden

- Lägg till `@mdxeditor/editor@^4.0.4` i `web/package.json`. Paketet buntar sina egna
  beroenden (Lexical, CodeMirror, remark/mdast). Inga andra nya top-level-beroenden.

## Test & verifiering

- **Enhetstest (Vitest):** `containsFootnotes()` — sant för definition, falskt för enbart
  referens/vanlig text, sant för verklig fotnots-post.
- **Oförändrat:** `web/src/lib/blog/markdown.test.ts` (render-vägen rörs inte).
- **Ej enhetstestat:** MDXEditor-komponentens interna beteende (Lexical/CodeMirror är
  opraktiskt i jsdom) — verifieras manuellt.
- **Manuell verifiering:**
  1. Tabell-post round-trippar i Rich-läget utan att tappa tabellen.
  2. Källa-växlaren visar rå markdown; redigering där sparas byte-exakt.
  3. En post med fotnot öppnas i Källa-läget och Rich-växeln är blockerad.
  4. `npm run build`, `npx tsc --noEmit` och `npm run lint` är gröna.

## Öppna frågor / risker

- **Diff-alternativet döljs** i `DiffSourceToggleWrapper` — bekräfta exakt
  konfigurations-API i v4.0.4 under implementation (annars CSS-fallback).
- **onChange i Källa-läget** antas passera markdown oförändrad — verifieras under
  implementation (bekräfta att ingen serialisering sker i source mode).
- **MDXEditor-styling** kan kräva en del CSS-variabel-mappning för att matcha
  design-tokens — avgränsat till admin, låg risk.
