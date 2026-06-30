import { describe, expect, it } from "vitest";

import { createSessionToken, verifySessionToken } from "./session";

const SECRET = "hemlig-nyckel-för-test-1234567890";
const TTL = 7 * 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

describe("session-token", () => {
  it("verifierar en färsk token", () => {
    const token = createSessionToken(SECRET, TTL, NOW);
    expect(verifySessionToken(token, SECRET, NOW + 1000)).toBe(true);
  });

  it("avvisar en utgången token", () => {
    const token = createSessionToken(SECRET, TTL, NOW);
    expect(verifySessionToken(token, SECRET, NOW + TTL + 1)).toBe(false);
  });

  it("avvisar fel hemlighet", () => {
    const token = createSessionToken(SECRET, TTL, NOW);
    expect(verifySessionToken(token, "annan-hemlighet", NOW)).toBe(false);
  });

  it("avvisar manipulerad signatur", () => {
    const token = createSessionToken(SECRET, TTL, NOW);
    const tampered = token.slice(0, -2) + (token.endsWith("aa") ? "bb" : "aa");
    expect(verifySessionToken(tampered, SECRET, NOW)).toBe(false);
  });

  it("avvisar trasig/tom token utan att krascha", () => {
    expect(verifySessionToken(undefined, SECRET, NOW)).toBe(false);
    expect(verifySessionToken("", SECRET, NOW)).toBe(false);
    expect(verifySessionToken("skräp", SECRET, NOW)).toBe(false);
    expect(verifySessionToken("v1.abc", SECRET, NOW)).toBe(false);
    expect(verifySessionToken("v1.abc.def", SECRET, NOW)).toBe(false);
  });
});
