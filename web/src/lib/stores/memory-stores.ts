// web/src/lib/stores/memory-stores.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { assertRadarIntegrity, type Blip, type RadarMeta } from "@/lib/radar/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";
import type {
  AnalyticsStore,
  BlogStore,
  ConfigStore,
  ContentStore,
  CountryStat,
  ForesightStore,
  ListPageOptions,
  OverviewResult,
  PageStat,
  RadarStore,
  SectionStat,
  SiteConfig,
  StatsFilters,
  StatsRange,
  StoredPost,
  TimePoint,
  VisitInsert,
  VisitQuery,
  VisitRow,
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

const DEFAULT_LIMIT = 15;

type StoredVisit = VisitInsert & { _i: number };

export class InMemoryAnalyticsStore implements AnalyticsStore {
  private visits: StoredVisit[] = [];
  private counter = 0;

  record(v: VisitInsert): void {
    this.visits.push({ ...v, _i: this.counter++ });
  }

  earliestDay(): string | null {
    if (this.visits.length === 0) return null;
    return this.visits.reduce((min, v) => (v.day < min ? v.day : min), this.visits[0].day);
  }

  private matchesFilters(v: StoredVisit, f: StatsFilters): boolean {
    if (f.path && v.path !== f.path) return false;
    if (f.pathPrefix && v.path !== f.pathPrefix && !v.path.startsWith(`${f.pathPrefix}/`)) return false;
    if (f.country && (v.country ?? "??") !== f.country) return false;
    if (f.browser && (v.browser ?? "Okänd") !== f.browser) return false;
    if (f.os && (v.os ?? "Okänd") !== f.os) return false;
    if (f.device && v.device !== f.device) return false;
    if (f.source && v.source !== f.source) return false;
    if (f.visitorId && v.visitorId !== f.visitorId) return false;
    return true;
  }

  private inRange(range: StatsRange): StoredVisit[] {
    return this.visits.filter(
      (v) =>
        v.day >= range.from &&
        v.day <= range.to &&
        (!range.excludeBots || !v.isBot) &&
        this.matchesFilters(v, range),
    );
  }

  private rank(
    rows: StoredVisit[],
    keyFn: (v: StoredVisit) => string | null,
    filterNotNull: boolean,
    limit: number,
  ): { key: string; pageviews: number }[] {
    const counts = new Map<string, number>();
    for (const v of rows) {
      const k = keyFn(v);
      if (filterNotNull && (k === null || k === "")) continue;
      const key = k ?? "";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([key, pageviews]) => ({ key, pageviews }))
      .sort((a, b) => b.pageviews - a.pageviews || a.key.localeCompare(b.key))
      .slice(0, limit);
  }

  overview(range: StatsRange): OverviewResult {
    const limit = range.limit ?? DEFAULT_LIMIT;
    const rows = this.inRange(range);

    const pageviews = rows.length;
    const visitors = new Set(rows.map((v) => v.visitorId)).size;
    const dayset = new Set(rows.map((v) => v.day));
    const botPageviews = this.visits.filter(
      (v) => v.day >= range.from && v.day <= range.to && v.isBot && this.matchesFilters(v, range),
    ).length;

    const byDay = new Map<string, { pv: number; vis: Set<string> }>();
    for (const v of rows) {
      const e = byDay.get(v.day) ?? { pv: 0, vis: new Set<string>() };
      e.pv++;
      e.vis.add(v.visitorId);
      byDay.set(v.day, e);
    }
    const timeseries: TimePoint[] = [...byDay.entries()]
      .map(([day, e]) => ({ day, pageviews: e.pv, visitors: e.vis.size }))
      .sort((a, b) => a.day.localeCompare(b.day));

    const byPath = new Map<string, { pv: number; vis: Set<string> }>();
    for (const v of rows) {
      const e = byPath.get(v.path) ?? { pv: 0, vis: new Set<string>() };
      e.pv++;
      e.vis.add(v.visitorId);
      byPath.set(v.path, e);
    }
    const topPages: PageStat[] = [...byPath.entries()]
      .map(([path, e]) => ({ path, pageviews: e.pv, visitors: e.vis.size }))
      .sort((a, b) => b.pageviews - a.pageviews || a.path.localeCompare(b.path))
      .slice(0, limit);

    const bySection = new Map<string, { pv: number; vis: Set<string> }>();
    for (const v of rows) {
      const sectionKey = `/${v.path.split("/")[1] ?? ""}`;
      const e = bySection.get(sectionKey) ?? { pv: 0, vis: new Set<string>() };
      e.pv++;
      e.vis.add(v.visitorId);
      bySection.set(sectionKey, e);
    }
    const sections: SectionStat[] = [...bySection.entries()]
      .map(([section, e]) => ({ section, pageviews: e.pv, visitors: e.vis.size }))
      .sort((a, b) => b.pageviews - a.pageviews || a.section.localeCompare(b.section))
      .slice(0, limit);

    const byCountry = new Map<string, { name: string; pv: number; vis: Set<string> }>();
    for (const v of rows) {
      const country = v.country ?? "??";
      const e = byCountry.get(country) ?? { name: v.countryName ?? "Okänt", pv: 0, vis: new Set<string>() };
      e.pv++;
      e.vis.add(v.visitorId);
      byCountry.set(country, e);
    }
    const topCountries: CountryStat[] = [...byCountry.entries()]
      .map(([country, e]) => ({ country, countryName: e.name, pageviews: e.pv, visitors: e.vis.size }))
      .sort((a, b) => b.pageviews - a.pageviews || a.country.localeCompare(b.country))
      .slice(0, limit);

    const byCampaign = new Map<string, { campaign: string; source: string | null; medium: string | null; pageviews: number }>();
    for (const v of rows) {
      if (!v.utmCampaign) continue;
      const key = JSON.stringify([v.utmCampaign, v.utmSource, v.utmMedium]);
      const e = byCampaign.get(key) ?? { campaign: v.utmCampaign, source: v.utmSource, medium: v.utmMedium, pageviews: 0 };
      e.pageviews++;
      byCampaign.set(key, e);
    }
    const topCampaigns = [...byCampaign.values()]
      .sort((a, b) => b.pageviews - a.pageviews || a.campaign.localeCompare(b.campaign))
      .slice(0, limit);

    return {
      range: { from: range.from, to: range.to, excludeBots: range.excludeBots },
      summary: {
        pageviews,
        visitors,
        days: dayset.size,
        avgPerDay: dayset.size > 0 ? Math.round(pageviews / dayset.size) : 0,
        botPageviews,
      },
      timeseries,
      sections,
      topPages,
      topCountries,
      topReferrers: this.rank(rows, (v) => v.referrerHost, true, limit).map((r) => ({ host: r.key, pageviews: r.pageviews })),
      topSources: this.rank(rows, (v) => v.source, false, limit).map((r) => ({ source: r.key, pageviews: r.pageviews })),
      topBrowsers: this.rank(rows, (v) => v.browser ?? "Okänd", false, limit).map((r) => ({ browser: r.key, pageviews: r.pageviews })),
      topOs: this.rank(rows, (v) => v.os ?? "Okänd", false, limit).map((r) => ({ os: r.key, pageviews: r.pageviews })),
      topDevices: this.rank(rows, (v) => v.device, false, limit).map((r) => ({ device: r.key, pageviews: r.pageviews })),
      topResolutions: this.rank(rows, (v) => (v.screenW && v.screenH ? `${v.screenW}x${v.screenH}` : null), true, limit).map((r) => ({ resolution: r.key, pageviews: r.pageviews })),
      topTimezones: this.rank(rows, (v) => v.timezone, true, limit).map((r) => ({ timezone: r.key, pageviews: r.pageviews })),
      topCampaigns,
    };
  }

  listVisits(opts: VisitQuery): { total: number; page: number; pageSize: number; rows: VisitRow[] } {
    let rows = this.visits.filter(
      (v) => v.day >= opts.from && v.day <= opts.to && this.matchesFilters(v, opts),
    );
    if (opts.excludeBots) rows = rows.filter((v) => !v.isBot);
    if (opts.q) {
      const q = opts.q.toLowerCase();
      rows = rows.filter(
        (v) =>
          v.ip.toLowerCase().includes(q) ||
          v.path.toLowerCase().includes(q) ||
          (v.uaRaw ?? "").toLowerCase().includes(q),
      );
    }
    rows = [...rows].sort((a, b) => b.ts - a.ts || b._i - a._i);

    const total = rows.length;
    const page = Math.max(1, opts.page);
    const pageSize = Math.max(1, opts.pageSize);
    const offset = (page - 1) * pageSize;

    return {
      total,
      page,
      pageSize,
      rows: rows.slice(offset, offset + pageSize).map((v) => ({
        ts: v.ts,
        ip: v.ip,
        visitorId: v.visitorId,
        path: v.path,
        country: v.country,
        countryName: v.countryName,
        browser: v.browser,
        os: v.os,
        device: v.device,
        referrerHost: v.referrerHost,
        source: v.source,
        isBot: v.isBot,
      })),
    };
  }
}
