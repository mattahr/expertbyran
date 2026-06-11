// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import blogData from "../test/fixtures/blog-data.fixture.json";
import siteData from "../test/fixtures/site-data.fixture.json";
import type { BlogPostEntry } from "@/lib/blog/schema";
import type { SiteData } from "@/lib/content/schema";
import { __setStoresForTest } from "@/lib/stores";
import {
  InMemoryBlogStore,
  InMemoryConfigStore,
  InMemoryContentStore,
} from "@/lib/stores/memory-stores";

import BlogPostPage from "./blogg/[slug]/page";
import BlogPage from "./blogg/page";
import ExpertAreaDetailPage from "./expertomraden/[slug]/page";
import ExpertDetailPage from "./experter/[slug]/page";
import MarketplacePage from "./marknadsplats/page";
import HomePage from "./page";

const typedSiteData = siteData as unknown as SiteData;

describe("public pages", () => {
  beforeEach(async () => {
    const blog = new InMemoryBlogStore();
    for (const post of blogData.posts) {
      await blog.createPost(post as BlogPostEntry, `# ${post.title}`);
    }
    __setStoresForTest({
      blog,
      config: new InMemoryConfigStore(typedSiteData),
      content: new InMemoryContentStore(typedSiteData.experts, typedSiteData.expertAreas),
    });
  });

  afterEach(() => __setStoresForTest(null));

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
