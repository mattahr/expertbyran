// @vitest-environment node

import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

import { pageRobots, robotsTxtRules, xRobotsTagValue } from "./robots-policy";

describe("robots policy", () => {
  it("marks pages as non-indexable in metadata", () => {
    expect(pageRobots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      notranslate: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
      googleBot: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
        noimageindex: true,
        notranslate: true,
      },
    });
  });

  it("publishes a robots.txt that lets crawlers see noindex while blocking training bots", () => {
    expect(robotsTxtRules).toEqual([
      {
        userAgent: ["Google-Extended", "GPTBot", "ClaudeBot", "CCBot"],
        disallow: "/",
      },
      {
        userAgent: [
          "ChatGPT-User",
          "Claude-User",
          "Perplexity-User",
        ],
        disallow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
      },
    ]);

    expect(robots().rules).toEqual(robotsTxtRules);
  });

  it("uses a single X-Robots-Tag value across the app", () => {
    expect(xRobotsTagValue).toBe(
      "noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate, max-snippet:0, max-image-preview:none, max-video-preview:0",
    );
  });
});
