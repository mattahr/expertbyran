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

/**
 * Paginerad metadatasida, nyast först; areaSlugs filtrerar på minst ett område.
 * Cachas medvetet INTE: nyckelutrymmet (sida × filterkombination) är
 * användarstyrt och obegränsat — den indexerade SQLite-frågan är ändå sub-ms.
 */
export async function getBlogPage(
  offset: number,
  limit: number,
  areaSlugs: string[] = [],
): Promise<{ posts: BlogPostEntry[]; total: number }> {
  return getBlogStore().listPostsPage({
    offset,
    limit,
    areaSlugs: areaSlugs.length > 0 ? [...new Set(areaSlugs)].sort() : undefined,
  });
}

/** Områdes-slugs som används av minst ett inlägg (för filterpiller). */
export async function getUsedBlogAreaSlugs(): Promise<string[]> {
  return loadUsedAreaSlugs();
}

/** Helt inlägg med färdigrenderad HTML (renderad vid skrivtillfället). */
export async function getStoredBlogPost(
  slug: string,
): Promise<StoredPost<BlogPostEntry> | null> {
  // Existens-gate mot den cachade katalogen: utan den skulle varje påhittad
  // slug skapa en egen (null-)cachepost — obegränsat, användarstyrt utrymme.
  const catalog = await getBlogCatalog();
  if (!catalog.posts.some((post) => post.slug === slug)) return null;
  return loadStoredPost(slug);
}

/** Renderad HTML för ett enskilt inlägg; cachas per slug. */
export async function getRenderedPost(slug: string): Promise<string | null> {
  return (await loadStoredPost(slug))?.html ?? null;
}
