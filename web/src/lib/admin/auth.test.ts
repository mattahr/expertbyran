// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitForTest, verifyCredentials } from "./auth";

beforeEach(() => {
  resetRateLimitForTest();
  process.env.ADMIN_USERNAME = "chef";
  process.env.ADMIN_PASSWORD = "hemligt";
});
afterEach(() => {
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD;
});

describe("verifyCredentials", () => {
  it("godkänner rätt användarnamn och lösenord", () => {
    expect(verifyCredentials("chef", "hemligt")).toBe(true);
  });
  it("avvisar fel lösenord eller användarnamn", () => {
    expect(verifyCredentials("chef", "fel")).toBe(false);
    expect(verifyCredentials("annan", "hemligt")).toBe(false);
  });
  it("avvisar allt när ADMIN_PASSWORD saknas", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(verifyCredentials("chef", "hemligt")).toBe(false);
  });
});

describe("checkRateLimit", () => {
  it("tillåter upp till gränsen och blockerar därefter", () => {
    const now = 1_000_000;
    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit("1.2.3.4", now)).toBe(true);
    }
    expect(checkRateLimit("1.2.3.4", now)).toBe(false);
  });
  it("nollställer efter fönstret", () => {
    const now = 1_000_000;
    for (let i = 0; i < 11; i++) checkRateLimit("5.6.7.8", now);
    expect(checkRateLimit("5.6.7.8", now)).toBe(false);
    expect(checkRateLimit("5.6.7.8", now + 16 * 60 * 1000)).toBe(true);
  });
  it("räknar per IP", () => {
    const now = 1_000_000;
    for (let i = 0; i < 11; i++) checkRateLimit("a", now);
    expect(checkRateLimit("a", now)).toBe(false);
    expect(checkRateLimit("b", now)).toBe(true);
  });
});
