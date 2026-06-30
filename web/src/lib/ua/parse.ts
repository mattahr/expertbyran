// web/src/lib/ua/parse.ts
//
// Dependensfri klassificering av User-Agent-strängar till webbläsare, OS,
// enhetstyp och bot-flagga. Medvetet enkel (regex) — täcker vanliga klienter
// och berikas av Client Hints när de finns (se applyClientHints).

export interface UaInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: "desktop" | "mobile" | "tablet" | "bot" | "other";
  deviceBrand?: string;
  deviceModel?: string;
  isBot: boolean;
}

const UNKNOWN = "Okänd";

// Bot-signaturer testas FÖRE webbläsar-matchning. Generella ord (bot, crawler)
// plus kända namn och vanliga HTTP-klienter/verktyg.
const BOT_PATTERN =
  /(bot\b|bot\/|crawler|spider|crawl|slurp|mediapartners|headless|phantomjs|puppeteer|playwright|\bcurl\/|\bwget\b|python-requests|python-urllib|go-http-client|java\/|okhttp|axios|node-fetch|libwww|httpclient|facebookexternalhit|embedly|monitor|pingdom|uptimerobot|lighthouse|gtmetrix|semrush|ahrefs|dotbot|mj12bot|petalbot|bytespider|amazonbot|applebot|duckduckbot|yandex|bingbot|googlebot|baiduspider|feedfetcher|scrapy)/i;

function firstMatch(ua: string, re: RegExp): string | null {
  const m = ua.match(re);
  return m && m[1] ? m[1] : null;
}

function major(version: string | null): string {
  if (!version) return "";
  return version.split(".")[0] ?? "";
}

function detectBrowser(ua: string): { browser: string; version: string } {
  let v: string | null;
  if ((v = firstMatch(ua, /Edg(?:e|A|iOS)?\/([\d.]+)/))) return { browser: "Edge", version: major(v) };
  if ((v = firstMatch(ua, /OPR\/([\d.]+)/)) || (v = firstMatch(ua, /Opera\/([\d.]+)/)))
    return { browser: "Opera", version: major(v) };
  if ((v = firstMatch(ua, /SamsungBrowser\/([\d.]+)/)))
    return { browser: "Samsung Internet", version: major(v) };
  if ((v = firstMatch(ua, /(?:Firefox|FxiOS)\/([\d.]+)/)))
    return { browser: "Firefox", version: major(v) };
  if ((v = firstMatch(ua, /(?:Chrome|CriOS)\/([\d.]+)/)))
    return { browser: "Chrome", version: major(v) };
  if (/Safari/.test(ua)) {
    const ver = firstMatch(ua, /Version\/([\d.]+)/);
    return { browser: "Safari", version: major(ver) };
  }
  return { browser: UNKNOWN, version: "" };
}

function windowsVersion(nt: string | null): string {
  switch (nt) {
    case "10.0":
      return "10/11";
    case "6.3":
      return "8.1";
    case "6.2":
      return "8";
    case "6.1":
      return "7";
    default:
      return nt ?? "";
  }
}

function detectOs(ua: string): { os: string; version: string } {
  if (/Windows NT/.test(ua)) {
    return { os: "Windows", version: windowsVersion(firstMatch(ua, /Windows NT ([\d.]+)/)) };
  }
  if (/iPhone|iPad|iPod/.test(ua)) {
    const v = firstMatch(ua, /OS ([\d_]+)/);
    return { os: "iOS", version: v ? (v.replace(/_/g, ".").split(".")[0] ?? "") : "" };
  }
  if (/Android/.test(ua)) {
    const v = firstMatch(ua, /Android ([\d.]+)/);
    return { os: "Android", version: v ? (v.split(".")[0] ?? "") : "" };
  }
  if (/Mac OS X/.test(ua)) {
    const v = firstMatch(ua, /Mac OS X ([\d_]+)/);
    return { os: "macOS", version: v ? v.replace(/_/g, ".").split(".").slice(0, 2).join(".") : "" };
  }
  if (/CrOS/.test(ua)) return { os: "ChromeOS", version: "" };
  if (/Linux/.test(ua)) return { os: "Linux", version: "" };
  return { os: UNKNOWN, version: "" };
}

function detectDevice(ua: string): "desktop" | "mobile" | "tablet" | "other" {
  if (/iPad|Tablet|PlayBook|Kindle|Silk/.test(ua)) return "tablet";
  if (/Android/.test(ua) && !/Mobile/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Windows Phone|IEMobile/.test(ua)) return "mobile";
  if (/Mac OS X|Windows NT|CrOS|Linux/.test(ua)) return "desktop";
  return "other";
}

const BRAND_PREFIX: Array<[RegExp, string]> = [
  [/^SM-|^GT-|^SCH-|^SPH-|^Galaxy/i, "Samsung"],
  [/^Pixel/i, "Google"],
  [/^Redmi|^Mi |^M2|^POCO/i, "Xiaomi"],
  [/^ONEPLUS/i, "OnePlus"],
  [/^moto|^XT\d/i, "Motorola"],
  [/^HUAWEI|^ALP-|^ANE-/i, "Huawei"],
];

function detectDeviceModel(ua: string): { brand?: string; model?: string } {
  if (/iPhone/.test(ua)) return { brand: "Apple", model: "iPhone" };
  if (/iPad/.test(ua)) return { brand: "Apple", model: "iPad" };
  const m = firstMatch(ua, /Android [\d.]+; ([^;)]+?)(?: Build\/|[;)])/);
  if (!m) return {};
  const model = m.trim();
  if (!model || /^[a-z]{2}-[a-z]{2}$/i.test(model)) return {};
  const brand = BRAND_PREFIX.find(([re]) => re.test(model))?.[1];
  return { brand, model };
}

function botLabel(ua: string): string {
  const named = firstMatch(ua, /([A-Za-z][A-Za-z0-9]*bot)/i);
  if (named) return named;
  const tool = firstMatch(ua, /^([A-Za-z-]+)\//);
  return tool ?? "Bot";
}

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = (ua ?? "").trim();
  if (!s) {
    return { browser: UNKNOWN, browserVersion: "", os: UNKNOWN, osVersion: "", device: "other", isBot: false };
  }
  if (BOT_PATTERN.test(s)) {
    return {
      browser: botLabel(s),
      browserVersion: "",
      os: UNKNOWN,
      osVersion: "",
      device: "bot",
      isBot: true,
    };
  }
  const b = detectBrowser(s);
  const o = detectOs(s);
  const device = detectDevice(s);
  const { brand, model } = detectDeviceModel(s);
  return {
    browser: b.browser,
    browserVersion: b.version,
    os: o.os,
    osVersion: o.version,
    device,
    deviceBrand: brand,
    deviceModel: model,
    isBot: false,
  };
}

function stripQuotes(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().replace(/^"|"$/g, "");
  return trimmed.length ? trimmed : null;
}

const CH_PLATFORM_MAP: Record<string, string> = {
  Windows: "Windows",
  macOS: "macOS",
  "Mac OS X": "macOS",
  Android: "Android",
  "Chrome OS": "ChromeOS",
  "Chromium OS": "ChromeOS",
  Linux: "Linux",
  iOS: "iOS",
  iPadOS: "iOS",
};

/** Berikar UA-info med Client Hints-headers (sec-ch-ua-platform m.fl.). */
export function applyClientHints(
  info: UaInfo,
  hints: { platform?: string | null; platformVersion?: string | null; mobile?: string | null },
): UaInfo {
  if (info.isBot) return info;
  const out: UaInfo = { ...info };
  const platform = stripQuotes(hints.platform);
  if (platform && CH_PLATFORM_MAP[platform]) {
    out.os = CH_PLATFORM_MAP[platform];
    const pv = stripQuotes(hints.platformVersion);
    if (pv) {
      const maj = parseInt(pv.split(".")[0] ?? "", 10);
      if (out.os === "Windows" && !Number.isNaN(maj)) {
        out.osVersion = maj >= 13 ? "11" : maj >= 1 ? "10" : out.osVersion;
      } else if (!Number.isNaN(maj)) {
        out.osVersion = String(maj);
      }
    }
  }
  if (hints.mobile === "?1" && out.device === "desktop") out.device = "mobile";
  return out;
}
