import { describe, expect, it } from "vitest";

import { parseForesightCatalog, type ForesightEntry } from "./schema";

const ENTRY: ForesightEntry = {
  slug: "digital-suveranitet-2026-2030",
  title: "Digital suveränitet i svensk statsförvaltning 2026–2030",
  date: "2026-05-29T10:00:00.000Z",
  authorName: "Chefsstrateg",
  areaSlugs: ["digitalisering"],
  excerpt: "En analys av suveränitetsregimen.",
  horizon: "2026–2030",
};

describe("foresight schema", () => {
  it("validerar en korrekt katalog", () => {
    expect(parseForesightCatalog({ foresights: [ENTRY] }, "test").foresights).toHaveLength(1);
  });

  it("kräver minst ett expertområde", () => {
    const bad = { foresights: [{ ...ENTRY, areaSlugs: [] }] };
    expect(() => parseForesightCatalog(bad, "test")).toThrow();
  });

  it("kräver författarnamn eller -slug", () => {
    const { authorName: _omit, ...withoutAuthor } = ENTRY;
    expect(() => parseForesightCatalog({ foresights: [withoutAuthor] }, "test")).toThrow();
  });

  it("avvisar dubblett-slug", () => {
    expect(() => parseForesightCatalog({ foresights: [ENTRY, ENTRY] }, "test")).toThrow();
  });

  it("tillåter utelämnad horizon", () => {
    const { horizon: _omit, ...noHorizon } = ENTRY;
    expect(() => parseForesightCatalog({ foresights: [noHorizon] }, "test")).not.toThrow();
  });
});
