# WYSIWYG-markdownredigering i admin — Implementationsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ersätt admins rå markdown-`<textarea>` (blogg + foresight) med en WYSIWYG-editor (MDXEditor) med en Rich/Källa-växlare, utan att röra render-pipeline, API eller lagring.

**Architecture:** En client-only, lazy-laddad wrapper (`MarkdownEditor`) monterar MDXEditor via `dynamic(..., { ssr: false })` och ersätter textarean i den delade komponenten `MarkdownContentAdmin`. Markdown förblir källan (`value`/`onChange`-gränssnitt). Fotnots-poster öppnas i Källa-läget (MDXEditors WYSIWYG stöder inte fotnoter); ett `onError`-skyddsnät faller tillbaka till en rå textarea om innehåll inte kan tolkas.

**Tech Stack:** React 19.2, Next.js 16.2 (App Router), TypeScript 5.9, CSS Modules, Vitest, `@mdxeditor/editor` ^4.0.4.

## Global Constraints

- **Svenska med korrekta å, ä, ö** i all UI-text, kommentarer och docs.
- **Markdown är källan** — rör inte render-pipelinen (`web/src/lib/blog/markdown.ts`), API-endpoints, SQLite-lagring eller publik rendering.
- **Ny top-level-dep:** endast `@mdxeditor/editor@^4.0.4` (peer-dep `react: ">= 18 || >= 19"`).
- **Editorn är client-only** (`"use client"` + `dynamic` med `ssr: false`) — får inte köras vid SSR/build.
- **Omfattning:** endast fältet "Innehåll (Markdown)" för blogg + foresight. Utdrag, radar och experter är orörda.
- **CSS Modules** för styling; mappa mot design-tokens i `web/src/app/globals.css`.
- **Lokala kommandon körs från `web/`**; dev kräver `DATA_DIR=data` (relativ `app/data` skuggar App Router och 404:ar alla routes).

---

## Filstruktur

**Skapas:**
- `web/src/lib/blog/footnotes.ts` — ren funktion `containsFootnotes(md)`. Ingen server-dep (får bundlas i klienten).
- `web/src/lib/blog/footnotes.test.ts` — Vitest-test för `containsFootnotes`.
- `web/src/components/admin/markdown-editor/InitializedMDXEditor.tsx` — `"use client"`, själva `MDXEditor` med plugins + `style.css`.
- `web/src/components/admin/markdown-editor/MarkdownEditor.tsx` — `"use client"`, dynamisk client-only-wrapper + textarea-fallback + fotnotsnotis. Publikt API: `{ value: string; onChange: (md: string) => void }`.
- `web/src/components/admin/markdown-editor/markdown-editor.module.css` — theming mot design-tokens.

**Ändras:**
- `web/src/components/admin/MarkdownContentAdmin.tsx:214-222` — byt `<textarea>` mot `<MarkdownEditor>`.
- `web/package.json` — lägg till `@mdxeditor/editor`.

---

### Task 1: Fotnots-detektor (`containsFootnotes`)

**Files:**
- Create: `web/src/lib/blog/footnotes.ts`
- Test: `web/src/lib/blog/footnotes.test.ts`

**Interfaces:**
- Consumes: inget.
- Produces: `containsFootnotes(markdown: string): boolean` — sant om markdownen innehåller minst en fotnots-**definition** (`^[^label]:`). En definition är signalen renderaren använder för att behandla `[^x]` som fotnot.

- [ ] **Step 1: Skriv det felande testet**

`web/src/lib/blog/footnotes.test.ts`:
```ts
import { describe, expect, it } from "vitest";

import { containsFootnotes } from "./footnotes";

describe("containsFootnotes", () => {
  it("är sant när en fotnotsdefinition finns", () => {
    expect(containsFootnotes("Text.[^1]\n\n[^1]: Källa.")).toBe(true);
  });

  it("hittar definition mitt i dokumentet", () => {
    expect(containsFootnotes("# Rubrik\n\nStycke.[^a]\n\n[^a]: Not.\n")).toBe(true);
  });

  it("är falskt för enbart en referens utan definition", () => {
    expect(containsFootnotes("Här står [^1] men ingen definition.")).toBe(false);
  });

  it("är falskt för vanlig markdown", () => {
    expect(containsFootnotes("# Rubrik\n\n- punkt\n\n**fet**")).toBe(false);
  });

  it("är falskt för tom sträng", () => {
    expect(containsFootnotes("")).toBe(false);
  });
});
```

- [ ] **Step 2: Kör testet och se att det failar**

Run: `cd web && npx vitest run src/lib/blog/footnotes.test.ts`
Expected: FAIL — `Failed to resolve import "./footnotes"` / `containsFootnotes is not a function`.

- [ ] **Step 3: Skriv den minimala implementationen**

`web/src/lib/blog/footnotes.ts`:
```ts
// Upptäcker en GFM-fotnotsdefinition (t.ex. "[^1]: ..." i början av en rad).
// En definition är det som gör att renderaren behandlar [^x] som en fotnot, så det
// är rätt signal för att avgöra om innehållet måste hanteras i Källa-läget
// (MDXEditors WYSIWYG stöder inte fotnoter och skulle fela på dem).
const FOOTNOTE_DEFINITION = /^\[\^[^\]\r\n]+\]:/m;

export function containsFootnotes(markdown: string): boolean {
  return FOOTNOTE_DEFINITION.test(markdown);
}
```

- [ ] **Step 4: Kör testet och se att det passerar**

Run: `cd web && npx vitest run src/lib/blog/footnotes.test.ts`
Expected: PASS (5 tester).

- [ ] **Step 5: Commit**

```bash
cd web && git add src/lib/blog/footnotes.ts src/lib/blog/footnotes.test.ts
git commit -m "feat(web): fotnots-detektor för markdown-editor"
```

---

### Task 2: Installera MDXEditor + core-editor inkopplad i admin

Deliverable: WYSIWYG-editor med Rich/Källa-växlare (utan diff) ersätter textarean; fungerar för fotnotsfritt innehåll. (Fotnots-guard och styling kommer i Task 3–4.)

**Files:**
- Modify: `web/package.json`
- Create: `web/src/components/admin/markdown-editor/InitializedMDXEditor.tsx`
- Create: `web/src/components/admin/markdown-editor/MarkdownEditor.tsx`
- Create: `web/src/components/admin/markdown-editor/markdown-editor.module.css` (tom placeholder-klasser i denna task; fylls i Task 3)
- Modify: `web/src/components/admin/MarkdownContentAdmin.tsx`

**Interfaces:**
- Consumes: `containsFootnotes` (Task 1).
- Produces:
  - `MarkdownEditor({ value, onChange }: { value: string; onChange: (md: string) => void }): JSX.Element`
  - `InitializedMDXEditor` (default export) — props `{ startInSource: boolean; sourceOnly: boolean } & MDXEditorProps`.

- [ ] **Step 1: Installera beroendet**

Run: `cd web && npm install @mdxeditor/editor@^4.0.4`
Expected: `package.json` + lockfil uppdateras; inga peer-dep-fel för React 19.

- [ ] **Step 2: Skapa `InitializedMDXEditor.tsx`**

```tsx
"use client";

import {
  MDXEditor,
  type MDXEditorProps,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  DiffSourceToggleWrapper,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const CODE_LANGUAGES: Record<string, string> = {
  "": "Text",
  js: "JavaScript",
  ts: "TypeScript",
  tsx: "TSX",
  json: "JSON",
  bash: "Bash",
  sql: "SQL",
  python: "Python",
};

export default function InitializedMDXEditor({
  startInSource,
  sourceOnly,
  ...props
}: { startInSource: boolean; sourceOnly: boolean } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        codeBlockPlugin({ defaultCodeBlockLanguage: "" }),
        codeMirrorPlugin({ codeBlockLanguages: CODE_LANGUAGES }),
        markdownShortcutPlugin(),
        diffSourcePlugin({ viewMode: startInSource ? "source" : "rich-text" }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper
              options={sourceOnly ? ["source"] : ["rich-text", "source"]}
            >
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <BlockTypeSelect />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <InsertTable />
              <InsertThematicBreak />
              <InsertCodeBlock />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
      {...props}
    />
  );
}
```

- [ ] **Step 3: Verifiera `options`-propen på `DiffSourceToggleWrapper`**

Run: `cd web && npx tsc --noEmit`
Expected: PASS. Om TS klagar på `options` (propen finns ej i 4.0.4): ta bort `options`-attributet och lägg istället in en CSS-fallback i `markdown-editor.module.css` (Task 3) som döljer diff-knappen, samt villkora renderingen så att `sourceOnly` utelämnar Rich-läget:
```css
/* Fallback om options-propen saknas: dölj diff-knappen i växlaren */
.wrapper [data-toolbar-item="diff"] { display: none; }
```
(Diff-knappens exakta selektor bekräftas i webbläsarens inspector under manuell verifiering.)

- [ ] **Step 4: Skapa `markdown-editor.module.css` (skelett)**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.loading {
  padding: 0.75rem;
  color: var(--gray-500, #888);
  font-size: 0.9rem;
}
```

- [ ] **Step 5: Skapa `MarkdownEditor.tsx`**

```tsx
"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { containsFootnotes } from "@/lib/blog/footnotes";
import styles from "./markdown-editor.module.css";

const InitializedMDXEditor = dynamic(() => import("./InitializedMDXEditor"), {
  ssr: false,
  loading: () => <p className={styles.loading}>Laddar editor…</p>,
});

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  // Beslut tas en gång vid montering (komponenten monteras om per post).
  const [hasFootnotes] = useState(() => containsFootnotes(value));

  return (
    <div className={styles.wrapper}>
      <InitializedMDXEditor
        markdown={value}
        onChange={onChange}
        startInSource={hasFootnotes}
        sourceOnly={hasFootnotes}
      />
    </div>
  );
}
```

- [ ] **Step 6: Koppla in i `MarkdownContentAdmin.tsx`**

Lägg till import högst upp (efter rad 7):
```tsx
import { MarkdownEditor } from "./markdown-editor/MarkdownEditor";
```

Ersätt markdown-fältet (rad 211–223) med:
```tsx
              <Field label="Innehåll (Markdown)">
                {markdownLoading ? (
                  <p className={styles.empty}>Laddar text…</p>
                ) : (
                  <MarkdownEditor value={draftMarkdown} onChange={setDraftMarkdown} />
                )}
              </Field>
```

- [ ] **Step 7: Verifiera build + typer**

Run: `cd web && npx tsc --noEmit && npm run build`
Expected: PASS. Editorn får inte köras vid SSR (den är `dynamic`/`ssr:false`), så build ska inte krascha på `window`/`document`.

- [ ] **Step 8: Manuell rök-test**

Run: `cd web && DATA_DIR=data npm run dev`
Verifiera i `/admin/blogg`: öppna ett fotnotsfritt inlägg → WYSIWYG visas, rubriker/fetstil/listor renderas, Källa-växlaren finns och saknar diff-alternativ, och en tabell-post behåller sin tabell vid växling Rich↔Källa.

- [ ] **Step 9: Commit**

```bash
cd web && git add package.json package-lock.json src/components/admin/markdown-editor/ src/components/admin/MarkdownContentAdmin.tsx
git commit -m "feat(web): WYSIWYG-markdowneditor (MDXEditor) i admin"
```

---

### Task 3: Styling mot design-tokens

Deliverable: Editorn smälter in i admins `.input`-utseende (border, fokus-ring, radius, typsnitt); Källa-läget är monospace.

**Files:**
- Modify: `web/src/components/admin/markdown-editor/markdown-editor.module.css`
- Modify: `web/src/components/admin/markdown-editor/MarkdownEditor.tsx` (koppla klasser)

**Interfaces:**
- Consumes: design-tokens i `web/src/app/globals.css` (`--accent`, `--accent-light`, `--gray-300`, `--radius-sm`).
- Produces: inga nya exporterade symboler.

- [ ] **Step 1: Utöka `markdown-editor.module.css`**

```css
.editor {
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm, 8px);
  background: #fff;
}

.editor:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.content {
  min-height: 340px;
}
```

- [ ] **Step 2: Koppla klasserna i `MarkdownEditor.tsx`**

Lägg till `className` och `contentEditableClassName` på editorn:
```tsx
      <InitializedMDXEditor
        markdown={value}
        onChange={onChange}
        startInSource={hasFootnotes}
        sourceOnly={hasFootnotes}
        className={styles.editor}
        contentEditableClassName={styles.content}
      />
```

- [ ] **Step 3: Verifiera visuellt**

Run: `cd web && DATA_DIR=data npm run dev`
Verifiera i `/admin/blogg`: editorns ram/fokus-ring matchar övriga fält; Källa-läget visar monospace. Finjustera CSS-variabel-överskrivningar vid behov (MDXEditor exponerar egna CSS-variabler; lägg till överskrivningar i `.editor` tills utseendet stämmer).

- [ ] **Step 4: Commit**

```bash
cd web && git add src/components/admin/markdown-editor/
git commit -m "style(web): tema MDXEditor mot admins design-tokens"
```

---

### Task 4: Fotnots-säkerhet (notis + textarea-fallback via onError)

Deliverable: Fotnots-poster öppnas i Källa-läget med en förklarande notis; Rich-läget är otillgängligt för dem; om MDXEditor ändå felar faller editorn tillbaka till en rå textarea så innehållet aldrig går förlorat.

**Files:**
- Modify: `web/src/components/admin/markdown-editor/MarkdownEditor.tsx`
- Modify: `web/src/components/admin/markdown-editor/markdown-editor.module.css`

**Interfaces:**
- Consumes: `containsFootnotes` (Task 1), `InitializedMDXEditor` (Task 2).
- Produces: oförändrat publikt API (`MarkdownEditor({ value, onChange })`).

- [ ] **Step 1: Lägg till notis + onError-fallback i `MarkdownEditor.tsx`**

Ersätt komponentkroppen med:
```tsx
export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  // Beslut tas en gång vid montering (komponenten monteras om per post).
  const [hasFootnotes] = useState(() => containsFootnotes(value));
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Yttersta skyddsnätet: klarar MDXEditor inte innehållet faller vi tillbaka
    // till en rå textarea så redigering alltid fungerar och markdownen bevaras exakt.
    return (
      <textarea
        className={styles.fallback}
        rows={18}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      {hasFootnotes && (
        <p className={styles.footnoteNote}>
          Fotnoter upptäckta — redigeras i Källa-läget så de bevaras.
        </p>
      )}
      <InitializedMDXEditor
        markdown={value}
        onChange={onChange}
        startInSource={hasFootnotes}
        sourceOnly={hasFootnotes}
        className={styles.editor}
        contentEditableClassName={styles.content}
        onError={(payload) => {
          console.error("MDXEditor kunde inte tolka markdown:", payload);
          setFailed(true);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Lägg till notis- och fallback-stil i `markdown-editor.module.css`**

```css
.footnoteNote {
  margin: 0;
  font-size: 0.85rem;
  color: var(--gray-600, #555);
}

.fallback {
  width: 100%;
  min-height: 340px;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm, 8px);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  resize: vertical;
}
```

- [ ] **Step 3: Verifiera typer**

Run: `cd web && npx tsc --noEmit`
Expected: PASS. (`onError`-payloadens typ härleds från `MDXEditorProps`.)

- [ ] **Step 4: Manuell verifiering av fotnots-flödet**

Run: `cd web && DATA_DIR=data npm run dev`
1. Redigera ett inlägg och lägg (i Källa-läget) till `Text.[^1]` + `[^1]: Källa.`, spara.
2. Öppna samma inlägg igen → det öppnas i Källa-läget, notisen visas, och Rich-läget är otillgängligt (`sourceOnly`).
3. Publika sidan renderar fotnoten som tidigare (render-pipelinen orörd).
4. Ta bort fotnoterna, spara, öppna igen → full WYSIWYG är tillbaka.

- [ ] **Step 5: Commit**

```bash
cd web && git add src/components/admin/markdown-editor/
git commit -m "feat(web): säker fotnots-hantering i markdown-editorn"
```

---

### Task 5: Slutverifiering

Deliverable: Hela sviten grön; ingen regression i render-tester.

**Files:** inga (endast verifiering + ev. städning).

- [ ] **Step 1: Kör hela testsviten**

Run: `cd web && npm run test`
Expected: PASS, inklusive oförändrade `src/lib/blog/markdown.test.ts`.

- [ ] **Step 2: Typer, lint, build**

Run: `cd web && npx tsc --noEmit && npm run lint && npm run build`
Expected: alla gröna.

- [ ] **Step 3: Slutlig manuell checklista**

1. Blogg + foresight: WYSIWYG som standard, verktygsrad fungerar, `markdownShortcut` (skriv `**fet**`, `# `, `- `) omvandlas live.
2. Rich/Källa-växlare utan diff.
3. Tabell-post round-trippar utan att tappa tabellen.
4. Fotnots-post → Källa-läget + notis; fallback-textarea vid parse-fel.
5. Publika bloggen/foresight renderar oförändrat.

- [ ] **Step 4: Commit (om städning gjordes)**

```bash
cd web && git add -A && git commit -m "chore(web): slutverifiering WYSIWYG-editor"
```

---

## Self-Review

**Spec-täckning:**
- Omfattning (blogg + foresight, ej utdrag/radar) → Task 2 Step 6. ✓
- Komponentstruktur (Initialized + wrapper) → Task 2. ✓
- WYSIWYG-plugins inkl. tabeller/kodblock → Task 2 Step 2. ✓
- Rich/Källa utan diff → Task 2 Step 2–3. ✓
- Fotnots-guard (Källa-läge + blockerad Rich + onError-fallback) → Task 4. ✓
- Round-trip-semantik → hanteras av markdown-som-källa + oförändrad render (ingen kodändring krävs). ✓
- Styling mot tokens → Task 3. ✓
- Perf/SSR (client-only, lazy) → Task 2 (dynamic/ssr:false). ✓
- Beroende `@mdxeditor/editor@^4.0.4` → Task 2 Step 1. ✓
- Test: `containsFootnotes` + oförändrade render-tester → Task 1, Task 5. ✓

**Platshållar-scan:** Inga TBD/TODO. `options`-propen och diff-knappens CSS-selektor har konkreta fallback-vägar med verifieringssteg (Task 2 Step 3).

**Typ-konsistens:** `MarkdownEditor({ value, onChange })` och `InitializedMDXEditor({ startInSource, sourceOnly, ...MDXEditorProps })` används identiskt i Task 2/3/4. `containsFootnotes(string): boolean` konsekvent i Task 1 och 4.

## Avvikelse från specen (mindre)

Specens "Rich-växeln blockeras (avstängd med förklarande tooltip)" realiseras som: `sourceOnly` gör att Rich-alternativet inte renderas i växlaren + en synlig notis ovanför editorn, plus onError→textarea-fallback som yttersta skydd. Funktionellt likvärdigt (fotnoter når aldrig Rich-lägets re-serialisering), enklare och robustare än en disabled-knapp.
