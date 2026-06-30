import { afterEach, describe, expect, it } from "vitest";

import { __setGeoReaderForTest } from "@/lib/geo";
import { buildVisit, type BuildVisitInput } from "./build-visit";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// 2026-06-15T10:30:00Z → Europe/Stockholm (CEST, UTC+2) → 12:30 lokalt
const NOW = Date.UTC(2026, 5, 15, 10, 30, 0);

const fakeReader = {
  get(ip: string) {
    return ip === "193.13.0.1" ? { country: { iso_code: "SE" } } : null;
  },
};

function input(overrides: Partial<BuildVisitInput> = {}): BuildVisitInput {
  return {
    payload: {
      path: "/blogg/x",
      referrer: "https://www.google.com/search?q=expertbyran",
      lang: "sv-SE",
      languages: ["sv-SE", "en"],
      timezone: "Europe/Stockholm",
      screen: { w: 2560, h: 1440 },
      viewport: { w: 1280, h: 900 },
      dpr: 2,
      utm: { source: "nyhetsbrev", medium: "email", campaign: "juni" },
    },
    now: NOW,
    ip: "193.13.0.1",
    uaRaw: CHROME_WIN,
    clientHints: {},
    headerCountry: null,
    ownHost: "expertbyran.ai",
    visitorSalt: "salt",
    ...overrides,
  };
}

afterEach(() => __setGeoReaderForTest(null));

describe("buildVisit", () => {
  it("härleder tid, källa, geo, UA och presentationsfält", () => {
    __setGeoReaderForTest(fakeReader);
    const v = buildVisit(input());

    expect(v.day).toBe("2026-06-15");
    expect(v.hour).toBe(12);
    expect(v.source).toBe("search");
    expect(v.referrerHost).toBe("google.com");
    expect(v.country).toBe("SE");
    expect(v.countryName).toBe("Sverige");
    expect(v.browser).toBe("Chrome");
    expect(v.os).toBe("Windows");
    expect(v.device).toBe("desktop");
    expect(v.isBot).toBe(false);
    expect(v.utmCampaign).toBe("juni");
    expect(v.utmSource).toBe("nyhetsbrev");
    expect(v.screenW).toBe(2560);
    expect(v.viewportH).toBe(900);
    expect(v.dpr).toBe(2);
    expect(v.languages).toBe("sv-SE,en");
    expect(v.lang).toBe("sv-SE");
    expect(v.visitorId).toMatch(/^[0-9a-f]{64}$/);
  });

  it("visitor-id är stabilt för samma ip+ua men ändras med ip", () => {
    __setGeoReaderForTest(fakeReader);
    const a = buildVisit(input());
    const b = buildVisit(input());
    const c = buildVisit(input({ ip: "8.8.8.8" }));
    expect(a.visitorId).toBe(b.visitorId);
    expect(a.visitorId).not.toBe(c.visitorId);
  });

  it("flaggar bottar via UA", () => {
    __setGeoReaderForTest(fakeReader);
    const v = buildVisit(
      input({ uaRaw: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" }),
    );
    expect(v.isBot).toBe(true);
    expect(v.device).toBe("bot");
  });

  it("använder proxy-header för land när den finns", () => {
    __setGeoReaderForTest(null);
    const v = buildVisit(input({ headerCountry: "DE", ip: "0.0.0.0" }));
    expect(v.country).toBe("DE");
    expect(v.countryName).toBe("Tyskland");
  });

  it("tål saknad valfri payload-kontext", () => {
    __setGeoReaderForTest(fakeReader);
    const v = buildVisit(input({ payload: { path: "/" } }));
    expect(v.path).toBe("/");
    expect(v.source).toBe("direct");
    expect(v.referrerHost).toBeNull();
    expect(v.languages).toBeNull();
    expect(v.screenW).toBeNull();
  });
});
