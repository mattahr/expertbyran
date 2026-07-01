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
