import { marked } from "marked";

import { blogCatalogSchema, formatBlogIssues, parseBlogCatalog, type BlogCatalog } from "@/lib/blog/schema";
import { readBlogDataFromDisk, readBlogPostMarkdownFromDisk, listBlogPostSlugsFromDisk } from "@/lib/storage/disk-storage";

const DEFAULT_REVALIDATE_SECONDS = 300;
const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

marked.setOptions({ gfm: true });

export type BlogData = {
  catalog: BlogCatalog;
  renderedPosts: Map<string, string>;
};

type BlogCacheEntry = {
  data: BlogData;
  fetchedAt: number;
};

let blogCache: BlogCacheEntry | null = null;

const EMPTY_BLOG_DATA: BlogData = {
  catalog: { posts: [] },
  renderedPosts: new Map(),
};

function shouldUseApi() {
  // Use API if SITE_DATA_URL is not set (local mode) or if explicitly set to "api"
  const url = process.env.SITE_DATA_URL?.trim();
  return !url || url === "api";
}

function getBaseUrl() {
  const siteDataUrl =
    process.env.SITE_DATA_URL?.trim() ||
    "https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json";

  return siteDataUrl.replace(/site-data\.json$/, "");
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
    console[level](`[expertbyran:blog] ${message}`, metadata);
    return;
  }

  console[level](`[expertbyran:blog] ${message}`);
}

async function fetchBlogDataFromApi(): Promise<BlogData> {
  const catalog = await readBlogDataFromDisk();

  const markdownEntries = await Promise.all(
    catalog.posts.map(async (post) => {
      const markdown = await readBlogPostMarkdownFromDisk(post.slug);
      const html = await marked.parse(markdown);
      return [post.slug, html] as const;
    }),
  );

  return {
    catalog,
    renderedPosts: new Map(markdownEntries),
  };
}

async function fetchCatalog(baseUrl: string, bypassCdn = false): Promise<BlogCatalog> {
  const rawUrl = `${baseUrl}blog-data.json`;
  // Istället för att använda GitHub API (som kan blockeras), lägg till cache-busting parameter
  const url = bypassCdn ? `${rawUrl}?t=${Date.now()}` : rawUrl;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "expertbyran-web/0.1",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(getFetchTimeoutMs()),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog-data (${response.status} ${response.statusText})`);
  }

  const raw = await response.json();
  const result = blogCatalogSchema.safeParse(raw);

  if (!result.success) {
    const issues = formatBlogIssues(result.error.issues);
    log("error", `Invalid blog-data from ${url}`, issues);
    throw new Error(`Invalid blog-data from ${url}`);
  }

  return result.data;
}

async function fetchPostMarkdown(baseUrl: string, slug: string, bypassCdn = false): Promise<string> {
  const rawUrl = `${baseUrl}blog/posts/${slug}.md`;
  // Istället för att använda GitHub API (som kan blockeras), lägg till cache-busting parameter
  const url = bypassCdn ? `${rawUrl}?t=${Date.now()}` : rawUrl;
  const response = await fetch(url, {
    headers: {
      "user-agent": "expertbyran-web/0.1",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(getFetchTimeoutMs()),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blog post ${slug} (${response.status} ${response.statusText})`);
  }

  return response.text();
}

async function fetchAllBlogData(bypassCdn = false): Promise<BlogData> {
  const baseUrl = getBaseUrl();
  const catalog = await fetchCatalog(baseUrl, bypassCdn);

  const markdownEntries = await Promise.all(
    catalog.posts.map(async (post) => {
      const markdown = await fetchPostMarkdown(baseUrl, post.slug, bypassCdn);
      const html = await marked.parse(markdown);
      return [post.slug, html] as const;
    }),
  );

  return {
    catalog,
    renderedPosts: new Map(markdownEntries),
  };
}

export async function getBlogData(options?: { fresh?: boolean }): Promise<BlogData> {
  const now = Date.now();
  const revalidateMs = getRevalidateSeconds() * 1_000;

  if (!options?.fresh && blogCache && now - blogCache.fetchedAt < revalidateMs) {
    return blogCache.data;
  }

  try {
    let data: BlogData;

    if (shouldUseApi()) {
      data = await fetchBlogDataFromApi();
    } else {
      data = await fetchAllBlogData(options?.fresh);
    }

    blogCache = {
      data,
      fetchedAt: now,
    };

    return data;
  } catch (error) {
    if (blogCache) {
      log("warn", "Falling back to cached blog-data after fetch failure", {
        error: error instanceof Error ? error.message : String(error),
      });

      return blogCache.data;
    }

    // Om HTTP-hämtning misslyckades, försök läsa från disk som sista utväg
    if (!shouldUseApi()) {
      try {
        const diskData = await fetchBlogDataFromApi();
        log("warn", "URL fetch failed, resolved blog-data from disk instead", {
          error: error instanceof Error ? error.message : String(error),
        });
        blogCache = { data: diskData, fetchedAt: now };
        return diskData;
      } catch {
        // Disk fallback also failed — fall through to empty data
      }
    }

    log("warn", "No blog-data available, returning empty catalog", {
      error: error instanceof Error ? error.message : String(error),
    });

    return EMPTY_BLOG_DATA;
  }
}

export function resetBlogCache() {
  blogCache = null;
}
