// web/src/lib/stores/sqlite-foresight-store.ts
import type { DatabaseSync } from "node:sqlite";

import { MARKDOWN_RENDERER_VERSION, renderBlogMarkdown } from "@/lib/blog/markdown";
import { parseForesightEntry, type ForesightEntry } from "@/lib/foresight/schema";
import { getDb } from "@/lib/db/client";
import type { ForesightStore, ListPageOptions, StoredPost } from "./types";
import { ConflictError, NotFoundError } from "./types";

// Se mapSlugConstraint i sqlite-blog-store.ts — samma TOCTOU-fönster runt
// markdown-renderingens await; PK-felet mappas till 409 i stället för 400.
function mapSlugConstraint(error: unknown, slug: string): never {
  if (
    error instanceof Error &&
    error.message.includes("UNIQUE constraint failed: foresights.slug")
  ) {
    throw new ConflictError(`Foresight with slug ${slug} already exists`);
  }
  throw error;
}

type ForesightRow = {
  slug: string;
  title: string;
  date: string;
  author_slug: string | null;
  author_name: string | null;
  author_role: string | null;
  excerpt: string;
  horizon: string | null;
  area_slugs: string;
  markdown: string;
  html: string;
};

const ENTRY_COLUMNS =
  "slug, title, date, author_slug, author_name, author_role, excerpt, horizon, area_slugs";

function rowToEntry(row: ForesightRow): ForesightEntry {
  const entry: ForesightEntry = {
    slug: row.slug,
    title: row.title,
    date: row.date,
    areaSlugs: JSON.parse(row.area_slugs) as string[],
    excerpt: row.excerpt,
  };
  if (row.author_slug !== null) entry.authorSlug = row.author_slug;
  if (row.author_name !== null) entry.authorName = row.author_name;
  if (row.author_role !== null) entry.authorRole = row.author_role;
  if (row.horizon !== null) entry.horizon = row.horizon;
  return entry;
}

export class SqliteForesightStore implements ForesightStore {
  constructor(private readonly dbInstance?: DatabaseSync) {}

  private get db(): DatabaseSync {
    return this.dbInstance ?? getDb();
  }

  private exists(slug: string): boolean {
    return Boolean(this.db.prepare("SELECT 1 FROM foresights WHERE slug = ?").get(slug));
  }

  async listForesights(): Promise<ForesightEntry[]> {
    const rows = this.db
      .prepare(`SELECT ${ENTRY_COLUMNS} FROM foresights ORDER BY date_ms DESC, slug`)
      .all() as ForesightRow[];
    return rows.map(rowToEntry);
  }

  async listForesightsPage(
    opts: ListPageOptions,
  ): Promise<{ foresights: ForesightEntry[]; total: number }> {
    const total = (this.db.prepare("SELECT COUNT(*) AS n FROM foresights").get() as { n: number })
      .n;
    const rows = this.db
      .prepare(
        `SELECT ${ENTRY_COLUMNS} FROM foresights ORDER BY date_ms DESC, slug LIMIT ? OFFSET ?`,
      )
      .all(opts.limit, opts.offset) as ForesightRow[];
    return { foresights: rows.map(rowToEntry), total };
  }

  async getForesight(slug: string): Promise<StoredPost<ForesightEntry> | null> {
    const row = this.db
      .prepare(`SELECT ${ENTRY_COLUMNS}, markdown, html FROM foresights WHERE slug = ?`)
      .get(slug) as ForesightRow | undefined;
    if (!row) return null;
    return { meta: rowToEntry(row), markdown: row.markdown, html: row.html };
  }

  async createForesight(meta: ForesightEntry, markdown: string): Promise<ForesightEntry> {
    const validated = parseForesightEntry(meta, "foresight-store-write");
    if (this.exists(validated.slug)) {
      throw new ConflictError(`Foresight with slug ${validated.slug} already exists`);
    }
    const html = await renderBlogMarkdown(markdown);
    try {
      this.db
        .prepare(
          `INSERT INTO foresights (slug, title, date, date_ms, author_slug, author_name, author_role, excerpt, horizon, area_slugs, markdown, html, renderer_version, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          validated.slug,
          validated.title,
          validated.date,
          Date.parse(validated.date),
          validated.authorSlug ?? null,
          validated.authorName ?? null,
          validated.authorRole ?? null,
          validated.excerpt,
          validated.horizon ?? null,
          JSON.stringify(validated.areaSlugs),
          markdown,
          html,
          MARKDOWN_RENDERER_VERSION,
          new Date().toISOString(),
        );
    } catch (error) {
      mapSlugConstraint(error, validated.slug);
    }
    return validated;
  }

  async updateForesight(
    slug: string,
    patch: { meta?: ForesightEntry; markdown?: string },
  ): Promise<ForesightEntry> {
    const existing = await this.getForesight(slug);
    if (!existing) throw new NotFoundError(`Foresight with slug ${slug} not found`);

    const nextMeta = patch.meta
      ? parseForesightEntry(patch.meta, "foresight-store-write")
      : existing.meta;
    const slugChanged = nextMeta.slug !== slug;
    if (slugChanged && this.exists(nextMeta.slug)) {
      throw new ConflictError(`Foresight with slug ${nextMeta.slug} already exists`);
    }

    const nextMarkdown = patch.markdown ?? existing.markdown;
    const nextHtml =
      patch.markdown !== undefined ? await renderBlogMarkdown(nextMarkdown) : existing.html;

    try {
      this.db
        .prepare(
          `UPDATE foresights
           SET slug = ?, title = ?, date = ?, date_ms = ?, author_slug = ?, author_name = ?, author_role = ?, excerpt = ?, horizon = ?, area_slugs = ?, markdown = ?, html = ?, renderer_version = ?, updated_at = ?
           WHERE slug = ?`,
        )
        .run(
          nextMeta.slug,
          nextMeta.title,
          nextMeta.date,
          Date.parse(nextMeta.date),
          nextMeta.authorSlug ?? null,
          nextMeta.authorName ?? null,
          nextMeta.authorRole ?? null,
          nextMeta.excerpt,
          nextMeta.horizon ?? null,
          JSON.stringify(nextMeta.areaSlugs),
          nextMarkdown,
          nextHtml,
          MARKDOWN_RENDERER_VERSION,
          new Date().toISOString(),
          slug,
        );
    } catch (error) {
      mapSlugConstraint(error, nextMeta.slug);
    }
    return nextMeta;
  }

  async deleteForesight(slug: string): Promise<void> {
    const result = this.db.prepare("DELETE FROM foresights WHERE slug = ?").run(slug);
    if (result.changes === 0) throw new NotFoundError(`Foresight with slug ${slug} not found`);
  }
}
