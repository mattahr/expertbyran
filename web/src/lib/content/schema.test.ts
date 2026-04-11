import { describe, expect, it } from "vitest";

import siteData from "../../test/fixtures/site-data.fixture.json";

import { siteDataSchema } from "./schema";

describe("siteDataSchema", () => {
  it("accepts the seeded snapshot", () => {
    expect(() => siteDataSchema.parse(siteData)).not.toThrow();
  });

  it("rejects broken area references", () => {
    const broken = structuredClone(siteData);
    broken.experts[0].areaSlugs = ["saknas"];

    const result = siteDataSchema.safeParse(broken);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path.join(".")).toBe("experts.0.areaSlugs.0");
    }
  });

  it("rejects duplicate expert slugs", () => {
    const broken = structuredClone(siteData);
    broken.experts[1].slug = broken.experts[0].slug;

    const result = siteDataSchema.safeParse(broken);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "experts.1.slug")).toBe(
        true,
      );
    }
  });

  it("rejects broken team references", () => {
    const broken = structuredClone(siteData);
    broken.teams[0].expertSlugs = ["saknas"];

    const result = siteDataSchema.safeParse(broken);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path.join(".")).toBe("teams.0.expertSlugs.0");
    }
  });

  it("rejects duplicate plugin repository paths", () => {
    const broken = structuredClone(siteData);
    broken.teams[0].plugin.repositoryPath = broken.experts[0].plugin.repositoryPath;

    const result = siteDataSchema.safeParse(broken);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path.join(".") === "teams.0.plugin.repositoryPath",
        ),
      ).toBe(true);
    }
  });

  it("rejects invalid marketplace install sources", () => {
    const broken = structuredClone(siteData);
    broken.marketplace.installSource = {
      source: "github",
      repo: "not a repo",
    };

    const result = siteDataSchema.safeParse(broken);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path.join(".") === "marketplace.installSource.repo",
        ),
      ).toBe(true);
    }
  });
});
