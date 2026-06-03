import { z } from "zod";

import { RING_IDS } from "@/lib/radar/rings";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-06-03T00:00:00.000Z).",
  });

const segmentSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
});

export const ringSchema = z.enum(RING_IDS);

export const radarMetaSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    date: isoDateTimeSchema,
    segments: z.array(segmentSchema).min(4).max(6),
  })
  .superRefine((meta, ctx) => {
    const seen = new Set<string>();
    meta.segments.forEach((segment, index) => {
      if (seen.has(segment.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments", index, "id"],
          message: "Segment-id måste vara unikt inom radarn.",
        });
      }
      seen.add(segment.id);
    });
  });

export const blipSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  segmentId: slugSchema,
  ring: ringSchema,
  description: z.string().min(1),
  implications: z.string().min(1),
});

export const radarCatalogSchema = z
  .object({ radars: z.array(radarMetaSchema) })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.radars.forEach((radar, index) => {
      if (seen.has(radar.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["radars", index, "slug"],
          message: "Radarns slug måste vara unik.",
        });
      }
      seen.add(radar.slug);
    });
  });

export const radarBlipsFileSchema = z.object({ blips: z.array(blipSchema) });

// Används av API:et som body-validering vid POST/PUT (formvalidering; segment-
// integritet kontrolleras av assertRadarIntegrity i storen).
export const radarInputSchema = z.object({
  meta: radarMetaSchema,
  blips: z.array(blipSchema),
});

export type Segment = z.infer<typeof segmentSchema>;
export type RadarMeta = z.infer<typeof radarMetaSchema>;
export type Blip = z.infer<typeof blipSchema>;
export type RadarCatalog = z.infer<typeof radarCatalogSchema>;
export type RadarDetail = { meta: RadarMeta; blips: Blip[] };

function formatRadarIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export function parseRadarCatalog(input: unknown, source: string): RadarCatalog {
  const result = radarCatalogSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid radar-data from ${source}`, formatRadarIssues(result.error.issues));
    throw new Error(`Invalid radar-data from ${source}`);
  }
  return result.data;
}

export function parseRadarBlips(input: unknown, source: string): { blips: Blip[] } {
  const result = radarBlipsFileSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid radar blips from ${source}`, formatRadarIssues(result.error.issues));
    throw new Error(`Invalid radar blips from ${source}`);
  }
  return result.data;
}

// Kontrollerar att varje blip pekar på ett segment som finns och att blip-id är unika.
// Kastar Error (API mappar till 400) vid brott.
export function assertRadarIntegrity(meta: RadarMeta, blips: Blip[]): void {
  const segmentIds = new Set(meta.segments.map((segment) => segment.id));
  const seenBlipIds = new Set<string>();
  for (const blip of blips) {
    if (!segmentIds.has(blip.segmentId)) {
      throw new Error(`Blip '${blip.id}' refererar okänt segment '${blip.segmentId}'.`);
    }
    if (seenBlipIds.has(blip.id)) {
      throw new Error(`Blip-id '${blip.id}' måste vara unikt inom radarn.`);
    }
    seenBlipIds.add(blip.id);
  }
}
