import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { BlogPostEntry } from "@/lib/blog/schema";
import {
  getBlogCatalog,
  getBlogPage,
  getStoredBlogPost,
  getUsedBlogAreaSlugs,
} from "@/lib/blog/store";

export const BLOG_PAGE_SIZE = 24;

// Modulnivå-formatterare: Intl.DateTimeFormat är dyr att skapa per anrop.
const blogDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatBlogDate(isoDate: string): string {
  return blogDateFormatter.format(new Date(isoDate));
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

export type BlogArchivePage = {
  posts: BlogPostSummary[];
  // Områden som används av minst ett inlägg (oavsett aktuell sida/filter).
  areas: ExpertArea[];
  // Begärda filterområden normaliserade mot tillgängliga (okända släpps).
  selectedAreaSlugs: string[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
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

// Bevarar storens ordning (nyast först); inlägg utan upplösbart visningsnamn filtreras bort.
function resolveBlogPosts(posts: BlogPostEntry[], siteData: SiteData): BlogPostSummary[] {
  return posts
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
    .filter((post): post is BlogPostSummary => post !== null);
}

function resolveUsedAreas(allAreas: ExpertArea[], usedSlugs: Iterable<string>): ExpertArea[] {
  const used = new Set(usedSlugs);
  return byAreaOrder(allAreas.filter((area) => used.has(area.slug)));
}

/** Hela arkivet (metadata) — används av related-poolen, inte av listsidorna. */
export async function getBlogArchive(): Promise<BlogArchive> {
  const [catalog, siteData] = await Promise.all([getBlogCatalog(), getSiteData()]);
  const posts = resolveBlogPosts(catalog.posts, siteData);

  return {
    posts,
    areas: resolveUsedAreas(
      siteData.expertAreas,
      posts.flatMap((post) => post.areas.map((area) => area.slug)),
    ),
  };
}

/** En sida av arkivet, nyast först, med totalantal och filterpiller-områden. */
export async function getBlogArchivePage(
  page: number,
  requestedAreaSlugs: string[] = [],
): Promise<BlogArchivePage> {
  const pageSize = BLOG_PAGE_SIZE;
  const safePage = Math.max(1, Math.floor(page) || 1);
  const [usedSlugs, siteData] = await Promise.all([getUsedBlogAreaSlugs(), getSiteData()]);

  const areas = resolveUsedAreas(siteData.expertAreas, usedSlugs);
  const available = new Set(areas.map((area) => area.slug));
  const selectedAreaSlugs = [...new Set(requestedAreaSlugs)].filter((slug) =>
    available.has(slug),
  );

  const { posts, total } = await getBlogPage(
    (safePage - 1) * pageSize,
    pageSize,
    selectedAreaSlugs,
  );

  return {
    posts: resolveBlogPosts(posts, siteData),
    areas,
    selectedAreaSlugs,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page: safePage,
    pageSize,
  };
}

export async function getOrderedBlogPosts(): Promise<BlogPostSummary[]> {
  const archive = await getBlogArchive();
  return archive.posts;
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  const [stored, siteData] = await Promise.all([getStoredBlogPost(slug), getSiteData()]);
  if (!stored) return null;

  const author = resolveAuthor(siteData.experts, stored.meta);
  if (!author) return null;

  const areas = resolveAreas(siteData.expertAreas, stored.meta.areaSlugs);

  return { ...stored.meta, author, areas, contentHtml: stored.html };
}
