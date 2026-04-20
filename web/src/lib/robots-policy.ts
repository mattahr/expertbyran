import type { Metadata, MetadataRoute } from "next";

const sharedRobotsInfo = {
  index: false,
  follow: false,
  noarchive: true,
  nosnippet: true,
  noimageindex: true,
  notranslate: true,
  "max-snippet": 0,
  "max-image-preview": "none",
  "max-video-preview": 0,
} satisfies NonNullable<Metadata["robots"]>;

export const pageRobots: Metadata["robots"] = {
  ...sharedRobotsInfo,
  googleBot: sharedRobotsInfo,
};

export const xRobotsTagValue = [
  "noindex",
  "nofollow",
  "noarchive",
  "nosnippet",
  "noimageindex",
  "notranslate",
  "max-snippet:0",
  "max-image-preview:none",
  "max-video-preview:0",
].join(", ");

const blockedTrainingBots = [
  "Google-Extended",
  "GPTBot",
  "ClaudeBot",
  "CCBot",
] as const;

const blockedUserFetchBots = [
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
] as const;

export const robotsTxtRules: MetadataRoute.Robots["rules"] = [
  {
    userAgent: [...blockedTrainingBots],
    disallow: "/",
  },
  {
    // User-triggered fetchers are not search indexing bots, but this makes intent explicit.
    userAgent: [...blockedUserFetchBots],
    disallow: "/",
  },
  {
    userAgent: "*",
    allow: "/",
  },
];
