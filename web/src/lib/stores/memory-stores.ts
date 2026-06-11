// web/src/lib/stores/memory-stores.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { assertRadarIntegrity, type Blip, type RadarMeta } from "@/lib/radar/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";
import type {
  BlogStore,
  ConfigStore,
  ContentStore,
  ForesightStore,
  ListPageOptions,
  RadarStore,
  SiteConfig,
  StoredPost,
} from "./types";
import { ConflictError, NotFoundError } from "./types";

// Samma sorteringskontrakt som sqlite-stores: nyast först, slug som tiebreaker.
function byDateDesc<T extends { date: string; slug: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const diff = Date.parse(b.date) - Date.parse(a.date);
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  });
}

export class InMemoryConfigStore implements ConfigStore {
  constructor(private readonly data: SiteData) {}
  async getSiteConfig(): Promise<SiteConfig> {
    const { version, updatedAt, site, organization, marketplace } = this.data;
    return { version, updatedAt, site, organization, marketplace };
  }
}

export class InMemoryContentStore implements ContentStore {
  private experts: Expert[];
  private areas: ExpertArea[];

  constructor(experts: Expert[] = [], areas: ExpertArea[] = []) {
    this.experts = [...experts];
    this.areas = [...areas];
  }

  async listExperts() {
    return [...this.experts];
  }
  async getExpert(slug: string) {
    return this.experts.find((e) => e.slug === slug) ?? null;
  }
  async createExpert(expert: Expert) {
    if (this.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    this.experts.push(expert);
    return expert;
  }
  async updateExpert(slug: string, expert: Expert) {
    const i = this.experts.findIndex((e) => e.slug === slug);
    if (i === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    if (expert.slug !== slug && this.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    this.experts[i] = expert;
    return expert;
  }
  async deleteExpert(slug: string) {
    const i = this.experts.findIndex((e) => e.slug === slug);
    if (i === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    this.experts.splice(i, 1);
  }

  async listAreas() {
    return [...this.areas];
  }
  async getArea(slug: string) {
    return this.areas.find((a) => a.slug === slug) ?? null;
  }
  async createArea(area: ExpertArea) {
    if (this.areas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    this.areas.push(area);
    return area;
  }
  async updateArea(slug: string, area: ExpertArea) {
    const i = this.areas.findIndex((a) => a.slug === slug);
    if (i === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    if (area.slug !== slug && this.areas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    this.areas[i] = area;
    return area;
  }
  async deleteArea(slug: string) {
    const i = this.areas.findIndex((a) => a.slug === slug);
    if (i === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    this.areas.splice(i, 1);
  }
}

export class InMemoryBlogStore implements BlogStore {
  private posts: BlogPostEntry[] = [];
  private markdown = new Map<string, string>();
  private html = new Map<string, string>();

  async listPosts() {
    return byDateDesc(this.posts);
  }
  async listPostsPage(opts: ListPageOptions) {
    const wanted = opts.areaSlugs?.length ? new Set(opts.areaSlugs) : null;
    const filtered = byDateDesc(
      wanted ? this.posts.filter((p) => p.areaSlugs.some((slug) => wanted.has(slug))) : this.posts,
    );
    return {
      posts: filtered.slice(opts.offset, opts.offset + opts.limit),
      total: filtered.length,
    };
  }
  async listUsedAreaSlugs() {
    return [...new Set(this.posts.flatMap((p) => p.areaSlugs))].sort();
  }
  async getPost(slug: string): Promise<StoredPost<BlogPostEntry> | null> {
    const meta = this.posts.find((p) => p.slug === slug);
    if (!meta) return null;
    return { meta, markdown: this.markdown.get(slug) ?? "", html: this.html.get(slug) ?? "" };
  }
  async createPost(meta: BlogPostEntry, markdown: string) {
    if (this.posts.some((p) => p.slug === meta.slug)) {
      throw new ConflictError(`Blog post with slug ${meta.slug} already exists`);
    }
    this.posts.push(meta);
    this.markdown.set(meta.slug, markdown);
    this.html.set(meta.slug, await renderBlogMarkdown(markdown));
    return meta;
  }
  async updatePost(slug: string, patch: { meta?: BlogPostEntry; markdown?: string }) {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.posts[i];
    if (nextMeta.slug !== slug && this.posts.some((p) => p.slug === nextMeta.slug)) {
      throw new ConflictError(`Blog post with slug ${nextMeta.slug} already exists`);
    }
    const md = patch.markdown ?? this.markdown.get(slug) ?? "";
    const html =
      patch.markdown !== undefined ? await renderBlogMarkdown(md) : (this.html.get(slug) ?? "");
    if (nextMeta.slug !== slug) {
      this.markdown.delete(slug);
      this.html.delete(slug);
    }
    this.markdown.set(nextMeta.slug, md);
    this.html.set(nextMeta.slug, html);
    this.posts[i] = nextMeta;
    return nextMeta;
  }
  async deletePost(slug: string) {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    this.posts.splice(i, 1);
    this.markdown.delete(slug);
    this.html.delete(slug);
  }
}

export class InMemoryRadarStore implements RadarStore {
  private radars: RadarMeta[] = [];
  private blips = new Map<string, Blip[]>();

  async listRadars() {
    return byDateDesc(this.radars);
  }
  async getRadar(slug: string) {
    const meta = this.radars.find((r) => r.slug === slug);
    if (!meta) return null;
    return { meta, blips: [...(this.blips.get(slug) ?? [])] };
  }
  async createRadar(meta: RadarMeta, blips: Blip[]) {
    assertRadarIntegrity(meta, blips);
    if (this.radars.some((r) => r.slug === meta.slug)) {
      throw new ConflictError(`Radar with slug ${meta.slug} already exists`);
    }
    this.radars.push(meta);
    this.blips.set(meta.slug, blips);
    return meta;
  }
  async updateRadar(slug: string, patch: { meta?: RadarMeta; blips?: Blip[] }) {
    const i = this.radars.findIndex((r) => r.slug === slug);
    if (i === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.radars[i];
    const nextBlips = patch.blips ?? this.blips.get(slug) ?? [];
    assertRadarIntegrity(nextMeta, nextBlips);
    if (nextMeta.slug !== slug && this.radars.some((r) => r.slug === nextMeta.slug)) {
      throw new ConflictError(`Radar with slug ${nextMeta.slug} already exists`);
    }
    if (nextMeta.slug !== slug) this.blips.delete(slug);
    this.blips.set(nextMeta.slug, nextBlips);
    this.radars[i] = nextMeta;
    return nextMeta;
  }
  async deleteRadar(slug: string) {
    const i = this.radars.findIndex((r) => r.slug === slug);
    if (i === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);
    this.radars.splice(i, 1);
    this.blips.delete(slug);
  }
}

export class InMemoryForesightStore implements ForesightStore {
  private foresights: ForesightEntry[] = [];
  private markdown = new Map<string, string>();
  private html = new Map<string, string>();

  async listForesights() {
    return byDateDesc(this.foresights);
  }
  async listForesightsPage(opts: ListPageOptions) {
    const sorted = byDateDesc(this.foresights);
    return {
      foresights: sorted.slice(opts.offset, opts.offset + opts.limit),
      total: sorted.length,
    };
  }
  async getForesight(slug: string): Promise<StoredPost<ForesightEntry> | null> {
    const meta = this.foresights.find((f) => f.slug === slug);
    if (!meta) return null;
    return { meta, markdown: this.markdown.get(slug) ?? "", html: this.html.get(slug) ?? "" };
  }
  async createForesight(meta: ForesightEntry, markdown: string) {
    if (this.foresights.some((f) => f.slug === meta.slug)) {
      throw new ConflictError(`Foresight with slug ${meta.slug} already exists`);
    }
    this.foresights.push(meta);
    this.markdown.set(meta.slug, markdown);
    this.html.set(meta.slug, await renderBlogMarkdown(markdown));
    return meta;
  }
  async updateForesight(slug: string, patch: { meta?: ForesightEntry; markdown?: string }) {
    const i = this.foresights.findIndex((f) => f.slug === slug);
    if (i === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.foresights[i];
    if (nextMeta.slug !== slug && this.foresights.some((f) => f.slug === nextMeta.slug)) {
      throw new ConflictError(`Foresight with slug ${nextMeta.slug} already exists`);
    }
    const md = patch.markdown ?? this.markdown.get(slug) ?? "";
    const html =
      patch.markdown !== undefined ? await renderBlogMarkdown(md) : (this.html.get(slug) ?? "");
    if (nextMeta.slug !== slug) {
      this.markdown.delete(slug);
      this.html.delete(slug);
    }
    this.markdown.set(nextMeta.slug, md);
    this.html.set(nextMeta.slug, html);
    this.foresights[i] = nextMeta;
    return nextMeta;
  }
  async deleteForesight(slug: string) {
    const i = this.foresights.findIndex((f) => f.slug === slug);
    if (i === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);
    this.foresights.splice(i, 1);
    this.markdown.delete(slug);
    this.html.delete(slug);
  }
}
