// web/src/lib/stores/sqlite-blog-store.ts
import type { DatabaseSync } from "node:sqlite";

import { MARKDOWN_RENDERER_VERSION, renderBlogMarkdown } from "@/lib/blog/markdown";
import { parseBlogPostEntry, type BlogPostEntry } from "@/lib/blog/schema";
import { getDb } from "@/lib/db/client";
import type { BlogStore, ListPageOptions, StoredPost } from "./types";
import { ConflictError, NotFoundError } from "./types";

type BlogRow = {
  slug: string;
  title: string;
  date: string;
  author_slug: string | null;
  author_name: string | null;
  author_role: string | null;
  excerpt: string;
  area_slugs: string;
  markdown: string;
  html: string;
};

const ENTRY_COLUMNS =
  "slug, title, date, author_slug, author_name, author_role, excerpt, area_slugs";

function rowToEntry(row: BlogRow): BlogPostEntry {
  const entry: BlogPostEntry = {
    slug: row.slug,
    title: row.title,
    date: row.date,
    areaSlugs: JSON.parse(row.area_slugs) as string[],
    excerpt: row.excerpt,
  };
  if (row.author_slug !== null) entry.authorSlug = row.author_slug;
  if (row.author_name !== null) entry.authorName = row.author_name;
  if (row.author_role !== null) entry.authorRole = row.author_role;
  return entry;
}

export class SqliteBlogStore implements BlogStore {
  constructor(private readonly dbInstance?: DatabaseSync) {}

  private get db(): DatabaseSync {
    return this.dbInstance ?? getDb();
  }

  private exists(slug: string): boolean {
    return Boolean(this.db.prepare("SELECT 1 FROM blog_posts WHERE slug = ?").get(slug));
  }

  private insertAreaRows(slug: string, areaSlugs: string[]): void {
    const stmt = this.db.prepare(
      "INSERT INTO blog_post_areas (post_slug, area_slug) VALUES (?, ?)",
    );
    for (const areaSlug of new Set(areaSlugs)) stmt.run(slug, areaSlug);
  }

  async listPosts(): Promise<BlogPostEntry[]> {
    const rows = this.db
      .prepare(`SELECT ${ENTRY_COLUMNS} FROM blog_posts ORDER BY date_ms DESC, slug`)
      .all() as BlogRow[];
    return rows.map(rowToEntry);
  }

  async listPostsPage(opts: ListPageOptions): Promise<{ posts: BlogPostEntry[]; total: number }> {
    const areaSlugs = opts.areaSlugs?.length ? opts.areaSlugs : null;

    if (!areaSlugs) {
      const total = (
        this.db.prepare("SELECT COUNT(*) AS n FROM blog_posts").get() as { n: number }
      ).n;
      const rows = this.db
        .prepare(
          `SELECT ${ENTRY_COLUMNS} FROM blog_posts ORDER BY date_ms DESC, slug LIMIT ? OFFSET ?`,
        )
        .all(opts.limit, opts.offset) as BlogRow[];
      return { posts: rows.map(rowToEntry), total };
    }

    const placeholders = areaSlugs.map(() => "?").join(", ");
    const total = (
      this.db
        .prepare(
          `SELECT COUNT(DISTINCT post_slug) AS n FROM blog_post_areas WHERE area_slug IN (${placeholders})`,
        )
        .get(...areaSlugs) as { n: number }
    ).n;
    const rows = this.db
      .prepare(
        `SELECT DISTINCT p.slug, p.title, p.date, p.author_slug, p.author_name, p.author_role, p.excerpt, p.area_slugs
         FROM blog_posts p
         JOIN blog_post_areas a ON a.post_slug = p.slug
         WHERE a.area_slug IN (${placeholders})
         ORDER BY p.date_ms DESC, p.slug LIMIT ? OFFSET ?`,
      )
      .all(...areaSlugs, opts.limit, opts.offset) as BlogRow[];
    return { posts: rows.map(rowToEntry), total };
  }

  async listUsedAreaSlugs(): Promise<string[]> {
    const rows = this.db
      .prepare("SELECT DISTINCT area_slug FROM blog_post_areas ORDER BY area_slug")
      .all() as { area_slug: string }[];
    return rows.map((row) => row.area_slug);
  }

  async getPost(slug: string): Promise<StoredPost<BlogPostEntry> | null> {
    const row = this.db
      .prepare(`SELECT ${ENTRY_COLUMNS}, markdown, html FROM blog_posts WHERE slug = ?`)
      .get(slug) as BlogRow | undefined;
    if (!row) return null;
    return { meta: rowToEntry(row), markdown: row.markdown, html: row.html };
  }

  async createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry> {
    const validated = parseBlogPostEntry(meta, "blog-store-write");
    if (this.exists(validated.slug)) {
      throw new ConflictError(`Blog post with slug ${validated.slug} already exists`);
    }
    const html = await renderBlogMarkdown(markdown);

    this.db.exec("BEGIN IMMEDIATE;");
    try {
      this.db
        .prepare(
          `INSERT INTO blog_posts (slug, title, date, date_ms, author_slug, author_name, author_role, excerpt, area_slugs, markdown, html, renderer_version, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          JSON.stringify(validated.areaSlugs),
          markdown,
          html,
          MARKDOWN_RENDERER_VERSION,
          new Date().toISOString(),
        );
      this.insertAreaRows(validated.slug, validated.areaSlugs);
      this.db.exec("COMMIT;");
    } catch (error) {
      this.db.exec("ROLLBACK;");
      throw error;
    }
    return validated;
  }

  async updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry> {
    const existing = await this.getPost(slug);
    if (!existing) throw new NotFoundError(`Blog post with slug ${slug} not found`);

    const nextMeta = patch.meta ? parseBlogPostEntry(patch.meta, "blog-store-write") : existing.meta;
    const slugChanged = nextMeta.slug !== slug;
    if (slugChanged && this.exists(nextMeta.slug)) {
      throw new ConflictError(`Blog post with slug ${nextMeta.slug} already exists`);
    }

    const nextMarkdown = patch.markdown ?? existing.markdown;
    const nextHtml =
      patch.markdown !== undefined ? await renderBlogMarkdown(nextMarkdown) : existing.html;

    this.db.exec("BEGIN IMMEDIATE;");
    try {
      this.db
        .prepare(
          `UPDATE blog_posts
           SET slug = ?, title = ?, date = ?, date_ms = ?, author_slug = ?, author_name = ?, author_role = ?, excerpt = ?, area_slugs = ?, markdown = ?, html = ?, renderer_version = ?, updated_at = ?
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
          JSON.stringify(nextMeta.areaSlugs),
          nextMarkdown,
          nextHtml,
          MARKDOWN_RENDERER_VERSION,
          new Date().toISOString(),
          slug,
        );
      this.db.prepare("DELETE FROM blog_post_areas WHERE post_slug = ?").run(nextMeta.slug);
      this.insertAreaRows(nextMeta.slug, nextMeta.areaSlugs);
      this.db.exec("COMMIT;");
    } catch (error) {
      this.db.exec("ROLLBACK;");
      throw error;
    }
    return nextMeta;
  }

  async deletePost(slug: string): Promise<void> {
    const result = this.db.prepare("DELETE FROM blog_posts WHERE slug = ?").run(slug);
    if (result.changes === 0) throw new NotFoundError(`Blog post with slug ${slug} not found`);
  }
}
