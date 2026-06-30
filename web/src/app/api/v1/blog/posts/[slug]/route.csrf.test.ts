// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { createSessionToken } from "@/lib/admin/session";
import { __setStoresForTest } from "@/lib/stores";
import { InMemoryBlogStore } from "@/lib/stores/memory-stores";
import { DELETE } from "./route";

const SECRET = "sek";
let blog: InMemoryBlogStore;

beforeEach(async () => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
  blog = new InMemoryBlogStore();
  await blog.createPost(
    { slug: "x", title: "X", date: "2026-01-01T10:00:00.000Z", authorName: "A", areaSlugs: ["digitalisering"], excerpt: "e" },
    "# X",
  );
  __setStoresForTest({ blog });
});
afterEach(() => {
  __setStoresForTest(null);
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.API_TOKEN;
});

const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });

function cookieReq(headers: Record<string, string> = {}) {
  const token = createSessionToken(SECRET, 60_000, Date.now());
  return new NextRequest("https://expertbyran.ai/api/v1/blog/posts/x", {
    method: "DELETE",
    headers: { cookie: `eb_admin=${token}`, ...headers },
  });
}

describe("CSRF-skydd på cookie-autentiserad DELETE", () => {
  it("avvisar (403) utan matchande Origin", async () => {
    const res = await DELETE(cookieReq(), ctx("x"));
    expect(res.status).toBe(403);
  });

  it("tillåts med matchande Origin", async () => {
    const res = await DELETE(cookieReq({ origin: "https://expertbyran.ai" }), ctx("x"));
    expect(res.status).toBe(200);
  });

  it("bearer-token kräver ingen Origin", async () => {
    process.env.API_TOKEN = "tok";
    const req = new NextRequest("https://expertbyran.ai/api/v1/blog/posts/x", {
      method: "DELETE",
      headers: { authorization: "Bearer tok" },
    });
    const res = await DELETE(req, ctx("x"));
    expect(res.status).toBe(200);
  });
});
