// web/src/lib/stores/types.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import type { BlogPostEntry } from "@/lib/blog/schema";

/** Config-delen av site-data.json som förblir filförfattad (inte "content"). */
export type SiteConfig = Pick<
  SiteData,
  "version" | "updatedAt" | "site" | "organization" | "marketplace"
>;

export interface ConfigStore {
  getSiteConfig(): Promise<SiteConfig>;
}

export interface ContentStore {
  listExperts(): Promise<Expert[]>;
  getExpert(slug: string): Promise<Expert | null>;
  createExpert(expert: Expert): Promise<Expert>;
  updateExpert(slug: string, expert: Expert): Promise<Expert>;
  deleteExpert(slug: string): Promise<void>;

  listAreas(): Promise<ExpertArea[]>;
  getArea(slug: string): Promise<ExpertArea | null>;
  createArea(area: ExpertArea): Promise<ExpertArea>;
  updateArea(slug: string, area: ExpertArea): Promise<ExpertArea>;
  deleteArea(slug: string): Promise<void>;
}

export interface BlogStore {
  listPosts(): Promise<BlogPostEntry[]>;
  getPost(slug: string): Promise<{ meta: BlogPostEntry; markdown: string } | null>;
  createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry>;
  updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry>;
  deletePost(slug: string): Promise<void>;
}

/** Kastas av stores när en slug redan finns. API mappar till 409. */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Kastas av stores när en post saknas. API mappar till 404. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
