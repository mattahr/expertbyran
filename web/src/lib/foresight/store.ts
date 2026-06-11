import { unstable_cache } from "next/cache";

import type { ForesightCatalog, ForesightEntry } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";
import type { StoredPost } from "@/lib/stores/types";

export const FORESIGHT_TAGS = ["foresight"] as const;

const loadForesightCatalog = unstable_cache(
  async (): Promise<ForesightCatalog> => {
    const foresights = await getForesightStore().listForesights();
    return { foresights };
  },
  ["foresight-catalog"],
  { tags: [...FORESIGHT_TAGS] },
);

const loadStoredForesight = unstable_cache(
  async (slug: string): Promise<StoredPost<ForesightEntry> | null> =>
    getForesightStore().getForesight(slug),
  ["foresight-stored-post"],
  { tags: [...FORESIGHT_TAGS] },
);

/** Lättviktig katalog (endast metadata, nyast först). */
export async function getForesightCatalog(): Promise<ForesightCatalog> {
  return loadForesightCatalog();
}

/**
 * Paginerad metadatasida, nyast först. Cachas medvetet INTE — sidnumret är
 * användarstyrt och obegränsat; den indexerade SQLite-frågan är sub-ms.
 */
export async function getForesightPage(
  offset: number,
  limit: number,
): Promise<{ foresights: ForesightEntry[]; total: number }> {
  return getForesightStore().listForesightsPage({ offset, limit });
}

/** Hel foresight med färdigrenderad HTML (renderad vid skrivtillfället). */
export async function getStoredForesight(
  slug: string,
): Promise<StoredPost<ForesightEntry> | null> {
  // Existens-gate mot katalogen — se kommentar i blog/store.ts.
  const catalog = await loadForesightCatalog();
  if (!catalog.foresights.some((entry) => entry.slug === slug)) return null;
  return loadStoredForesight(slug);
}

/** Renderad HTML för en enskild foresight; cachas per slug. */
export async function getRenderedForesight(slug: string): Promise<string | null> {
  return (await loadStoredForesight(slug))?.html ?? null;
}
