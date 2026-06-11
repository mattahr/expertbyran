// web/src/lib/blog/store.ts
import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogCatalog } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";

export const BLOG_TAGS = ["blog"] as const;

const loadBlogCatalog = unstable_cache(
  async (): Promise<BlogCatalog> => {
    const posts = await getBlogStore().listPosts();
    return { posts };
  },
  ["blog-catalog"],
  { tags: [...BLOG_TAGS] },
);

const loadRenderedPost = unstable_cache(
  async (slug: string): Promise<string | null> => {
    const full = await getBlogStore().getPost(slug);
    if (!full) return null;
    return renderBlogMarkdown(full.markdown);
  },
  ["blog-rendered-post"],
  { tags: [...BLOG_TAGS] },
);

/** Lättviktig katalog (endast metadata) — renderar ingen markdown. */
export async function getBlogCatalog(): Promise<BlogCatalog> {
  return loadBlogCatalog();
}

/** Renderad HTML för ett enskilt inlägg; cachas per slug. */
export async function getRenderedPost(slug: string): Promise<string | null> {
  return loadRenderedPost(slug);
}
