// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import siteData from "../test/fixtures/site-data.fixture.json";

vi.mock("@/lib/content/store", () => ({
  getSiteData: vi.fn(async () => siteData),
}));

import ContactPage from "./kontakt/page";
import ExpertAreaDetailPage from "./expertomraden/[slug]/page";
import ExpertDetailPage from "./experter/[slug]/page";
import MarketplacePage from "./marknadsplats/page";
import HomePage from "./page";
import TeamDetailPage from "./team/[slug]/page";
import TeamsPage from "./team/page";

describe("public pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the home page with seeded content", async () => {
    const html = renderToStaticMarkup(await HomePage());

    expect(html).toContain(siteData.site.name);
    expect(html).toContain(siteData.site.hero.title);
  });

  it("renders an expert area page", async () => {
    const html = renderToStaticMarkup(
      await ExpertAreaDetailPage({
        params: Promise.resolve({ slug: siteData.expertAreas[0].slug }),
      }),
    );

    expect(html).toContain(siteData.expertAreas[0].name);
    expect(html).toContain(siteData.expertAreas[0].deliverables[0]);
  });

  it("renders an expert profile page", async () => {
    const html = renderToStaticMarkup(
      await ExpertDetailPage({
        params: Promise.resolve({ slug: siteData.experts[0].slug }),
      }),
    );

    expect(html).toContain(siteData.experts[0].name);
    expect(html).toContain(siteData.experts[0].selectedEngagements[0].title);
    expect(html).toContain(siteData.experts[0].plugin.name);
  });

  it("renders the contact page", async () => {
    const html = renderToStaticMarkup(await ContactPage());

    expect(html).toContain(siteData.contact.heading);
    expect(html).toContain(siteData.contact.channels[0].label);
  });

  it("renders the teams page", async () => {
    const html = renderToStaticMarkup(await TeamsPage());

    expect(html).toContain(siteData.teams[0].name);
    expect(html).toContain(siteData.teams[0].shortDescription);
  });

  it("renders a team detail page", async () => {
    const html = renderToStaticMarkup(
      await TeamDetailPage({
        params: Promise.resolve({ slug: siteData.teams[0].slug }),
      }),
    );

    expect(html).toContain(siteData.teams[0].name);
    expect(html).toContain(siteData.teams[0].plugin.name);
  });

  it("renders the marketplace page", async () => {
    const html = renderToStaticMarkup(await MarketplacePage());

    expect(html).toContain(siteData.marketplace.repositoryUrl);
    expect(html).toContain("/schemas/plugin-sync.schema.json");
  });
});
