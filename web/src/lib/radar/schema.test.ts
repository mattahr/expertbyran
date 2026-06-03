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
});
