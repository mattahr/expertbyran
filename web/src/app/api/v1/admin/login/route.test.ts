// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { resetRateLimitForTest } from "@/lib/admin/auth";
import { POST } from "./route";

function req(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest("https://admin.example/api/v1/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetRateLimitForTest();
  process.env.ADMIN_USERNAME = "chef";
  process.env.ADMIN_PASSWORD = "hemligt";
  process.env.ADMIN_SESSION_SECRET = "sek";
});
afterEach(() => {
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
});

describe("POST /api/v1/admin/login", () => {
  it("503 när admin inte är konfigurerad", async () => {
    delete process.env.ADMIN_PASSWORD;
    const res = await POST(req({ username: "chef", password: "hemligt" }));
    expect(res.status).toBe(503);
  });

  it("401 vid fel lösenord", async () => {
    const res = await POST(req({ username: "chef", password: "fel" }, { "x-forwarded-for": "1.1.1.1" }));
    expect(res.status).toBe(401);
  });

  it("200 + HttpOnly-cookie vid rätt credentials", async () => {
    const res = await POST(req({ username: "chef", password: "hemligt" }, { "x-forwarded-for": "2.2.2.2" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/eb_admin=.+HttpOnly/);
  });

  it("429 efter för många försök från samma IP", async () => {
    for (let i = 0; i < 10; i++) {
      await POST(req({ username: "x", password: "y" }, { "x-forwarded-for": "9.9.9.9" }));
    }
    const res = await POST(req({ username: "chef", password: "hemligt" }, { "x-forwarded-for": "9.9.9.9" }));
    expect(res.status).toBe(429);
  });
});
