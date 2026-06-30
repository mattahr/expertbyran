// web/src/lib/analytics/referrer.ts
//
// Klassar en referrer-URL till trafikkälla. Medvetet pragmatisk: matchar
// värd-labels mot små sök-/social-listor (accepterar enstaka falska positiva
// för analysändamål framför att bära en full public-suffix-lista).

export type TrafficSource = "direct" | "internal" | "search" | "social" | "referral";

const SEARCH = new Set([
  "google",
  "bing",
  "duckduckgo",
  "yahoo",
  "ecosia",
  "baidu",
  "yandex",
  "brave",
  "startpage",
  "qwant",
  "kagi",
]);

const SOCIAL = new Set([
  "facebook",
  "twitter",
  "linkedin",
  "reddit",
  "instagram",
  "youtube",
  "mastodon",
  "bluesky",
  "pinterest",
  "tumblr",
  "threads",
  "tiktok",
]);

// Korta värd-alias som inte fångas av label-matchningen ovan.
const SOCIAL_HOSTS = new Set(["t.co", "x.com", "fb.com", "lnkd.in", "youtu.be", "bsky.app"]);

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function hasLabelIn(host: string, set: Set<string>): boolean {
  return host.split(".").some((label) => set.has(label));
}

export function classifyReferrer(
  referrer: string | null | undefined,
  ownHost: string | null,
): { source: TrafficSource; host: string | null } {
  if (!referrer || !referrer.trim()) return { source: "direct", host: null };

  let host: string;
  try {
    host = normalizeHost(new URL(referrer).hostname);
  } catch {
    return { source: "referral", host: referrer };
  }
  if (!host) return { source: "referral", host: referrer };

  const own = ownHost ? normalizeHost(ownHost) : null;
  if (own && host === own) return { source: "internal", host };

  if (SOCIAL_HOSTS.has(host) || hasLabelIn(host, SOCIAL)) return { source: "social", host };
  if (hasLabelIn(host, SEARCH)) return { source: "search", host };

  return { source: "referral", host };
}
