import { unstable_cache } from "next/cache";

import { getBlogArchive } from "@/lib/blog/query";
import { getForesightArchive } from "@/lib/foresight/query";
import { getRadarDetail } from "@/lib/radar/store";

export type RelatedItem = {
  kind: "foresight" | "blog";
  slug: string;
  title: string;
  date: string;
  areaSlugs: string[];
};

const MAX_RELATED = 5;

/** Poster som delar minst ett område med blippen, nyast först, max 5. Ren funktion. */
export function getRelatedByArea(pool: RelatedItem[], areaSlugs: string[]): RelatedItem[] {
  const wanted = new Set(areaSlugs);
  return pool
    .filter((item) => item.areaSlugs.some((slug) => wanted.has(slug)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, MAX_RELATED);
}

/** Hämtar foresight- + blogg-arkiven (cachade) och normaliserar till RelatedItem[]. */
export async function getRelatedPool(): Promise<RelatedItem[]> {
  const [foresightArchive, blogArchive] = await Promise.all([
    getForesightArchive(),
    getBlogArchive(),
  ]);
  const foresights: RelatedItem[] = foresightArchive.foresights.map((f) => ({
    kind: "foresight",
    slug: f.slug,
    title: f.title,
    date: f.date,
    areaSlugs: f.areaSlugs,
  }));
  const blogs: RelatedItem[] = blogArchive.posts.map((p) => ({
    kind: "blog",
    slug: p.slug,
    title: p.title,
    date: p.date,
    areaSlugs: p.areaSlugs,
  }));
  return [...foresights, ...blogs];
}

/** Bygger en map blip-id → relaterade poster, endast för blips som har areaSlugs. */
export async function getRelatedByBlips(
  blips: { id: string; areaSlugs?: string[] }[],
): Promise<Record<string, RelatedItem[]>> {
  // Sortera poolen EN gång (nyast först) — per blip räcker filter + slice.
  const pool = (await getRelatedPool()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const map: Record<string, RelatedItem[]> = {};
  for (const blip of blips) {
    if (!blip.areaSlugs || blip.areaSlugs.length === 0) continue;
    const wanted = new Set(blip.areaSlugs);
    const related = pool
      .filter((item) => item.areaSlugs.some((slug) => wanted.has(slug)))
      .slice(0, MAX_RELATED);
    if (related.length > 0) map[blip.id] = related;
  }
  return map;
}

// Hela related-beräkningen för en radar cachas per slug: poolen växer med
// arkiven (4400 inlägg ⇒ tiotals ms per beräkning), så den ska inte köras per
// request. Taggarna täcker allt beräkningen läser: radarns blips samt blogg-
// och foresight-arkiven (vars författarupplösning beror på experts/areas).
const loadRelatedForRadar = unstable_cache(
  async (radarSlug: string): Promise<Record<string, RelatedItem[]>> => {
    const radar = await getRadarDetail(radarSlug);
    if (!radar) return {};
    return getRelatedByBlips(radar.blips);
  },
  ["radar-related"],
  { tags: ["radar", "blog", "foresight", "experts", "areas"] },
);

/** Relaterat innehåll per blip för en radar; cachas per radar-slug. */
export async function getRelatedForRadar(
  radarSlug: string,
): Promise<Record<string, RelatedItem[]>> {
  return loadRelatedForRadar(radarSlug);
}
