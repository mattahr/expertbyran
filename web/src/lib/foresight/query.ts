import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { ForesightCatalog, ForesightEntry } from "@/lib/foresight/schema";
import { getForesightCatalog, getRenderedForesight } from "@/lib/foresight/store";

export function formatForesightDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type ResolvedAuthor = { name: string; role?: string; expertSlug?: string };

export type ForesightSummary = ForesightEntry & {
  author: ResolvedAuthor;
  areas: ExpertArea[];
};

export type ForesightFull = ForesightSummary & { contentHtml: string };

export type ForesightArchive = { foresights: ForesightSummary[]; areas: ExpertArea[] };

function resolveAuthor(experts: Expert[], entry: ForesightEntry): ResolvedAuthor | null {
  const expert = entry.authorSlug
    ? experts.find((candidate) => candidate.slug === entry.authorSlug)
    : undefined;
  if (expert) {
    return {
      name: entry.authorName ?? expert.name,
      role: entry.authorRole ?? expert.role,
      expertSlug: expert.slug,
    };
  }
  if (entry.authorName) {
    return { name: entry.authorName, role: entry.authorRole };
  }
  return null;
}

function resolveAreas(allAreas: ExpertArea[], areaSlugs: string[]): ExpertArea[] {
  const areaMap = new Map(allAreas.map((area) => [area.slug, area]));
  return areaSlugs
    .map((slug) => areaMap.get(slug))
    .filter((area): area is ExpertArea => Boolean(area));
}

function byAreaOrder(areas: ExpertArea[]) {
  return [...areas].sort((left, right) =>
    left.sortOrder === right.sortOrder
      ? left.name.localeCompare(right.name, "sv")
      : left.sortOrder - right.sortOrder,
  );
}

function resolveForesights(catalog: ForesightCatalog, siteData: SiteData): ForesightSummary[] {
  return catalog.foresights
    .map((entry) => {
      const author = resolveAuthor(siteData.experts, entry);
      if (!author) {
        console.warn(`[expertbyran:foresight] Hoppar över '${entry.slug}' — saknar visningsnamn.`);
        return null;
      }
      const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
      return { ...entry, author, areas };
    })
    .filter((entry): entry is ForesightSummary => entry !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getForesightArchive(): Promise<ForesightArchive> {
  const [catalog, siteData] = await Promise.all([getForesightCatalog(), getSiteData()]);
  const foresights = resolveForesights(catalog, siteData);
  const usedSlugs = new Set(foresights.flatMap((f) => f.areas.map((area) => area.slug)));
  return {
    foresights,
    areas: byAreaOrder(siteData.expertAreas.filter((area) => usedSlugs.has(area.slug))),
  };
}

export async function getForesight(slug: string): Promise<ForesightFull | null> {
  const [catalog, siteData, contentHtml] = await Promise.all([
    getForesightCatalog(),
    getSiteData(),
    getRenderedForesight(slug),
  ]);
  const entry = catalog.foresights.find((f) => f.slug === slug);
  if (!entry) return null;
  const author = resolveAuthor(siteData.experts, entry);
  if (!author) return null;
  if (!contentHtml) return null;
  const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
  return { ...entry, author, areas, contentHtml };
}
