import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { ForesightCatalog } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";

export type ForesightData = {
  catalog: ForesightCatalog;
  renderedPosts: Map<string, string>;
};

export const FORESIGHT_TAGS = ["foresight"] as const;

const loadForesightData = unstable_cache(
  async (): Promise<{ catalog: ForesightCatalog; rendered: [string, string][] }> => {
    const store = getForesightStore();
    const foresights = await store.listForesights();
    const rendered = await Promise.all(
      foresights.map(async (meta): Promise<[string, string]> => {
        const full = await store.getForesight(meta.slug);
        const html = full ? await renderBlogMarkdown(full.markdown) : "";
        return [meta.slug, html];
      }),
    );
    return { catalog: { foresights }, rendered };
  },
  ["foresight-data"],
  { tags: [...FORESIGHT_TAGS] },
);

export async function getForesightData(): Promise<ForesightData> {
  const { catalog, rendered } = await loadForesightData();
  return { catalog, renderedPosts: new Map(rendered) };
}
