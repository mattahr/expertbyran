"use client";

import { useEffect, useState } from "react";

import styles from "@/app/admin/admin.module.css";
import { AreaPicker, type AreaOption } from "./AreaPicker";
import { AuthorPicker, type ExpertOption } from "./AuthorPicker";

// Gemensam redigerbar metadata för markdown-baserat innehåll (blogg + foresight).
export interface EditableMeta {
  slug: string;
  title: string;
  date: string;
  authorSlug?: string;
  authorName?: string;
  authorRole?: string;
  areaSlugs: string[];
  excerpt: string;
  horizon?: string;
}

export interface ContentConfig {
  listUrl: string; // GET → { [listKey]: EditableMeta[] }
  listKey: string;
  itemKey: string; // GET/PUT-nyckel: "post" | "foresight"
  itemUrl: (slug: string) => string;
  emptyLabel: string;
  hasHorizon?: boolean;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}

export function MarkdownContentAdmin({ config }: { config: ContentConfig }) {
  const [items, setItems] = useState<EditableMeta[]>([]);
  const [experts, setExperts] = useState<ExpertOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableMeta | null>(null);
  const [draftMarkdown, setDraftMarkdown] = useState("");
  const [originalMarkdown, setOriginalMarkdown] = useState("");
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [list, siteData] = await Promise.all([
        fetch(config.listUrl).then((r) => r.json()),
        fetch("/api/v1/site-data")
          .then((r) => r.json())
          .catch(() => ({ experts: [], expertAreas: [] })),
      ]);
      setItems(list[config.listKey] ?? []);
      setExperts(siteData.experts ?? []);
      setAreas(siteData.expertAreas ?? []);
    } catch {
      setStatus("Kunde inte ladda innehållet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // config är stabil per sida (modulkonstant) — ladda en gång.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEdit(item: EditableMeta) {
    setEditing(item.slug);
    setDraft({ ...item });
    setStatus(null);
    setDraftMarkdown("");
    setOriginalMarkdown("");
    setMarkdownLoading(true);
    try {
      const data = await fetch(config.itemUrl(item.slug)).then((r) => r.json());
      setDraftMarkdown(data.markdown ?? "");
      setOriginalMarkdown(data.markdown ?? "");
    } catch {
      setStatus("Kunde inte ladda innehållets text.");
    } finally {
      setMarkdownLoading(false);
    }
  }

  function cancel() {
    setEditing(null);
    setDraft(null);
    setDraftMarkdown("");
    setOriginalMarkdown("");
  }

  async function save() {
    if (!draft || !editing) return;
    const body: Record<string, unknown> = { [config.itemKey]: draft };
    if (draftMarkdown !== originalMarkdown) body.markdown = draftMarkdown;
    const res = await fetch(config.itemUrl(editing), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setStatus("Ändringarna sparades.");
      cancel();
      void load();
    } else {
      const e = await res.json().catch(() => ({}));
      setStatus(`Kunde inte spara: ${e.error ?? res.status}`);
    }
  }

  async function remove(slug: string, title: string) {
    if (!window.confirm(`Radera "${title}"? Detta går inte att ångra.`)) return;
    const res = await fetch(config.itemUrl(slug), { method: "DELETE" });
    if (res.ok) {
      setStatus("Innehållet raderades.");
      void load();
    } else {
      setStatus(`Kunde inte radera (${res.status}).`);
    }
  }

  if (loading) return <p className={styles.empty}>Laddar…</p>;

  const areaName = (slug: string) => areas.find((a) => a.slug === slug)?.name ?? slug;
  const authorLabel = (m: EditableMeta) =>
    m.authorName || experts.find((e) => e.slug === m.authorSlug)?.name || "—";

  return (
    <div>
      {status && <p className={styles.statusMsg}>{status}</p>}
      {items.length === 0 && <p className={styles.empty}>{config.emptyLabel}</p>}

      {items.map((item) => (
        <div key={item.slug}>
          <div className={styles.blogRow}>
            <div>
              <div className={styles.blogTitle}>{item.title}</div>
              <div className={styles.blogMeta}>
                {item.date.slice(0, 10)} · {authorLabel(item)} ·{" "}
                {item.areaSlugs.map(areaName).join(", ")}
              </div>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.smallBtn} onClick={() => startEdit(item)}>
                Redigera
              </button>
              <button type="button" className={styles.dangerBtn} onClick={() => remove(item.slug, item.title)}>
                Radera
              </button>
            </div>
          </div>

          {editing === item.slug && draft && (
            <div className={styles.editGrid}>
              <Field label="Titel">
                <input
                  className={styles.input}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </Field>
              <Field label="Datum (ISO)">
                <input
                  className={styles.input}
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </Field>

              <AuthorPicker
                experts={experts}
                value={{ authorSlug: draft.authorSlug, authorName: draft.authorName, authorRole: draft.authorRole }}
                onChange={(a) => setDraft({ ...draft, ...a })}
              />

              <AreaPicker
                areas={areas}
                selected={draft.areaSlugs}
                onChange={(slugs) => setDraft({ ...draft, areaSlugs: slugs })}
              />

              {config.hasHorizon && (
                <Field label="Horisont (valfritt, t.ex. 2026–2030)">
                  <input
                    className={styles.input}
                    value={draft.horizon ?? ""}
                    onChange={(e) => setDraft({ ...draft, horizon: e.target.value || undefined })}
                  />
                </Field>
              )}

              <Field label="Utdrag">
                <textarea
                  className={styles.input}
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                />
              </Field>

              <Field label="Innehåll (Markdown)">
                {markdownLoading ? (
                  <p className={styles.empty}>Laddar text…</p>
                ) : (
                  <textarea
                    className={`${styles.input} ${styles.markdownArea}`}
                    rows={18}
                    value={draftMarkdown}
                    onChange={(e) => setDraftMarkdown(e.target.value)}
                    spellCheck={false}
                  />
                )}
              </Field>

              <div className={styles.rowActions}>
                <button type="button" className={styles.button} onClick={save}>
                  Spara
                </button>
                <button type="button" className={styles.smallBtn} onClick={cancel}>
                  Avbryt
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export const BLOG_CONFIG: ContentConfig = {
  listUrl: "/api/v1/blog/posts",
  listKey: "posts",
  itemKey: "post",
  itemUrl: (slug) => `/api/v1/blog/posts/${slug}`,
  emptyLabel: "Inga blogginlägg ännu.",
};

export const FORESIGHT_CONFIG: ContentConfig = {
  listUrl: "/api/v1/foresights",
  listKey: "foresights",
  itemKey: "foresight",
  itemUrl: (slug) => `/api/v1/foresights/${slug}`,
  emptyLabel: "Inga foresights ännu.",
  hasHorizon: true,
};
