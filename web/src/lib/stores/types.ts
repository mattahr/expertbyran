// web/src/lib/stores/types.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import type { BlogPostEntry } from "@/lib/blog/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";
import type { Blip, RadarMeta } from "@/lib/radar/schema";

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

/** Paginerad listfråga. areaSlugs filtrerar på minst ett gemensamt område. */
export type ListPageOptions = {
  offset: number;
  limit: number;
  areaSlugs?: string[];
};

/**
 * Inlägg med färdigrenderad HTML. Markdown är källan (redigeras via API:t);
 * HTML renderas vid skrivning och läses billigt per request.
 */
export type StoredPost<TMeta> = { meta: TMeta; markdown: string; html: string };

export interface BlogStore {
  /** Samtliga inlägg, nyast först. API-kontrakt: opaginerad (skills beror på den). */
  listPosts(): Promise<BlogPostEntry[]>;
  /** Paginerad lista, nyast först, med totalantal för sidnavigering. */
  listPostsPage(opts: ListPageOptions): Promise<{ posts: BlogPostEntry[]; total: number }>;
  /** Områdes-slugs som används av minst ett inlägg (för filterpiller). */
  listUsedAreaSlugs(): Promise<string[]>;
  getPost(slug: string): Promise<StoredPost<BlogPostEntry> | null>;
  createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry>;
  updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry>;
  deletePost(slug: string): Promise<void>;
}

export interface ForesightStore {
  /** Samtliga foresights, nyast först. API-kontrakt: opaginerad. */
  listForesights(): Promise<ForesightEntry[]>;
  /** Paginerad lista, nyast först, med totalantal för sidnavigering. */
  listForesightsPage(
    opts: ListPageOptions,
  ): Promise<{ foresights: ForesightEntry[]; total: number }>;
  getForesight(slug: string): Promise<StoredPost<ForesightEntry> | null>;
  createForesight(meta: ForesightEntry, markdown: string): Promise<ForesightEntry>;
  updateForesight(
    slug: string,
    patch: { meta?: ForesightEntry; markdown?: string },
  ): Promise<ForesightEntry>;
  deleteForesight(slug: string): Promise<void>;
}

export interface RadarStore {
  listRadars(): Promise<RadarMeta[]>;
  getRadar(slug: string): Promise<{ meta: RadarMeta; blips: Blip[] } | null>;
  createRadar(meta: RadarMeta, blips: Blip[]): Promise<RadarMeta>;
  updateRadar(
    slug: string,
    patch: { meta?: RadarMeta; blips?: Blip[] },
  ): Promise<RadarMeta>;
  deleteRadar(slug: string): Promise<void>;
}

/** Kastas av stores när en slug redan finns. API mappar till 409. */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/** Kastas av stores när en post saknas. API mappar till 404. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
