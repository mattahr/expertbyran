// web/src/lib/admin/stats-params.ts
//
// Tolkar query-parametrar till StatsRange/VisitQuery. Datum i Europe/Stockholm.
import type { StatsFilters, StatsRange, VisitQuery } from "@/lib/stores/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TOP_LIMIT = 15;
const DEFAULT_DAYS = 30;
const MAX_PAGE_SIZE = 200;

function todayStockholm(now: number): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Skiftar ett YYYY-MM-DD-datum `delta` dagar (UTC-aritmetik, tidszonsfritt). */
function shiftDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** Plockar valfria drill-down-filter ur query-strängen. */
export function parseFilters(params: URLSearchParams): StatsFilters {
  const get = (key: string) => params.get(key) || undefined;
  return {
    path: get("path"),
    pathPrefix: get("pathPrefix"),
    country: get("country"),
    browser: get("browser"),
    os: get("os"),
    device: get("device"),
    source: get("source"),
    visitorId: get("visitorId"),
  };
}

export function parseStatsRange(
  params: URLSearchParams,
  now: number,
  earliest: string | null,
): StatsRange {
  const today = todayStockholm(now);
  const toParam = params.get("to");
  const to = toParam && DATE_RE.test(toParam) ? toParam : today;

  let from: string;
  if (params.get("range") === "all") {
    from = earliest ?? shiftDays(today, -(DEFAULT_DAYS - 1));
  } else {
    const fromParam = params.get("from");
    from = fromParam && DATE_RE.test(fromParam) ? fromParam : shiftDays(today, -(DEFAULT_DAYS - 1));
  }
  // Säkerställ from <= to.
  if (from > to) from = to;

  const excludeBots = params.get("excludeBots") !== "false";
  return { from, to, excludeBots, limit: TOP_LIMIT, ...parseFilters(params) };
}

export function parseVisitQuery(
  params: URLSearchParams,
  now: number,
  earliest: string | null,
): VisitQuery {
  const range = parseStatsRange(params, now, earliest);
  // parseInt först, NaN-fallback skilt från klampningen så att explicit 0 → 1
  // (inte default) och stora värden klampas till taket.
  const parsedPage = Number.parseInt(params.get("page") ?? "", 10);
  const page = Math.max(1, Number.isNaN(parsedPage) ? 1 : parsedPage);
  const parsedSize = Number.parseInt(params.get("pageSize") ?? "", 10);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isNaN(parsedSize) ? 50 : parsedSize));

  return {
    from: range.from,
    to: range.to,
    excludeBots: range.excludeBots,
    page,
    pageSize,
    q: params.get("q") || undefined,
    ...parseFilters(params),
  };
}
