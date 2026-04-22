// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import blogData from "../test/fixtures/blog-data.fixture.json";
import siteData from "../test/fixtures/site-data.fixture.json";

vi.mock("@/lib/content/store", () => ({
  getSiteData: vi.fn(async () => siteData),
}));

vi.mock("@/lib/blog/store", () => ({
  getBlogData: vi.fn(async () => ({
    catalog: blogData,
    renderedPosts: new Map(blogData.posts.map((p) => [p.slug, `<p>${p.title}</p>`])),
  })),
  resetBlogCache: vi.fn(),
}));

import BlogPostPage from "./blogg/[slug]/page";
import BlogPage from "./blogg/page";
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
    expect(html).toContain(siteData.teams[0].promptSummary);
  });

  it("renders the marketplace page", async () => {
    const html = renderToStaticMarkup(await MarketplacePage());

    expect(html).toContain("https://github.com/mattahr/expertbyran");
    expect(html).toContain("mattahr/expertbyran");
  });

  it("renders the blog listing page", async () => {
    const html = renderToStaticMarkup(await BlogPage());

    expect(html).toContain("Blogg");
    expect(html).toContain(blogData.posts[0].title);
  });

  it("renders a blog post page", async () => {
    const html = renderToStaticMarkup(
      await BlogPostPage({
        params: Promise.resolve({ slug: blogData.posts[0].slug }),
      }),
    );

    expect(html).toContain(blogData.posts[0].title);
    expect(html).toContain(siteData.experts[0].name);
  });
});
