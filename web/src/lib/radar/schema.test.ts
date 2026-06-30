import { describe, expect, it } from "vitest";

import {
  assertRadarIntegrity,
  parseRadarCatalog,
  parseRadarBlips,
  radarInputSchema,
  type Blip,
} from "./schema";

const META = {
  slug: "teknikradar-2026",
  title: "Teknikradar 2026",
  date: "2026-06-03T00:00:00.000Z",
  segments: [
    { id: "ai-agenter", name: "AI & agenter" },
    { id: "infra", name: "Infrastruktur" },
    { id: "sakerhet", name: "Säkerhet" },
    { id: "styrning", name: "Styrning" },
  ],
  rings: [
    { id: "anta", label: "Anta", blurb: "I drift, hög mognad", color: "#0e7c7b" },
    { id: "prova", label: "Pröva", blurb: "Pilot, bygg kompetens", color: "#1d4e74" },
    { id: "bevaka", label: "Bevaka", blurb: "Följ utvecklingen aktivt", color: "#d4982b" },
    { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet", color: "#64718a" },
  ],
};

const BLIP: Blip = {
  id: "pqc",
  name: "Post-kvant-kryptografi",
  segmentId: "sakerhet",
  ring: "prova",
  description: "En neutral beskrivning.",
  implications: "Varför det spelar roll.",
};

describe("radar schema", () => {
  it("validerar en korrekt katalog och blips", () => {
    expect(parseRadarCatalog({ radars: [META] }, "test").radars).toHaveLength(1);
    expect(parseRadarBlips({ blips: [BLIP] }, "test").blips).toHaveLength(1);
  });

  it("avvisar för få segment", () => {
    const bad = { radars: [{ ...META, segments: META.segments.slice(0, 2) }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("avvisar för få ringar (under 2)", () => {
    const bad = { radars: [{ ...META, rings: META.rings.slice(0, 1) }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("avvisar för många ringar (över 6)", () => {
    const seventh = { id: "extra", label: "Extra", blurb: "x", color: "#000000" };
    const bad = { radars: [{ ...META, rings: [...META.rings, ...META.rings.slice(0, 2), seventh] }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("avvisar dubblett ring-id", () => {
    const bad = { radars: [{ ...META, rings: [META.rings[0], META.rings[0], META.rings[1]] }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("avvisar ogiltig ringfärg (ej hex)", () => {
    const bad = { radars: [{ ...META, rings: [{ ...META.rings[0], color: "blå" }, META.rings[1]] }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("defaultar till standardringar när rings saknas", () => {
    const { rings, ...metaUtanRingar } = META;
    void rings;
    const parsed = parseRadarCatalog({ radars: [metaUtanRingar] }, "test");
    expect(parsed.radars[0].rings.map((r) => r.id)).toEqual(["anta", "prova", "bevaka", "avvakta"]);
  });

  it("assertRadarIntegrity kastar för okänd ring", () => {
    expect(() => assertRadarIntegrity(META, [{ ...BLIP, ring: "finns-ej" }])).toThrow(/ring/i);
  });

  it("avvisar ogiltig ring via radarInputSchema", () => {
    const parsed = radarInputSchema.safeParse({ meta: META, blips: [{ ...BLIP, ring: "köp" }] });
    expect(parsed.success).toBe(false);
  });

  it("assertRadarIntegrity kastar för okänt segment", () => {
    expect(() => assertRadarIntegrity(META, [{ ...BLIP, segmentId: "finns-ej" }])).toThrow(
      /segment/i,
    );
  });

  it("assertRadarIntegrity kastar för dubblett-blip-id", () => {
    expect(() => assertRadarIntegrity(META, [BLIP, BLIP])).toThrow(/unik/i);
  });

  it("assertRadarIntegrity accepterar giltiga blips", () => {
    expect(() => assertRadarIntegrity(META, [BLIP])).not.toThrow();
  });

  it("tillåter areaSlugs på en blip", () => {
    const parsed = radarInputSchema.safeParse({
      meta: META,
      blips: [{ ...BLIP, areaSlugs: ["digitalisering", "cyber"] }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.blips[0].areaSlugs).toEqual(["digitalisering", "cyber"]);
    }
  });

  it("tillåter blip utan areaSlugs (valfritt)", () => {
    const parsed = radarInputSchema.safeParse({ meta: META, blips: [BLIP] });
    expect(parsed.success).toBe(true);
  });
});
