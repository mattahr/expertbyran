// web/src/lib/stores/memory-stores.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import type { BlogPostEntry } from "@/lib/blog/schema";
import type { BlogStore, ConfigStore, ContentStore, SiteConfig } from "./types";
import { ConflictError, NotFoundError } from "./types";

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

  async listPosts() {
    return [...this.posts];
  }
  async getPost(slug: string) {
    const meta = this.posts.find((p) => p.slug === slug);
    if (!meta) return null;
    return { meta, markdown: this.markdown.get(slug) ?? "" };
  }
  async createPost(meta: BlogPostEntry, markdown: string) {
    if (this.posts.some((p) => p.slug === meta.slug)) {
      throw new ConflictError(`Blog post with slug ${meta.slug} already exists`);
    }
    this.posts.push(meta);
    this.markdown.set(meta.slug, markdown);
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
    if (nextMeta.slug !== slug) this.markdown.delete(slug);
    this.markdown.set(nextMeta.slug, md);
    this.posts[i] = nextMeta;
    return nextMeta;
  }
  async deletePost(slug: string) {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    this.posts.splice(i, 1);
    this.markdown.delete(slug);
  }
}
