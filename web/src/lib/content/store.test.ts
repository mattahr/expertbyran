// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import siteData from "../../test/fixtures/site-data.fixture.json";

import { getSiteData, resetSiteDataCache } from "./store";

describe("site data store", () => {
  beforeEach(() => {
    process.env.SITE_DATA_URL = "https://example.test/site-data.json";
    process.env.SITE_DATA_REVALIDATE_SECONDS = "300";
    resetSiteDataCache();
  });

  afterEach(() => {
    delete process.env.SITE_DATA_URL;
    delete process.env.SITE_DATA_REVALIDATE_SECONDS;
    delete process.env.SITE_DATA_FETCH_TIMEOUT_MS;
    resetSiteDataCache();
    vi.restoreAllMocks();
  });

  it("reads site-data from the configured remote URL", async () => {
    const remote = structuredClone(siteData);
    remote.site.tagline = "Remote snapshot";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => remote,
      }),
    );

    const data = await getSiteData({ fresh: true });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(data.site.tagline).toBe("Remote snapshot");
  });

  it("falls back to the last cached remote snapshot when a refresh fails", async () => {
    const remote = structuredClone(siteData);
    remote.site.tagline = "Cached remote snapshot";

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => remote,
        })
        .mockRejectedValueOnce(new Error("network down")),
    );

    const first = await getSiteData({ fresh: true });
    const second = await getSiteData({ fresh: true });

    expect(first.site.tagline).toBe("Cached remote snapshot");
    expect(second.site.tagline).toBe("Cached remote snapshot");
  });

  it("throws when the remote URL fails before any cache exists", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(getSiteData({ fresh: true })).rejects.toThrow("network down");
  });
});
