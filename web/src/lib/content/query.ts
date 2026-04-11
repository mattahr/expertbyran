import type { Expert, ExpertArea, SiteData, Team } from "@/lib/content/schema";
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
    teams: bySortOrder(data.teams),
    experts: bySortOrder(data.experts),
  };
}

export async function getFeaturedExpertAreas() {
  const data = await getOrderedSiteData();
  return data.expertAreas.filter((area) => area.featured);
}

export async function getFeaturedTeams() {
  const data = await getOrderedSiteData();
  return data.teams.filter((team) => team.featured);
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

export function getExpertsForTeam(data: SiteData, team: Team) {
  const expertMap = new Map(data.experts.map((expert) => [expert.slug, expert]));

  return team.expertSlugs
    .map((slug) => expertMap.get(slug))
    .filter((expert): expert is Expert => Boolean(expert));
}

export function getTeamsForExpert(data: SiteData, expertSlug: string) {
  return bySortOrder(data.teams.filter((team) => team.expertSlugs.includes(expertSlug)));
}

export function getTeamsForArea(data: SiteData, areaSlug: string) {
  return bySortOrder(
    data.teams.filter((team) =>
      team.expertSlugs.some((expertSlug) =>
        data.experts.some(
          (expert) => expert.slug === expertSlug && expert.areaSlugs.includes(areaSlug),
        ),
      ),
    ),
  );
}
