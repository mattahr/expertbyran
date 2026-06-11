import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { ForesightCatalog } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";

export const FORESIGHT_TAGS = ["foresight"] as const;

const loadForesightCatalog = unstable_cache(
  async (): Promise<ForesightCatalog> => {
    const foresights = await getForesightStore().listForesights();
    return { foresights };
  },
  ["foresight-catalog"],
  { tags: [...FORESIGHT_TAGS] },
);

const loadRenderedForesight = unstable_cache(
  async (slug: string): Promise<string | null> => {
    const full = await getForesightStore().getForesight(slug);
    if (!full) return null;
    return renderBlogMarkdown(full.markdown);
  },
  ["foresight-rendered-post"],
  { tags: [...FORESIGHT_TAGS] },
);

/** Lättviktig katalog (endast metadata) — renderar ingen markdown. */
export async function getForesightCatalog(): Promise<ForesightCatalog> {
  return loadForesightCatalog();
}

/** Renderad HTML för en enskild foresight; cachas per slug. */
export async function getRenderedForesight(slug: string): Promise<string | null> {
  return loadRenderedForesight(slug);
}
