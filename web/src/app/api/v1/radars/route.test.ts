// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryRadarStore } from "@/lib/stores/memory-stores";
import { GET, POST } from "./route";

const META = {
  slug: "teknikradar-2026",
  title: "Teknikradar 2026",
  date: "2026-06-03T00:00:00.000Z",
  segments: [
    { id: "ai-agenter", name: "AI & agenter" },
    { id: "infra", name: "Infrastruktur" },
    { id: "sakerhet", name: "Säkerhet" },
    { id: "styrning", name: "Styrning" },
  ],
};
const BLIPS = [
  {
    id: "pqc",
    name: "Post-kvant-kryptografi",
    segmentId: "sakerhet",
    ring: "prova",
    description: "Beskrivning.",
    implications: "Implikationer.",
  },
];

function postReq(body: unknown, token = "test-token") {
  return new Request("http://localhost/api/v1/radars", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.API_TOKEN = "test-token";
  __setStoresForTest({ radar: new InMemoryRadarStore() });
});
afterEach(() => {
  __setStoresForTest(null);
});

describe("/api/v1/radars", () => {
  it("GET returnerar tom lista initialt", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ radars: [] });
  });

  it("POST utan token ger 401", async () => {
    const res = await POST(postReq({ meta: META, blips: BLIPS }, "fel") as never);
    expect(res.status).toBe(401);
  });

  it("POST skapar en radar och GET listar den", async () => {
    const created = await POST(postReq({ meta: META, blips: BLIPS }) as never);
    expect(created.status).toBe(201);
    const list = await (await GET()).json();
    expect(list.radars).toHaveLength(1);
  });

  it("POST med blip mot okänt segment ger 400", async () => {
    const res = await POST(
      postReq({ meta: META, blips: [{ ...BLIPS[0], segmentId: "finns-ej" }] }) as never,
    );
    expect(res.status).toBe(400);
  });

  it("POST med dubblett-slug ger 409", async () => {
    await POST(postReq({ meta: META, blips: BLIPS }) as never);
    const res = await POST(postReq({ meta: META, blips: BLIPS }) as never);
    expect(res.status).toBe(409);
  });
});
