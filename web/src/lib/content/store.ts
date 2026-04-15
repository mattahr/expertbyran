import { formatIssues, siteDataSchema, parseSiteData, type SiteData } from "@/lib/content/schema";
import { readSiteDataFromDisk } from "@/lib/storage/disk-storage";

const DEFAULT_SITE_DATA_URL =
  "https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json";
const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

type SiteDataCacheEntry = {
  data: SiteData;
  fetchedAt: number;
  source: string;
};

let siteDataCache: SiteDataCacheEntry | null = null;

function getSiteDataUrl() {
  const value = process.env.SITE_DATA_URL?.trim();
  return value || DEFAULT_SITE_DATA_URL;
}

function shouldUseApi() {
  // Use API if SITE_DATA_URL is not set (local mode) or if explicitly set to "api"
  const url = process.env.SITE_DATA_URL?.trim();
  return !url || url === "api";
}

function getRevalidateSeconds() {
  const value = Number.parseInt(
    process.env.SITE_DATA_REVALIDATE_SECONDS ?? `${DEFAULT_REVALIDATE_SECONDS}`,
    10,
  );

  if (!Number.isFinite(value) || value < 0) {
    return DEFAULT_REVALIDATE_SECONDS;
  }

  return value;
}

function getFetchTimeoutMs() {
  const value = Number.parseInt(
    process.env.SITE_DATA_FETCH_TIMEOUT_MS ?? `${DEFAULT_FETCH_TIMEOUT_MS}`,
    10,
  );

  if (!Number.isFinite(value) || value < 1_000) {
    return DEFAULT_FETCH_TIMEOUT_MS;
  }

  return value;
}

function log(level: "warn" | "error", message: string, metadata?: unknown) {
  if (metadata) {
    console[level](`[expertbyran] ${message}`, metadata);
    return;
  }

  console[level](`[expertbyran] ${message}`);
}

async function readSiteDataFromApi(): Promise<SiteData> {
  return readSiteDataFromDisk();
}

async function readSiteDataFromUrl(url: string, bypassCdn = false) {
  // Istället för att använda GitHub API (som kan blockeras), lägg till cache-busting parameter
  const fetchUrl = bypassCdn ? `${url}?t=${Date.now()}` : url;
  const response = await fetch(fetchUrl, {
    headers: {
      accept: "application/json",
      "user-agent": "expertbyran-web/0.1",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(getFetchTimeoutMs()),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch site-data (${response.status} ${response.statusText})`);
  }

  return parseSiteData(await response.json(), url);
}

export async function getSiteData(options?: { fresh?: boolean }) {
  const now = Date.now();
  const revalidateMs = getRevalidateSeconds() * 1_000;

  if (!options?.fresh && siteDataCache && now - siteDataCache.fetchedAt < revalidateMs) {
    return siteDataCache.data;
  }

  try {
    let data: SiteData;
    let source: string;

    if (shouldUseApi()) {
      data = await readSiteDataFromApi();
      source = "disk-storage";
    } else {
      const siteDataUrl = getSiteDataUrl();
      data = await readSiteDataFromUrl(siteDataUrl, options?.fresh);
      source = siteDataUrl;
    }

    siteDataCache = {
      data,
      fetchedAt: now,
      source,
    };

    return data;
  } catch (error) {
    if (siteDataCache) {
      log("warn", "Falling back to cached site-data after fetch failure", {
        source: siteDataCache.source,
        error: error instanceof Error ? error.message : String(error),
      });

      return siteDataCache.data;
    }

    throw error;
  }
}

export function resetSiteDataCache() {
  siteDataCache = null;
}
