// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { createSessionToken } from "@/lib/admin/session";
import { assertSameOrigin, requireAdmin } from "./auth";

const SECRET = "test-session-secret";

beforeEach(() => {
  process.env.ADMIN_SESSION_SECRET = SECRET;
  process.env.API_TOKEN = "machine-token";
});
afterEach(() => {
  delete process.env.ADMIN_SESSION_SECRET;
  delete process.env.API_TOKEN;
});

function req(headers: Record<string, string>) {
  return new NextRequest("https://admin.example/api/v1/admin/x", { headers });
}

describe("requireAdmin", () => {
  it("godkänner giltig bearer-token", () => {
    expect(requireAdmin(req({ authorization: "Bearer machine-token" }))).toEqual({ ok: true, via: "bearer" });
  });

  it("godkänner giltig session-cookie", () => {
    const token = createSessionToken(SECRET, 60_000, Date.now());
    expect(requireAdmin(req({ cookie: `eb_admin=${token}` }))).toEqual({ ok: true, via: "cookie" });
  });

  it("avvisar utan auth och vid trasig cookie", () => {
    expect(requireAdmin(req({}))).toEqual({ ok: false });
    expect(requireAdmin(req({ cookie: "eb_admin=skräp" }))).toEqual({ ok: false });
    expect(requireAdmin(req({ authorization: "Bearer fel" }))).toEqual({ ok: false });
  });
});

describe("assertSameOrigin", () => {
  it("sant när Origin matchar host", () => {
    expect(assertSameOrigin(req({ origin: "https://admin.example" }))).toBe(true);
  });
  it("falskt vid främmande Origin", () => {
    expect(assertSameOrigin(req({ origin: "https://evil.example" }))).toBe(false);
  });
  it("falskt när Origin saknas", () => {
    expect(assertSameOrigin(req({}))).toBe(false);
  });
});
