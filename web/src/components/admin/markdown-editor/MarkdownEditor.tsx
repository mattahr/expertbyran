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
