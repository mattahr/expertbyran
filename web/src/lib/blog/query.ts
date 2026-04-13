import type { Expert, ExpertArea } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { BlogPostEntry } from "@/lib/blog/schema";
import { getBlogData } from "@/lib/blog/store";

export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type BlogPostSummary = BlogPostEntry & {
  author: Expert;
  areas: ExpertArea[];
};

export type BlogPostFull = BlogPostSummary & {
  contentHtml: string;
};

function resolveAuthor(experts: Expert[], authorSlug: string): Expert | undefined {
  return experts.find((expert) => expert.slug === authorSlug);
}

function resolveAreas(allAreas: ExpertArea[], areaSlugs: string[]): ExpertArea[] {
  const areaMap = new Map(allAreas.map((area) => [area.slug, area]));
  return areaSlugs.map((slug) => areaMap.get(slug)).filter((area): area is ExpertArea => Boolean(area));
}

export async function getOrderedBlogPosts(): Promise<BlogPostSummary[]> {
  const [blogData, siteData] = await Promise.all([getBlogData(), getSiteData()]);

  return blogData.catalog.posts
    .map((post) => {
      const author = resolveAuthor(siteData.experts, post.authorSlug);
      if (!author) return null;

      const areas = resolveAreas(siteData.expertAreas, post.areaSlugs);

      return { ...post, author, areas };
    })
    .filter((post): post is BlogPostSummary => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getBlogPost(slug: string): Promise<BlogPostFull | null> {
  const [blogData, siteData] = await Promise.all([getBlogData(), getSiteData()]);

  const entry = blogData.catalog.posts.find((post) => post.slug === slug);
  if (!entry) return null;

  const author = resolveAuthor(siteData.experts, entry.authorSlug);
  if (!author) return null;

  const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
  const contentHtml = blogData.renderedPosts.get(slug);
  if (!contentHtml) return null;

  return { ...entry, author, areas, contentHtml };
}
