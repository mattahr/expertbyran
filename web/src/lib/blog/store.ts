// web/src/lib/blog/store.ts
import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogCatalog } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";

export type BlogData = {
  catalog: BlogCatalog;
  renderedPosts: Map<string, string>;
};

export const BLOG_TAGS = ["blog"] as const;

const loadBlogData = unstable_cache(
  async (): Promise<{ catalog: BlogCatalog; rendered: [string, string][] }> => {
    const store = getBlogStore();
    const posts = await store.listPosts();
    const rendered = await Promise.all(
      posts.map(async (meta): Promise<[string, string]> => {
        const full = await store.getPost(meta.slug);
        const html = full ? await renderBlogMarkdown(full.markdown) : "";
        return [meta.slug, html];
      }),
    );
    return { catalog: { posts }, rendered };
  },
  ["blog-data"],
  { tags: [...BLOG_TAGS] },
);

export async function getBlogData(): Promise<BlogData> {
  const { catalog, rendered } = await loadBlogData();
  return { catalog, renderedPosts: new Map(rendered) };
}
