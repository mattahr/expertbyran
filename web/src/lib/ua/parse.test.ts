import { describe, expect, it } from "vitest";

import { applyClientHints, parseUserAgent } from "./parse";

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1";
const CHROME_ANDROID_TABLET =
  "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const CHROME_ANDROID_PHONE =
  "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36";
const EDGE_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
const FIREFOX_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0";
const GOOGLEBOT = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const CURL = "curl/8.1.2";

describe("parseUserAgent", () => {
  it("känner igen Chrome på Windows desktop", () => {
    const info = parseUserAgent(CHROME_WIN);
    expect(info).toMatchObject({ browser: "Chrome", browserVersion: "120", os: "Windows", device: "desktop", isBot: false });
  });

  it("känner igen Edge före Chrome", () => {
    expect(parseUserAgent(EDGE_WIN).browser).toBe("Edge");
  });

  it("känner igen Firefox på macOS", () => {
    const info = parseUserAgent(FIREFOX_MAC);
    expect(info).toMatchObject({ browser: "Firefox", browserVersion: "122", os: "macOS", device: "desktop" });
  });

  it("känner igen Safari på iPhone (mobil)", () => {
    const info = parseUserAgent(SAFARI_IPHONE);
    expect(info).toMatchObject({ browser: "Safari", os: "iOS", device: "mobile", isBot: false });
  });

  it("klassar Android utan 'Mobile' som surfplatta och extraherar modell", () => {
    const info = parseUserAgent(CHROME_ANDROID_TABLET);
    expect(info.device).toBe("tablet");
    expect(info.os).toBe("Android");
    expect(info.deviceModel).toBe("SM-X700");
    expect(info.deviceBrand).toBe("Samsung");
  });

  it("klassar Android med 'Mobile' som mobil", () => {
    expect(parseUserAgent(CHROME_ANDROID_PHONE).device).toBe("mobile");
  });

  it("flaggar Googlebot som bot", () => {
    const info = parseUserAgent(GOOGLEBOT);
    expect(info.isBot).toBe(true);
    expect(info.device).toBe("bot");
  });

  it("flaggar curl som bot", () => {
    expect(parseUserAgent(CURL).isBot).toBe(true);
  });

  it("hanterar tom/null UA", () => {
    expect(parseUserAgent("")).toMatchObject({ browser: "Okänd", os: "Okänd", device: "other", isBot: false });
    expect(parseUserAgent(null)).toMatchObject({ browser: "Okänd", isBot: false });
  });
});

describe("applyClientHints", () => {
  it("överstyr OS och Windows-version från platform hints", () => {
    const base = parseUserAgent(CHROME_WIN);
    const out = applyClientHints(base, { platform: '"Windows"', platformVersion: '"15.0.0"', mobile: "?0" });
    expect(out.os).toBe("Windows");
    expect(out.osVersion).toBe("11");
  });

  it("mappar låg Windows-platformversion till 10", () => {
    const base = parseUserAgent(CHROME_WIN);
    const out = applyClientHints(base, { platform: '"Windows"', platformVersion: '"8.0.0"', mobile: "?0" });
    expect(out.osVersion).toBe("10");
  });

  it("uppgraderar desktop till mobil när mobile=?1", () => {
    const base = parseUserAgent(CHROME_WIN);
    expect(applyClientHints(base, { platform: '"Android"', mobile: "?1" }).device).toBe("mobile");
  });

  it("rör inte bottar", () => {
    const base = parseUserAgent(GOOGLEBOT);
    expect(applyClientHints(base, { platform: '"Windows"', platformVersion: '"15"' }).device).toBe("bot");
  });
});
