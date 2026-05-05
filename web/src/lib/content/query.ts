import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

function bySortOrder<T extends { sortOrder: number; name?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder === right.sortOrder && left.name && right.name) {
      return left.name.localeCompare(right.name, "sv");
    }

    return left.sortOrder - right.sortOrder;
  });
}

export async function getOrderedSiteData() {
  const data = await getSiteData();

  return {
    ...data,
    expertAreas: bySortOrder(data.expertAreas),
    experts: bySortOrder(data.experts),
  };
}

export async function getFeaturedExpertAreas() {
  const data = await getOrderedSiteData();
  return data.expertAreas.filter((area) => area.featured);
}

export async function getFeaturedExperts() {
  const data = await getOrderedSiteData();
  return data.experts.filter((expert) => expert.featured);
}

export function getExpertsForArea(data: SiteData, areaSlug: string) {
  return bySortOrder(data.experts.filter((expert) => expert.areaSlugs.includes(areaSlug)));
}

export function getAreasForExpert(data: SiteData, expert: Expert) {
  const areaMap = new Map(data.expertAreas.map((area) => [area.slug, area]));

  return expert.areaSlugs
    .map((slug) => areaMap.get(slug))
    .filter((area): area is ExpertArea => Boolean(area));
}
