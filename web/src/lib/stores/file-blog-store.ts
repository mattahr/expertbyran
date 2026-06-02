// web/src/lib/stores/file-blog-store.ts
import path from "node:path";

import { parseBlogCatalog, type BlogCatalog, type BlogPostEntry } from "@/lib/blog/schema";
import type { BlogStore } from "./types";
import { ConflictError, NotFoundError } from "./types";
import {
  atomicWriteFile,
  deleteFileIfExists,
  readJsonFile,
  readTextFile,
  resolveDataDir,
} from "./fs-helpers";

export class FileBlogStore implements BlogStore {
  private readonly catalogFile: string;
  private readonly postsDir: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.catalogFile = path.join(dataDir, "blog-data.json");
    this.postsDir = path.join(dataDir, "blog", "posts");
  }

  private async readCatalog(): Promise<BlogCatalog> {
    try {
      const raw = await readJsonFile(this.catalogFile);
      return parseBlogCatalog(raw, this.catalogFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { posts: [] };
      throw error;
    }
  }

  private async writeCatalog(catalog: BlogCatalog): Promise<void> {
    const validated = parseBlogCatalog(catalog, "blog-store-write");
    await atomicWriteFile(this.catalogFile, JSON.stringify(validated, null, 2));
  }

  private markdownPath(slug: string): string {
    return path.join(this.postsDir, `${slug}.md`);
  }

  async listPosts(): Promise<BlogPostEntry[]> {
    return (await this.readCatalog()).posts;
  }

  async getPost(slug: string): Promise<{ meta: BlogPostEntry; markdown: string } | null> {
    const meta = (await this.readCatalog()).posts.find((p) => p.slug === slug);
    if (!meta) return null;
    const markdown = await readTextFile(this.markdownPath(slug));
    return { meta, markdown };
  }

  async createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry> {
    const catalog = await this.readCatalog();
    if (catalog.posts.some((p) => p.slug === meta.slug)) {
      throw new ConflictError(`Blog post with slug ${meta.slug} already exists`);
    }
    catalog.posts.push(meta);
    await this.writeCatalog(catalog);
    await atomicWriteFile(this.markdownPath(meta.slug), markdown);
    return meta;
  }

  async updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry> {
    const catalog = await this.readCatalog();
    const index = catalog.posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);

    const nextMeta = patch.meta ?? catalog.posts[index];
    const slugChanged = nextMeta.slug !== slug;

    if (slugChanged && catalog.posts.some((p) => p.slug === nextMeta.slug)) {
      throw new ConflictError(`Blog post with slug ${nextMeta.slug} already exists`);
    }

    if (slugChanged) {
      const existingMarkdown = patch.markdown ?? (await readTextFile(this.markdownPath(slug)));
      await atomicWriteFile(this.markdownPath(nextMeta.slug), existingMarkdown);
      await deleteFileIfExists(this.markdownPath(slug));
    } else if (patch.markdown !== undefined) {
      await atomicWriteFile(this.markdownPath(slug), patch.markdown);
    }

    catalog.posts[index] = nextMeta;
    await this.writeCatalog(catalog);
    return nextMeta;
  }

  async deletePost(slug: string): Promise<void> {
    const catalog = await this.readCatalog();
    const index = catalog.posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    catalog.posts.splice(index, 1);
    await this.writeCatalog(catalog);
    await deleteFileIfExists(this.markdownPath(slug));
  }
}
