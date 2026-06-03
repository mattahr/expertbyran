import { getBlogArchive } from "@/lib/blog/query";
import { getForesightArchive } from "@/lib/foresight/query";

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
  const pool = await getRelatedPool();
  const map: Record<string, RelatedItem[]> = {};
  for (const blip of blips) {
    if (!blip.areaSlugs || blip.areaSlugs.length === 0) continue;
    const related = getRelatedByArea(pool, blip.areaSlugs);
    if (related.length > 0) map[blip.id] = related;
  }
  return map;
}
