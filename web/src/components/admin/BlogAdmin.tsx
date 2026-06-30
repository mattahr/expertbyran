"use client";

import { useEffect, useState } from "react";

import type { BlogPostEntry } from "@/lib/blog/schema";

import styles from "@/app/admin/admin.module.css";

export function BlogAdmin() {
  const [posts, setPosts] = useState<BlogPostEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlogPostEntry | null>(null);
  const [draftMarkdown, setDraftMarkdown] = useState("");
  const [originalMarkdown, setOriginalMarkdown] = useState("");
  const [markdownLoading, setMarkdownLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/blog/posts");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      setStatus("Kunde inte ladda inlägg.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function startEdit(post: BlogPostEntry) {
    setEditing(post.slug);
    setDraft({ ...post });
    setStatus(null);
    setDraftMarkdown("");
    setOriginalMarkdown("");
    setMarkdownLoading(true);
    try {
      const res = await fetch(`/api/v1/blog/posts/${post.slug}`);
      const data = await res.json();
      setDraftMarkdown(data.markdown ?? "");
      setOriginalMarkdown(data.markdown ?? "");
    } catch {
      setStatus("Kunde inte ladda inläggets text.");
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
    // Skicka bara markdown om den ändrats — annars renderas HTML i onödan om.
    const body: { post: BlogPostEntry; markdown?: string } = { post: draft };
    if (draftMarkdown !== originalMarkdown) body.markdown = draftMarkdown;
    const res = await fetch(`/api/v1/blog/posts/${editing}`, {
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
    const res = await fetch(`/api/v1/blog/posts/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setStatus("Inlägget raderades.");
      void load();
    } else {
      setStatus(`Kunde inte radera (${res.status}).`);
    }
  }

  if (loading) return <p className={styles.empty}>Laddar…</p>;

  return (
    <div>
      {status && <p className={styles.statusMsg}>{status}</p>}
      {posts.length === 0 && <p className={styles.empty}>Inga blogginlägg ännu.</p>}

      {posts.map((post) => (
        <div key={post.slug}>
          <div className={styles.blogRow}>
            <div>
              <div className={styles.blogTitle}>{post.title}</div>
              <div className={styles.blogMeta}>
                {post.date.slice(0, 10)} · {post.authorName ?? "okänd"} · {post.areaSlugs.join(", ")}
              </div>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.smallBtn} onClick={() => startEdit(post)}>
                Redigera
              </button>
              <button type="button" className={styles.dangerBtn} onClick={() => remove(post.slug, post.title)}>
                Radera
              </button>
            </div>
          </div>

          {editing === post.slug && draft && (
            <div className={styles.editGrid}>
              <div className={styles.field}>
                <label className={styles.label}>Titel</label>
                <input
                  className={styles.input}
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Datum (ISO)</label>
                <input
                  className={styles.input}
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Författare</label>
                <input
                  className={styles.input}
                  value={draft.authorName ?? ""}
                  onChange={(e) => setDraft({ ...draft, authorName: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Områden (kommaseparerade)</label>
                <input
                  className={styles.input}
                  value={draft.areaSlugs.join(", ")}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      areaSlugs: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Utdrag</label>
                <textarea
                  className={styles.input}
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Innehåll (Markdown)</label>
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
              </div>
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
