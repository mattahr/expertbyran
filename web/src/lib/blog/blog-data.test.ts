// @vitest-environment node

import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import blogData from "../../../blog-data.json";
import siteData from "../../../site-data.json";
import { blogCatalogSchema } from "@/lib/blog/schema";
import { siteDataSchema } from "@/lib/content/schema";

const postsDir = path.resolve(__dirname, "../../../blog/posts");

describe("blog-data.json", () => {
  it("validerar mot bloggschemat", () => {
    expect(() => blogCatalogSchema.parse(blogData)).not.toThrow();
  });

  it("har en markdownfil för varje post", () => {
    const catalog = blogCatalogSchema.parse(blogData);

    const missing = catalog.posts
      .filter((post) => !existsSync(path.join(postsDir, `${post.slug}.md`)))
      .map((post) => post.slug);

    expect(missing).toEqual([]);
  });

  it("refererar till befintliga författare och expertområden", () => {
    const catalog = blogCatalogSchema.parse(blogData);
    const parsedSiteData = siteDataSchema.parse(siteData);

    const expertSlugs = new Set(parsedSiteData.experts.map((expert) => expert.slug));
    const areaSlugs = new Set(parsedSiteData.expertAreas.map((area) => area.slug));

    const missingAuthors = catalog.posts
      .filter((post) => !expertSlugs.has(post.authorSlug))
      .map((post) => post.slug);

    const missingAreas = catalog.posts.flatMap((post) =>
      post.areaSlugs
        .filter((slug) => !areaSlugs.has(slug))
        .map((slug) => `${post.slug}:${slug}`),
    );

    expect(missingAuthors).toEqual([]);
    expect(missingAreas).toEqual([]);
  });
});
