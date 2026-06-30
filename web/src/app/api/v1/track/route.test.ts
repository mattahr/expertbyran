// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { __setGeoReaderForTest } from "@/lib/geo";
import { __setStoresForTest } from "@/lib/stores";
import { InMemoryAnalyticsStore } from "@/lib/stores/memory-stores";
import { POST } from "./route";

let store: InMemoryAnalyticsStore;

beforeEach(() => {
  process.env.VISITOR_SALT = "salt";
  store = new InMemoryAnalyticsStore();
  __setStoresForTest({ analytics: store });
  // Stub-läsare (returnerar null) gör att loadGeo() hoppar över den riktiga MMDB:n.
  __setGeoReaderForTest({ get: () => null });
});
afterEach(() => {
  __setStoresForTest(null);
  __setGeoReaderForTest(null);
  delete process.env.VISITOR_SALT;
});

function post(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://x/api/v1/track", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/v1/track", () => {
  it("204 och registrerar ett besök för giltig payload", async () => {
    const res = await POST(post({ path: "/blogg/x" }, { "x-forwarded-for": "8.8.8.8" }));
    expect(res.status).toBe(204);
    const r = store.overview({ from: "2000-01-01", to: "2100-01-01", excludeBots: false });
    expect(r.summary.pageviews).toBe(1);
    expect(r.topPages[0].path).toBe("/blogg/x");
  });

  it("400 för ogiltig payload (saknar path) och skriver inget", async () => {
    const res = await POST(post({ referrer: "x" }));
    expect(res.status).toBe(400);
    expect(store.overview({ from: "2000-01-01", to: "2100-01-01", excludeBots: false }).summary.pageviews).toBe(0);
  });

  it("413 när Content-Length överstiger taket", async () => {
    const res = await POST(post({ path: "/" }, { "content-length": String(32 * 1024) }));
    expect(res.status).toBe(413);
  });
});
