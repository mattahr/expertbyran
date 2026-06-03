import { describe, expect, it } from "vitest";

import { getRelatedByArea, type RelatedItem } from "./related";

const POOL: RelatedItem[] = [
  { kind: "foresight", slug: "f-cyber", title: "Cyber-foresight", date: "2026-05-29T00:00:00.000Z", areaSlugs: ["cyber"] },
  { kind: "foresight", slug: "f-old", title: "Gammal", date: "2026-01-01T00:00:00.000Z", areaSlugs: ["digitalisering"] },
  { kind: "blog", slug: "b-dig", title: "Digital blogg", date: "2026-06-01T00:00:00.000Z", areaSlugs: ["digitalisering"] },
  { kind: "blog", slug: "b-other", title: "Annat", date: "2026-06-02T00:00:00.000Z", areaSlugs: ["transport"] },
];

describe("getRelatedByArea", () => {
  it("matchar poster som delar minst ett område", () => {
    const result = getRelatedByArea(POOL, ["digitalisering"]);
    expect(result.map((r) => r.slug)).toEqual(["b-dig", "f-old"]);
  });

  it("returnerar tomt när inget område delas", () => {
    expect(getRelatedByArea(POOL, ["bistand"])).toEqual([]);
  });

  it("sorterar nyast först och blandar foresights + bloggar", () => {
    const result = getRelatedByArea(POOL, ["cyber", "digitalisering"]);
    expect(result.map((r) => r.slug)).toEqual(["b-dig", "f-cyber", "f-old"]);
  });

  it("kapar till max 5", () => {
    const big: RelatedItem[] = Array.from({ length: 8 }, (_, i) => ({
      kind: "blog" as const,
      slug: `b-${i}`,
      title: `B${i}`,
      date: `2026-06-0${(i % 9) + 1}T00:00:00.000Z`,
      areaSlugs: ["cyber"],
    }));
    expect(getRelatedByArea(big, ["cyber"]).length).toBe(5);
  });
});
