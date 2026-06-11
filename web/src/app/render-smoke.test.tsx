// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import blogData from "../test/fixtures/blog-data.fixture.json";
import siteData from "../test/fixtures/site-data.fixture.json";

vi.mock("@/lib/content/store", () => ({
  getSiteData: vi.fn(async () => siteData),
}));

vi.mock("@/lib/blog/store", () => ({
  getBlogCatalog: vi.fn(async () => blogData),
  getRenderedPost: vi.fn(async (slug: string) => {
    const post = blogData.posts.find((candidate) => candidate.slug === slug);
    return post ? `<p>${post.title}</p>` : null;
  }),
}));

import BlogPostPage from "./blogg/[slug]/page";
import BlogPage from "./blogg/page";
import ExpertAreaDetailPage from "./expertomraden/[slug]/page";
import ExpertDetailPage from "./experter/[slug]/page";
import MarketplacePage from "./marknadsplats/page";
import HomePage from "./page";

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

  it("renders the marketplace page", async () => {
    const html = renderToStaticMarkup(await MarketplacePage());

    expect(html).toContain("https://github.com/mattahr/expertbyran");
    expect(html).toContain("mattahr/expertbyran");
  });

  it("renders the blog listing page", async () => {
    const area = siteData.expertAreas.find((candidate) => candidate.slug === blogData.posts[0].areaSlugs[0]);
    const html = renderToStaticMarkup(
      await BlogPage({
        searchParams: Promise.resolve({}),
      }),
    );

    expect(area).toBeDefined();
    expect(html).toContain("Blogg");
    expect(html).toContain(blogData.posts[0].title);
    expect(html).toContain(area!.name);
  });

  it("filters the blog listing by one expert area", async () => {
    const html = renderToStaticMarkup(
      await BlogPage({
        searchParams: Promise.resolve({ omrade: blogData.posts[0].areaSlugs[0] }),
      }),
    );

    expect(html).toContain(blogData.posts[0].title);
    expect(html).not.toContain(blogData.posts[1].title);
  });

  it("filters the blog listing by any selected expert area", async () => {
    const html = renderToStaticMarkup(
      await BlogPage({
        searchParams: Promise.resolve({
          omrade: [blogData.posts[0].areaSlugs[0], blogData.posts[1].areaSlugs[0]],
        }),
      }),
    );

    expect(html).toContain(blogData.posts[0].title);
    expect(html).toContain(blogData.posts[1].title);
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
