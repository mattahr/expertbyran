// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { createSessionToken } from "@/lib/admin/session";
import { __setStoresForTest } from "@/lib/stores";
import { InMemoryAnalyticsStore } from "@/lib/stores/memory-stores";
import { GET } from "./route";

const SECRET = "sek";
const URL = "https://admin.example/api/v1/admin/stats/overview";

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
  __setStoresForTest({ analytics: new InMemoryAnalyticsStore() });
});
afterEach(() => {
  __setStoresForTest(null);
  delete process.env.ADMIN_SESSION_SECRET;
});

function authed() {
  const token = createSessionToken(SECRET, 60_000, Date.now());
  return new NextRequest(URL, { headers: { cookie: `eb_admin=${token}` } });
}

describe("GET /api/v1/admin/stats/overview", () => {
  it("401 utan auth", async () => {
    const res = await GET(new NextRequest(URL));
    expect(res.status).toBe(401);
  });

  it("200 med översiktsform", async () => {
    const res = await GET(authed());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.summary.pageviews).toBe(0);
    expect(body.topPages).toEqual([]);
    expect(body.range.excludeBots).toBe(true);
    expect(Array.isArray(body.timeseries)).toBe(true);
  });
});
