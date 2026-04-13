// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { getBlogData } from "@/lib/blog/store";
import { siteDataSchema } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";
import blogData from "@/test/fixtures/blog-data.fixture.json";
import siteData from "@/test/fixtures/site-data.fixture.json";

import { GET } from "./route";

vi.mock("@/lib/content/store", () => ({
  getSiteData: vi.fn(),
}));

vi.mock("@/lib/blog/store", () => ({
  getBlogData: vi.fn(),
}));

function mockBothStores() {
  vi.mocked(getSiteData).mockResolvedValue(siteDataSchema.parse(structuredClone(siteData)));
  vi.mocked(getBlogData).mockResolvedValue({
    catalog: blogData,
    renderedPosts: new Map(blogData.posts.map((p) => [p.slug, "<p>html</p>"])),
  });
}

describe("/refresh route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forces a fresh fetch of both site-data and blog-data", async () => {
    mockBothStores();

    const response = await GET();
    const body = await response.json();

    expect(getSiteData).toHaveBeenCalledWith({ fresh: true });
    expect(getBlogData).toHaveBeenCalledWith({ fresh: true });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      ok: true,
      experts: siteData.experts.length,
      teams: siteData.teams.length,
      posts: blogData.posts.length,
    });
  });

  it("returns 500 when the refresh fails", async () => {
    vi.mocked(getSiteData).mockRejectedValue(new Error("network down"));
    vi.mocked(getBlogData).mockResolvedValue({
      catalog: blogData,
      renderedPosts: new Map(),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toEqual({
      ok: false,
      error: "network down",
    });
  });
});
