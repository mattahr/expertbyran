import { z } from "zod";

import { defaultRings } from "@/lib/radar/rings";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-06-03T00:00:00.000Z).",
  });

// Delas med klientvalideringen i RadarAdmin så reglerna inte driftar isär.
export const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const hexColorSchema = z.string().regex(HEX_COLOR_RE, "Färg måste vara en hex-kod (#rrggbb).");

const segmentSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
});

// En ring är per-radar-data: id (referens från blips), etikett, kort beskrivning
// och färg. Ordningen i arrayen är inre→yttre (inre = mest mogen).
export const ringDefSchema = z.object({
  id: slugSchema,
  label: z.string().min(1),
  blurb: z.string().min(1),
  color: hexColorSchema,
});

export type Ring = z.infer<typeof ringDefSchema>;

export const radarMetaSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    date: isoDateTimeSchema,
    segments: z.array(segmentSchema).min(4).max(6),
    // Saknas ringar (äldre data, legacy-import, sparsam API-payload) faller vi
    // tillbaka på standarduppsättningen.
    rings: z.array(ringDefSchema).min(2).max(6).default(defaultRings),
  })
  .superRefine((meta, ctx) => {
    const seenSegments = new Set<string>();
    meta.segments.forEach((segment, index) => {
      if (seenSegments.has(segment.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments", index, "id"],
          message: "Segment-id måste vara unikt inom radarn.",
        });
      }
      seenSegments.add(segment.id);
    });

    const seenRings = new Set<string>();
    meta.rings.forEach((ring, index) => {
      if (seenRings.has(ring.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rings", index, "id"],
          message: "Ring-id måste vara unikt inom radarn.",
        });
      }
      seenRings.add(ring.id);
    });
  });

export const blipSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  segmentId: slugSchema,
  ring: slugSchema,
  description: z.string().min(1),
  implications: z.string().min(1),
  areaSlugs: z.array(slugSchema).optional(),
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
// och ring-integritet kontrolleras av assertRadarIntegrity i storen).
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

// Kontrollerar att varje blip pekar på ett segment och en ring som finns, och att
// blip-id är unika. Kastar Error (API mappar till 400) vid brott.
export function assertRadarIntegrity(meta: RadarMeta, blips: Blip[]): void {
  const segmentIds = new Set(meta.segments.map((segment) => segment.id));
  const ringIds = new Set(meta.rings.map((ring) => ring.id));
  const seenBlipIds = new Set<string>();
  for (const blip of blips) {
    if (!segmentIds.has(blip.segmentId)) {
      throw new Error(`Blip '${blip.id}' refererar okänt segment '${blip.segmentId}'.`);
    }
    if (!ringIds.has(blip.ring)) {
      throw new Error(`Blip '${blip.id}' refererar okänd ring '${blip.ring}'.`);
    }
    if (seenBlipIds.has(blip.id)) {
      throw new Error(`Blip-id '${blip.id}' måste vara unikt inom radarn.`);
    }
    seenBlipIds.add(blip.id);
  }
}
