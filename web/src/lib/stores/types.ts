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

// ── Besöksstatistik ────────────────────────────────────────────────────────

/** En berikad besöksrad redo att skrivas. Servern härleder alla känsliga fält. */
export interface VisitInsert {
  ts: number;
  day: string;
  hour: number;
  path: string;
  referrerFull: string | null;
  referrerHost: string | null;
  source: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  country: string | null;
  countryName: string | null;
  ip: string;
  visitorId: string;
  uaRaw: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: string;
  deviceBrand: string | null;
  deviceModel: string | null;
  isBot: boolean;
  lang: string | null;
  languages: string | null;
  timezone: string | null;
  screenW: number | null;
  screenH: number | null;
  viewportW: number | null;
  viewportH: number | null;
  dpr: number | null;
}

/** Drill-down-filter som kan tillämpas på både översikt och besökslista. */
export interface StatsFilters {
  path?: string;
  /** Sektion (första sökvägssegmentet, t.ex. "/blogg") — matchar prefixet + undersidor. */
  pathPrefix?: string;
  country?: string;
  browser?: string;
  os?: string;
  device?: string;
  source?: string;
  visitorId?: string;
}

export interface StatsRange extends StatsFilters {
  from: string;
  to: string;
  excludeBots: boolean;
  /** Topplistornas längd (default 15). */
  limit?: number;
}

export interface OverviewSummary {
  pageviews: number;
  visitors: number;
  days: number;
  avgPerDay: number;
  botPageviews: number;
}
// Dessa fyra läses direkt ur SQL-resultat (`.all() as X[]`). De är `type`-alias
// (inte interface) så att de får en implicit index-signatur och därmed är
// kompatibla med node:sqlites Record<string, SQLOutputValue>-radtyp.
export type TimePoint = {
  day: string;
  pageviews: number;
  visitors: number;
};
export type PageStat = {
  path: string;
  pageviews: number;
  visitors: number;
};
export type CountryStat = {
  country: string;
  countryName: string;
  pageviews: number;
  visitors: number;
};
export interface HostStat {
  host: string;
  pageviews: number;
}
export interface SourceStat {
  source: string;
  pageviews: number;
}
export interface BrowserStat {
  browser: string;
  pageviews: number;
}
export interface OsStat {
  os: string;
  pageviews: number;
}
export interface DeviceStat {
  device: string;
  pageviews: number;
}
export interface ResolutionStat {
  resolution: string;
  pageviews: number;
}
export interface TimezoneStat {
  timezone: string;
  pageviews: number;
}
export type CampaignStat = {
  campaign: string;
  source: string | null;
  medium: string | null;
  pageviews: number;
};
// Sektion = första sökvägssegmentet ("/blogg", "/foresight", "/radar", "/" …).
export type SectionStat = {
  section: string;
  pageviews: number;
  visitors: number;
};
// Presentationsnamn (alias) för en cookielös visitor_id.
export type VisitorLabel = {
  visitorId: string;
  label: string;
};
export type NamedVisitorStat = {
  visitorId: string;
  label: string;
  pageviews: number;
  lastTs: number;
};

export interface OverviewResult {
  range: { from: string; to: string; excludeBots: boolean };
  summary: OverviewSummary;
  timeseries: TimePoint[];
  sections: SectionStat[];
  namedVisitors: NamedVisitorStat[];
  topPages: PageStat[];
  topCountries: CountryStat[];
  topReferrers: HostStat[];
  topSources: SourceStat[];
  topBrowsers: BrowserStat[];
  topOs: OsStat[];
  topDevices: DeviceStat[];
  topResolutions: ResolutionStat[];
  topTimezones: TimezoneStat[];
  topCampaigns: CampaignStat[];
}

export interface VisitQuery extends StatsFilters {
  from: string;
  to: string;
  page: number;
  pageSize: number;
  excludeBots: boolean;
  q?: string;
}
export interface VisitRow {
  ts: number;
  ip: string;
  visitorId: string;
  visitorLabel: string | null;
  path: string;
  country: string | null;
  countryName: string | null;
  browser: string | null;
  os: string | null;
  device: string;
  referrerHost: string | null;
  source: string;
  isBot: boolean;
}

export interface AnalyticsStore {
  /** Skriver en besöksrad (synkront). */
  record(visit: VisitInsert): void;
  /** All aggregering för dashboarden i ett anrop. */
  overview(opts: StatsRange): OverviewResult;
  /** Paginerad, filtrerbar rålista (nyast först). */
  listVisits(opts: VisitQuery): { total: number; page: number; pageSize: number; rows: VisitRow[] };
  /** Minsta `day` i datat (för "Allt"-intervallet), eller null om tomt. */
  earliestDay(): string | null;

  /** Presentationsnamn (alias) för besökare — bara för admin-visning. */
  setVisitorLabel(visitorId: string, label: string): void;
  deleteVisitorLabel(visitorId: string): void;
  listVisitorLabels(): VisitorLabel[];
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
