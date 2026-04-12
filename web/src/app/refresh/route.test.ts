// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { siteDataSchema } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";
import siteData from "@/test/fixtures/site-data.fixture.json";

import { GET } from "./route";

vi.mock("@/lib/content/store", () => ({
  getSiteData: vi.fn(),
}));

describe("/refresh route", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forces a fresh site-data fetch", async () => {
    vi.mocked(getSiteData).mockResolvedValue(siteDataSchema.parse(structuredClone(siteData)));

    const response = await GET();
    const body = await response.json();

    expect(getSiteData).toHaveBeenCalledWith({ fresh: true });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({
      ok: true,
      experts: siteData.experts.length,
      teams: siteData.teams.length,
    });
  });

  it("returns 500 when the refresh fails", async () => {
    vi.mocked(getSiteData).mockRejectedValue(new Error("network down"));

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
