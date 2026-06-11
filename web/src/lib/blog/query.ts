import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { BlogCatalog, BlogPostEntry } from "@/lib/blog/schema";
import { getBlogCatalog, getRenderedPost } from "@/lib/blog/store";

export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type ResolvedAuthor = {
  name: string;
  role?: string;
  // Satt när författaren matchar en expert — används för länk till expertsidan.
  expertSlug?: string;
};

export type BlogPostSummary = BlogPostEntry & {
  author: ResolvedAuthor;
  areas: ExpertArea[];
};

export type BlogPostFull = BlogPostSummary & {
  contentHtml: string;
};

export type BlogArchive = {
  posts: BlogPostSummary[];
  areas: ExpertArea[];
};

function resolveAuthor(experts: Expert[], entry: BlogPostEntry): ResolvedAuthor | null {
  const expert = entry.authorSlug
    ? experts.find((candidate) => candidate.slug === entry.authorSlug)
    : undefined;

  if (expert) {
    return {
      name: entry.authorName ?? expert.name,
      role: entry.authorRole ?? expert.role,
      expertSlug: expert.slug,
    };
  }

  if (entry.authorName) {
    return {
      name: entry.authorName,
      role: entry.authorRole,
    };
  }

  return null;
}

function resolveAreas(allAreas: ExpertArea[], areaSlugs: string[]): ExpertArea[] {
  const areaMap = new Map(allAreas.map((area) => [area.slug, area]));
  return areaSlugs.map((slug) => areaMap.get(slug)).filter((area): area is ExpertArea => Boolean(area));
}

function byAreaOrder(areas: ExpertArea[]) {
  return [...areas].sort((left, right) => {
    if (left.sortOrder === right.sortOrder) {
      return left.name.localeCompare(right.name, "sv");
    }

    return left.sortOrder - right.sortOrder;
  });
}

function resolveBlogPosts(catalog: BlogCatalog, siteData: SiteData): BlogPostSummary[] {
  return catalog.posts
    .map((post) => {
      const author = resolveAuthor(siteData.experts, post);
      if (!author) {
        console.warn(
          `[expertbyran:blog] Hoppar över inlägg '${post.slug}' — saknar visningsnamn (authorSlug='${post.authorSlug ?? ""}' matchar ingen expert och authorName saknas).`,
        );
        return null;
      }

      const areas = resolveAreas(siteData.expertAreas, post.areaSlugs);

      return { ...post, author, areas };
    })
    .filter((post): post is BlogPostSummary => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function resolveUsedAreas(allAreas: ExpertArea[], posts: BlogPostSummary[]): ExpertArea[] {
  const usedAreaSlugs = new Set(posts.flatMap((post) => post.areas.map((area) => area.slug)));

  return byAreaOrder(allAreas.filter((area) => usedAreaSlugs.has(area.slug)));
}

export async function getBlogArchive(): Promise<BlogArchive> {
  const [catalog, siteData] = await Promise.all([getBlogCatalog(), getSiteData()]);
  const posts = resolveBlogPosts(catalog, siteData);

  return {
    posts,
    areas: resolveUsedAreas(siteData.expertAreas, posts),
  };
}

export async function getOrderedBlogPosts(): Promise<BlogPostSummary[]> {
  const archive = await getBlogArchive();
  return archive.posts;
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  const [catalog, siteData, contentHtml] = await Promise.all([
    getBlogCatalog(),
    getSiteData(),
    getRenderedPost(slug),
  ]);

  const entry = catalog.posts.find((post) => post.slug === slug);
  if (!entry) return null;

  const author = resolveAuthor(siteData.experts, entry);
  if (!author) return null;

  if (!contentHtml) return null;

  const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);

  return { ...entry, author, areas, contentHtml };
}
