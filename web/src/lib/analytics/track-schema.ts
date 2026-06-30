// web/src/lib/analytics/track-schema.ts
import { z } from "zod";

const dimension = z.object({
  w: z.number().int().nonnegative().max(100000),
  h: z.number().int().nonnegative().max(100000),
});

export const trackPayloadSchema = z.object({
  path: z.string().min(1).max(2048),
  referrer: z.string().max(2048).nullish(),
  lang: z.string().max(64).nullish(),
  languages: z.array(z.string().max(64)).max(20).nullish(),
  timezone: z.string().max(64).nullish(),
  screen: dimension.nullish(),
  viewport: dimension.nullish(),
  dpr: z.number().positive().max(10).nullish(),
  utm: z
    .object({
      source: z.string().max(256).nullish(),
      medium: z.string().max(256).nullish(),
      campaign: z.string().max(256).nullish(),
    })
    .nullish(),
});

export type TrackPayload = z.infer<typeof trackPayloadSchema>;
