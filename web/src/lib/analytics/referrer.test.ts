import { describe, expect, it } from "vitest";

import { classifyReferrer } from "./referrer";

const OWN = "expertbyran.ai";

describe("classifyReferrer", () => {
  it("tom referrer → direkt", () => {
    expect(classifyReferrer("", OWN)).toEqual({ source: "direct", host: null });
    expect(classifyReferrer(null, OWN)).toEqual({ source: "direct", host: null });
  });

  it("egen värd → intern (oavsett www)", () => {
    expect(classifyReferrer("https://expertbyran.ai/blogg", OWN)).toEqual({
      source: "internal",
      host: "expertbyran.ai",
    });
    expect(classifyReferrer("https://www.expertbyran.ai/", OWN).source).toBe("internal");
  });

  it("sökmotorer → search", () => {
    expect(classifyReferrer("https://www.google.com/search?q=x", OWN)).toEqual({
      source: "search",
      host: "google.com",
    });
    expect(classifyReferrer("https://news.google.co.uk/", OWN).source).toBe("search");
    expect(classifyReferrer("https://duckduckgo.com/", OWN).source).toBe("search");
  });

  it("sociala nätverk → social", () => {
    expect(classifyReferrer("https://t.co/abc", OWN).source).toBe("social");
    expect(classifyReferrer("https://www.facebook.com/", OWN).source).toBe("social");
    expect(classifyReferrer("https://x.com/someone", OWN).source).toBe("social");
    expect(classifyReferrer("https://www.linkedin.com/feed/", OWN).source).toBe("social");
  });

  it("övriga värdar → referral", () => {
    expect(classifyReferrer("https://news.ycombinator.com/", OWN)).toEqual({
      source: "referral",
      host: "news.ycombinator.com",
    });
  });

  it("ogiltig URL → referral med råsträng som host", () => {
    expect(classifyReferrer("inte-en-url", OWN)).toEqual({ source: "referral", host: "inte-en-url" });
  });
});
