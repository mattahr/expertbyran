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

// Ren WYSIWYG-editor. Monteras enbart client-side via MarkdownEditor (dynamic/ssr:false).
// startInSource: öppna direkt i Källa-läget (används för fotnots-innehåll).
// sourceOnly: exponera bara Källa i växlaren (Rich görs otillgängligt).
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
