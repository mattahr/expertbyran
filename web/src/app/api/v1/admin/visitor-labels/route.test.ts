// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryAnalyticsStore } from "@/lib/stores/memory-stores";
import { GET } from "./route";
import { DELETE, PUT } from "./[visitorId]/route";

let store: InMemoryAnalyticsStore;

beforeEach(() => {
  process.env.API_TOKEN = "tok";
  store = new InMemoryAnalyticsStore();
  __setStoresForTest({ analytics: store });
});
afterEach(() => {
  __setStoresForTest(null);
  delete process.env.API_TOKEN;
});

const bearer = { authorization: "Bearer tok" };
const ctx = (visitorId: string) => ({ params: Promise.resolve({ visitorId }) });

function mutate(method: string, body?: unknown) {
  return new NextRequest("https://x/api/v1/admin/visitor-labels/abc", {
    method,
    headers: { "content-type": "application/json", ...bearer },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("visitor-labels API", () => {
  it("PUT sätter, GET listar, DELETE tar bort", async () => {
    const put = await PUT(mutate("PUT", { label: "Anna" }), ctx("abc"));
    expect(put.status).toBe(200);
    expect(store.listVisitorLabels()).toEqual([{ visitorId: "abc", label: "Anna" }]);

    const get = await GET(new NextRequest("https://x/api/v1/admin/visitor-labels", { headers: bearer }));
    expect((await get.json()).labels).toEqual([{ visitorId: "abc", label: "Anna" }]);

    const del = await DELETE(mutate("DELETE"), ctx("abc"));
    expect(del.status).toBe(200);
    expect(store.listVisitorLabels()).toEqual([]);
  });

  it("401 utan auth", async () => {
    const get = await GET(new NextRequest("https://x/api/v1/admin/visitor-labels"));
    expect(get.status).toBe(401);
  });

  it("400 vid tomt namn", async () => {
    const put = await PUT(mutate("PUT", { label: "   " }), ctx("abc"));
    expect(put.status).toBe(400);
  });
});
