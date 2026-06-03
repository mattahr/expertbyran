import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-05-29T10:00:00.000Z).",
  });

const foresightEntrySchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    date: isoDateTimeSchema,
    authorSlug: slugSchema.optional(),
    authorName: z.string().min(1).optional(),
    authorRole: z.string().min(1).optional(),
    areaSlugs: z.array(slugSchema).min(1),
    excerpt: z.string().min(1),
    horizon: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.authorSlug || data.authorName), {
    message: "Minst en av authorSlug eller authorName måste anges.",
    path: ["authorName"],
  });

export const foresightCatalogSchema = z
  .object({ foresights: z.array(foresightEntrySchema) })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.foresights.forEach((entry, index) => {
      if (seen.has(entry.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foresights", index, "slug"],
          message: "Foresightens slug måste vara unik.",
        });
      }
      seen.add(entry.slug);
    });
  });

export type ForesightEntry = z.infer<typeof foresightEntrySchema>;
export type ForesightCatalog = z.infer<typeof foresightCatalogSchema>;

export function formatForesightIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export function parseForesightCatalog(input: unknown, source: string): ForesightCatalog {
  const result = foresightCatalogSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid foresight-data from ${source}`, formatForesightIssues(result.error.issues));
    throw new Error(`Invalid foresight-data from ${source}`);
  }
  return result.data;
}
