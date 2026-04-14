import { marked } from "marked";

import { blogCatalogSchema, formatBlogIssues, type BlogCatalog } from "@/lib/blog/schema";
import { toGitHubApiUrl } from "@/lib/github";

const DEFAULT_SITE_DATA_URL =
  "https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json";
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

function getSiteDataUrl() {
  return process.env.SITE_DATA_URL?.trim() || DEFAULT_SITE_DATA_URL;
}

function buildContentUrl(relativePath: string) {
  const siteDataUrl = getSiteDataUrl();

  try {
    const baseUrl = new URL(siteDataUrl);
    const targetUrl = new URL(relativePath, baseUrl);

    if (baseUrl.search) {
      targetUrl.search = baseUrl.search;
    }

    targetUrl.hash = "";

    return targetUrl.toString();
  } catch {
    return siteDataUrl.replace(/site-data\.json(\?.*)?$/, (_, query = "") => `${relativePath}${query}`);
  }
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

async function fetchCatalog(url: string, bypassCdn = false): Promise<BlogCatalog> {
  const fetchUrl = bypassCdn ? toGitHubApiUrl(url) ?? url : url;
  const response = await fetch(fetchUrl, {
    headers: {
      accept: bypassCdn ? "application/vnd.github.raw+json" : "application/json",
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

async function fetchPostMarkdown(url: string, bypassCdn = false): Promise<string> {
  const fetchUrl = bypassCdn ? toGitHubApiUrl(url) ?? url : url;
  const response = await fetch(fetchUrl, {
    headers: {
      ...(bypassCdn && { accept: "application/vnd.github.raw+json" }),
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
  const catalogUrl = buildContentUrl("blog-data.json");
  const catalog = await fetchCatalog(catalogUrl, bypassCdn);

  const markdownEntries = await Promise.all(
    catalog.posts.map(async (post) => {
      const markdownUrl = buildContentUrl(`blog/posts/${post.slug}.md`);
      const markdown = await fetchPostMarkdown(markdownUrl, bypassCdn);
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
    const data = await fetchAllBlogData(options?.fresh);

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

    log("warn", "No blog-data available, returning empty catalog", {
      error: error instanceof Error ? error.message : String(error),
    });

    return EMPTY_BLOG_DATA;
  }
}

export function resetBlogCache() {
  blogCache = null;
}
