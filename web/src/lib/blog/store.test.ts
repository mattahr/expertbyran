// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import blogFixture from "@/test/fixtures/blog-data.fixture.json";

import { getBlogData, resetBlogCache } from "./store";

const fixtureDir = path.resolve(__dirname, "../../test/fixtures");

const post1Md = readFileSync(path.join(fixtureDir, "blog/posts/test-post-1.md"), "utf-8");
const post2Md = readFileSync(path.join(fixtureDir, "blog/posts/test-post-2.md"), "utf-8");

function mockFetchSuccess() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (typeof url === "string" && url.endsWith("blog-data.json")) {
        return new Response(JSON.stringify(blogFixture), { status: 200 });
      }

      if (typeof url === "string" && url.endsWith("test-post-1.md")) {
        return new Response(post1Md, { status: 200 });
      }

      if (typeof url === "string" && url.endsWith("test-post-2.md")) {
        return new Response(post2Md, { status: 200 });
      }

      return new Response("Not found", { status: 404 });
    }),
  );
}

describe("blog store", () => {
  beforeEach(() => {
    resetBlogCache();
    process.env.SITE_DATA_URL =
      "https://raw.githubusercontent.com/mattahr/expertbyran/refs/heads/main/web/site-data.json";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SITE_DATA_URL;
  });

  it("fetches and caches blog data", async () => {
    mockFetchSuccess();

    const data = await getBlogData();

    expect(data.catalog.posts).toHaveLength(2);
    expect(data.renderedPosts.size).toBe(2);
    expect(data.renderedPosts.get("test-post-1")).toContain("<strong>fetstil</strong>");
  });

  it("returns cached data on subsequent calls", async () => {
    mockFetchSuccess();

    await getBlogData();
    await getBlogData();

    // Katalogen hämtas en gång + 2 markdown-filer = 3 fetch-anrop totalt
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("forces a fresh fetch when fresh option is set", async () => {
    mockFetchSuccess();

    await getBlogData();
    await getBlogData({ fresh: true });

    // 3 anrop för första hämtningen + 3 för den forcerade = 6
    expect(fetch).toHaveBeenCalledTimes(6);
  });

  it("falls back to cache on fetch failure", async () => {
    mockFetchSuccess();
    await getBlogData();

    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));

    const data = await getBlogData({ fresh: true });
    expect(data.catalog.posts).toHaveLength(2);
  });

  it("throws when fetch fails without cached data", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("network down");
    }));

    await expect(getBlogData()).rejects.toThrow("network down");
  });
});
