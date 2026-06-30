// web/src/lib/stores/sqlite-analytics-store.ts
//
// SQLite-implementation av AnalyticsStore. All aggregering sker i SQL.
// Kolumnnamn som interpoleras i frågor är fasta interna konstanter (aldrig
// användarinput) — filtervärden binds alltid som parametrar.
import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db/client";
import type {
  AnalyticsStore,
  BrowserStat,
  CampaignStat,
  CountryStat,
  DeviceStat,
  HostStat,
  OsStat,
  OverviewResult,
  PageStat,
  ResolutionStat,
  SectionStat,
  SourceStat,
  StatsFilters,
  StatsRange,
  TimePoint,
  TimezoneStat,
  VisitInsert,
  VisitQuery,
  VisitRow,
} from "./types";

const DEFAULT_LIMIT = 15;

// Första sökvägssegmentet, t.ex. "/blogg/foo" → "/blogg", "/" → "/".
const SECTION_EXPR =
  "substr(path, 1, CASE WHEN instr(substr(path, 2), '/') > 0 THEN instr(substr(path, 2), '/') ELSE length(path) END)";

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

const INSERT_SQL = `
  INSERT INTO visits (
    ts, day, hour, path, referrer_full, referrer_host, source,
    utm_source, utm_medium, utm_campaign, country, country_name, ip, visitor_id,
    ua_raw, browser, browser_version, os, os_version, device, device_brand,
    device_model, is_bot, lang, languages, timezone,
    screen_w, screen_h, viewport_w, viewport_h, dpr
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  )
`;

export class SqliteAnalyticsStore implements AnalyticsStore {
  constructor(private readonly dbInstance?: DatabaseSync) {}

  private get db(): DatabaseSync {
    return this.dbInstance ?? getDb();
  }

  record(v: VisitInsert): void {
    this.db
      .prepare(INSERT_SQL)
      .run(
        v.ts,
        v.day,
        v.hour,
        v.path,
        v.referrerFull,
        v.referrerHost,
        v.source,
        v.utmSource,
        v.utmMedium,
        v.utmCampaign,
        v.country,
        v.countryName,
        v.ip,
        v.visitorId,
        v.uaRaw,
        v.browser,
        v.browserVersion,
        v.os,
        v.osVersion,
        v.device,
        v.deviceBrand,
        v.deviceModel,
        v.isBot ? 1 : 0,
        v.lang,
        v.languages,
        v.timezone,
        v.screenW,
        v.screenH,
        v.viewportW,
        v.viewportH,
        v.dpr,
      );
  }

  earliestDay(): string | null {
    const row = this.db.prepare("SELECT MIN(day) AS d FROM visits").get() as { d: string | null };
    return row.d ?? null;
  }

  /** Dag-intervall + drill-down-filter (utan is_bot). Bind alltid som parametrar. */
  private filterClauses(
    opts: StatsFilters & { from: string; to: string },
  ): { clauses: string[]; params: (string | number)[] } {
    const clauses = ["day >= ?", "day <= ?"];
    const params: (string | number)[] = [opts.from, opts.to];
    if (opts.path) {
      clauses.push("path = ?");
      params.push(opts.path);
    }
    if (opts.pathPrefix) {
      clauses.push("(path = ? OR path LIKE ? ESCAPE '\\')");
      params.push(opts.pathPrefix, `${escapeLike(opts.pathPrefix)}/%`);
    }
    // COALESCE matchar samma visningsvärden som topplistorna (Okänt/Okänd/??).
    if (opts.country) {
      clauses.push("COALESCE(country, '??') = ?");
      params.push(opts.country);
    }
    if (opts.browser) {
      clauses.push("COALESCE(browser, 'Okänd') = ?");
      params.push(opts.browser);
    }
    if (opts.os) {
      clauses.push("COALESCE(os, 'Okänd') = ?");
      params.push(opts.os);
    }
    if (opts.device) {
      clauses.push("device = ?");
      params.push(opts.device);
    }
    if (opts.source) {
      clauses.push("source = ?");
      params.push(opts.source);
    }
    if (opts.visitorId) {
      clauses.push("visitor_id = ?");
      params.push(opts.visitorId);
    }
    return { clauses, params };
  }

  /** Bygger basvillkoret för en range + bot-exkludering. */
  private rangeWhere(range: StatsRange): { sql: string; params: (string | number)[] } {
    const { clauses, params } = this.filterClauses(range);
    if (range.excludeBots) clauses.push("is_bot = 0");
    return { sql: clauses.join(" AND "), params };
  }

  /** Generisk topplista på en fast kolumn; `keyExpr` är en intern konstant. */
  private rankBy(keyExpr: string, range: StatsRange, filterNotNull: boolean): { key: string; pageviews: number }[] {
    const where = this.rangeWhere(range);
    const extra = filterNotNull ? ` AND (${keyExpr}) IS NOT NULL AND (${keyExpr}) <> ''` : "";
    const rows = this.db
      .prepare(
        `SELECT (${keyExpr}) AS key, COUNT(*) AS pageviews
         FROM visits
         WHERE ${where.sql}${extra}
         GROUP BY key
         ORDER BY pageviews DESC, key ASC
         LIMIT ?`,
      )
      .all(...where.params, range.limit ?? DEFAULT_LIMIT) as { key: string; pageviews: number }[];
    return rows;
  }

  overview(range: StatsRange): OverviewResult {
    const where = this.rangeWhere(range);
    const limit = range.limit ?? DEFAULT_LIMIT;

    const summary = this.db
      .prepare(
        `SELECT COUNT(*) AS pageviews,
                COUNT(DISTINCT visitor_id) AS visitors,
                COUNT(DISTINCT day) AS days
         FROM visits WHERE ${where.sql}`,
      )
      .get(...where.params) as { pageviews: number; visitors: number; days: number };

    // Bot-räkningen respekterar drill-down-filtren men ignorerar excludeBots.
    const botFilter = this.filterClauses(range);
    botFilter.clauses.push("is_bot = 1");
    const botPageviews = (
      this.db
        .prepare(`SELECT COUNT(*) AS n FROM visits WHERE ${botFilter.clauses.join(" AND ")}`)
        .get(...botFilter.params) as { n: number }
    ).n;

    const timeseries = this.db
      .prepare(
        `SELECT day, COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors
         FROM visits WHERE ${where.sql}
         GROUP BY day ORDER BY day ASC`,
      )
      .all(...where.params) as TimePoint[];

    const sections = this.db
      .prepare(
        `SELECT ${SECTION_EXPR} AS section, COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors
         FROM visits WHERE ${where.sql}
         GROUP BY section ORDER BY pageviews DESC, section ASC LIMIT ?`,
      )
      .all(...where.params, limit) as SectionStat[];

    const topPages = this.db
      .prepare(
        `SELECT path, COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors
         FROM visits WHERE ${where.sql}
         GROUP BY path ORDER BY pageviews DESC, path ASC LIMIT ?`,
      )
      .all(...where.params, limit) as PageStat[];

    const topCountries = this.db
      .prepare(
        `SELECT COALESCE(country, '??') AS country,
                COALESCE(country_name, 'Okänt') AS countryName,
                COUNT(*) AS pageviews, COUNT(DISTINCT visitor_id) AS visitors
         FROM visits WHERE ${where.sql}
         GROUP BY country ORDER BY pageviews DESC, country ASC LIMIT ?`,
      )
      .all(...where.params, limit) as CountryStat[];

    const topCampaigns = this.db
      .prepare(
        `SELECT utm_campaign AS campaign, utm_source AS source, utm_medium AS medium,
                COUNT(*) AS pageviews
         FROM visits
         WHERE ${where.sql} AND utm_campaign IS NOT NULL AND utm_campaign <> ''
         GROUP BY utm_campaign, utm_source, utm_medium
         ORDER BY pageviews DESC, campaign ASC LIMIT ?`,
      )
      .all(...where.params, limit) as CampaignStat[];

    const toHost = (r: { key: string; pageviews: number }): HostStat => ({ host: r.key, pageviews: r.pageviews });

    return {
      range: { from: range.from, to: range.to, excludeBots: range.excludeBots },
      summary: {
        pageviews: summary.pageviews,
        visitors: summary.visitors,
        days: summary.days,
        avgPerDay: summary.days > 0 ? Math.round(summary.pageviews / summary.days) : 0,
        botPageviews,
      },
      timeseries,
      sections,
      topPages,
      topCountries,
      topReferrers: this.rankBy("referrer_host", range, true).map(toHost),
      topSources: this.rankBy("source", range, false).map((r) => ({ source: r.key, pageviews: r.pageviews }) as SourceStat),
      topBrowsers: this.rankBy("COALESCE(browser, 'Okänd')", range, false).map(
        (r) => ({ browser: r.key, pageviews: r.pageviews }) as BrowserStat,
      ),
      topOs: this.rankBy("COALESCE(os, 'Okänd')", range, false).map((r) => ({ os: r.key, pageviews: r.pageviews }) as OsStat),
      topDevices: this.rankBy("device", range, false).map((r) => ({ device: r.key, pageviews: r.pageviews }) as DeviceStat),
      topResolutions: this.rankBy("screen_w || 'x' || screen_h", range, true).map(
        (r) => ({ resolution: r.key, pageviews: r.pageviews }) as ResolutionStat,
      ),
      topTimezones: this.rankBy("timezone", range, true).map((r) => ({ timezone: r.key, pageviews: r.pageviews }) as TimezoneStat),
      topCampaigns,
    };
  }

  listVisits(opts: VisitQuery): { total: number; page: number; pageSize: number; rows: VisitRow[] } {
    const { clauses, params } = this.filterClauses(opts);
    if (opts.excludeBots) clauses.push("is_bot = 0");
    if (opts.q) {
      // Escapa LIKE-metatecken (% _ \) så att admins sökterm matchas literalt
      // i stället för som wildcard.
      clauses.push(
        "(ip LIKE ? ESCAPE '\\' OR path LIKE ? ESCAPE '\\' OR ua_raw LIKE ? ESCAPE '\\')",
      );
      const like = `%${escapeLike(opts.q)}%`;
      params.push(like, like, like);
    }
    const where = clauses.join(" AND ");

    const total = (this.db.prepare(`SELECT COUNT(*) AS n FROM visits WHERE ${where}`).get(...params) as { n: number }).n;

    const page = Math.max(1, opts.page);
    const pageSize = Math.max(1, opts.pageSize);
    const offset = (page - 1) * pageSize;

    const rows = this.db
      .prepare(
        `SELECT ts, ip, visitor_id AS visitorId, path, country, country_name AS countryName, browser, os, device,
                referrer_host AS referrerHost, source, is_bot AS isBot
         FROM visits WHERE ${where}
         ORDER BY ts DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .all(...params, pageSize, offset) as (Omit<VisitRow, "isBot"> & { isBot: number })[];

    return {
      total,
      page,
      pageSize,
      rows: rows.map((r) => ({ ...r, isBot: r.isBot === 1 })),
    };
  }
}
