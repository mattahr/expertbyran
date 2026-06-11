// web/src/lib/blog/store.ts
import { unstable_cache } from "next/cache";

import type { BlogCatalog, BlogPostEntry } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";
import type { StoredPost } from "@/lib/stores/types";

export const BLOG_TAGS = ["blog"] as const;

const loadBlogCatalog = unstable_cache(
  async (): Promise<BlogCatalog> => {
    const posts = await getBlogStore().listPosts();
    return { posts };
  },
  ["blog-catalog"],
  { tags: [...BLOG_TAGS] },
);

const loadBlogPage = unstable_cache(
  async (
    offset: number,
    limit: number,
    areaKey: string,
  ): Promise<{ posts: BlogPostEntry[]; total: number }> => {
    return getBlogStore().listPostsPage({
      offset,
      limit,
      areaSlugs: areaKey ? areaKey.split(",") : undefined,
    });
  },
  ["blog-page"],
  { tags: [...BLOG_TAGS] },
);

const loadUsedAreaSlugs = unstable_cache(
  async (): Promise<string[]> => getBlogStore().listUsedAreaSlugs(),
  ["blog-used-areas"],
  { tags: [...BLOG_TAGS] },
);

const loadStoredPost = unstable_cache(
  async (slug: string): Promise<StoredPost<BlogPostEntry> | null> =>
    getBlogStore().getPost(slug),
  ["blog-stored-post"],
  { tags: [...BLOG_TAGS] },
);

/** Lättviktig katalog (endast metadata, nyast först) — för related-poolen m.m. */
export async function getBlogCatalog(): Promise<BlogCatalog> {
  return loadBlogCatalog();
}

/** Paginerad metadatasida, nyast först; areaSlugs filtrerar på minst ett område. */
export async function getBlogPage(
  offset: number,
  limit: number,
  areaSlugs: string[] = [],
): Promise<{ posts: BlogPostEntry[]; total: number }> {
  // Normaliserad nyckel så att samma filter i annan ordning delar cachepost.
  const areaKey = [...new Set(areaSlugs)].sort().join(",");
  return loadBlogPage(offset, limit, areaKey);
}

/** Områdes-slugs som används av minst ett inlägg (för filterpiller). */
export async function getUsedBlogAreaSlugs(): Promise<string[]> {
  return loadUsedAreaSlugs();
}

/** Helt inlägg med färdigrenderad HTML (renderad vid skrivtillfället). */
export async function getStoredBlogPost(
  slug: string,
): Promise<StoredPost<BlogPostEntry> | null> {
  return loadStoredPost(slug);
}

/** Renderad HTML för ett enskilt inlägg; cachas per slug. */
export async function getRenderedPost(slug: string): Promise<string | null> {
  return (await loadStoredPost(slug))?.html ?? null;
}
