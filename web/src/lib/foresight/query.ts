import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { ForesightEntry } from "@/lib/foresight/schema";
import {
  getForesightCatalog,
  getForesightPage,
  getStoredForesight,
} from "@/lib/foresight/store";

export const FORESIGHT_PAGE_SIZE = 24;

const foresightDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatForesightDate(isoDate: string): string {
  return foresightDateFormatter.format(new Date(isoDate));
}

export type ResolvedAuthor = { name: string; role?: string; expertSlug?: string };

export type ForesightSummary = ForesightEntry & {
  author: ResolvedAuthor;
  areas: ExpertArea[];
};

export type ForesightFull = ForesightSummary & { contentHtml: string };

export type ForesightArchive = { foresights: ForesightSummary[]; areas: ExpertArea[] };

export type ForesightArchivePage = {
  foresights: ForesightSummary[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

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

// Bevarar storens ordning (nyast först).
function resolveForesights(entries: ForesightEntry[], siteData: SiteData): ForesightSummary[] {
  return entries
    .map((entry) => {
      const author = resolveAuthor(siteData.experts, entry);
      if (!author) {
        console.warn(`[expertbyran:foresight] Hoppar över '${entry.slug}' — saknar visningsnamn.`);
        return null;
      }
      const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
      return { ...entry, author, areas };
    })
    .filter((entry): entry is ForesightSummary => entry !== null);
}

/** Hela arkivet (metadata) — används av related-poolen, inte av listsidorna. */
export async function getForesightArchive(): Promise<ForesightArchive> {
  const [catalog, siteData] = await Promise.all([getForesightCatalog(), getSiteData()]);
  const foresights = resolveForesights(catalog.foresights, siteData);
  const usedSlugs = new Set(foresights.flatMap((f) => f.areas.map((area) => area.slug)));
  return {
    foresights,
    areas: byAreaOrder(siteData.expertAreas.filter((area) => usedSlugs.has(area.slug))),
  };
}

/** En sida av arkivet, nyast först, med totalantal för sidnavigering. */
export async function getForesightArchivePage(page: number): Promise<ForesightArchivePage> {
  const pageSize = FORESIGHT_PAGE_SIZE;
  const safePage = Math.max(1, Math.floor(page) || 1);
  const [{ foresights, total }, siteData] = await Promise.all([
    getForesightPage((safePage - 1) * pageSize, pageSize),
    getSiteData(),
  ]);
  return {
    foresights: resolveForesights(foresights, siteData),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    page: safePage,
    pageSize,
  };
}

export async function getForesight(slug: string): Promise<ForesightFull | null> {
  const [stored, siteData] = await Promise.all([getStoredForesight(slug), getSiteData()]);
  if (!stored) return null;
  const author = resolveAuthor(siteData.experts, stored.meta);
  if (!author) return null;
  const areas = resolveAreas(siteData.expertAreas, stored.meta.areaSlugs);
  return { ...stored.meta, author, areas, contentHtml: stored.html };
}
