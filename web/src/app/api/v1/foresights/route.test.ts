// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryForesightStore } from "@/lib/stores/memory-stores";
import { GET, POST } from "./route";

const META = {
  slug: "digital-suveranitet-2026-2030",
  title: "Digital suveränitet 2026–2030",
  date: "2026-05-29T10:00:00.000Z",
  authorName: "Chefsstrateg",
  areaSlugs: ["digitalisering"],
  excerpt: "Sammanfattning.",
  horizon: "2026–2030",
};

function postReq(body: unknown, token = "test-token") {
  return new Request("http://localhost/api/v1/foresights", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.API_TOKEN = "test-token";
  __setStoresForTest({ foresight: new InMemoryForesightStore() });
});
afterEach(() => {
  __setStoresForTest(null);
});

describe("/api/v1/foresights", () => {
  it("GET returnerar tom lista initialt", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ foresights: [] });
  });

  it("POST utan token ger 401", async () => {
    const res = await POST(postReq({ foresight: META, markdown: "x" }, "fel") as never);
    expect(res.status).toBe(401);
  });

  it("POST skapar och GET listar", async () => {
    const created = await POST(postReq({ foresight: META, markdown: "# H\n\nText." }) as never);
    expect(created.status).toBe(201);
    const list = await (await GET()).json();
    expect(list.foresights).toHaveLength(1);
  });

  it("POST utan markdown ger 400", async () => {
    const res = await POST(postReq({ foresight: META }) as never);
    expect(res.status).toBe(400);
  });

  it("POST med dubblett-slug ger 409", async () => {
    await POST(postReq({ foresight: META, markdown: "x" }) as never);
    const res = await POST(postReq({ foresight: META, markdown: "y" }) as never);
    expect(res.status).toBe(409);
  });
});
