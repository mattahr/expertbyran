// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { clientIp } from "./client-ip";

const req = (headers: Record<string, string>) => new NextRequest("https://x/", { headers });

describe("clientIp", () => {
  it("föredrar X-Real-IP", () => {
    expect(clientIp(req({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("9.9.9.9");
  });

  it("annars högraste X-Forwarded-For (närmaste betrodda hopp, ej spoofbar vänster)", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("2.2.2.2");
    expect(clientIp(req({ "x-forwarded-for": "spoofad, 8.8.8.8" }))).toBe("8.8.8.8");
  });

  it("tom sträng utan headers", () => {
    expect(clientIp(req({}))).toBe("");
  });
});
