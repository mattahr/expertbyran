import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-04-13T10:00:00.000Z).",
  });

const blogPostEntrySchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  date: isoDateTimeSchema,
  authorSlug: slugSchema,
  areaSlugs: z.array(slugSchema).min(1),
  excerpt: z.string().min(1),
});

export const blogCatalogSchema = z
  .object({
    posts: z.array(blogPostEntrySchema),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.posts.forEach((post, index) => {
      if (seen.has(post.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["posts", index, "slug"],
          message: "Bloggpostens slug måste vara unik.",
        });
      }

      seen.add(post.slug);
    });
  });

export type BlogPostEntry = z.infer<typeof blogPostEntrySchema>;
export type BlogCatalog = z.infer<typeof blogCatalogSchema>;

export function formatBlogIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export function parseBlogCatalog(input: unknown, source: string): BlogCatalog {
  const result = blogCatalogSchema.safeParse(input);

  if (!result.success) {
    const issues = formatBlogIssues(result.error.issues);
    console.error(`[schema] Invalid blog-data from ${source}`, issues);
    throw new Error(`Invalid blog-data from ${source}`);
  }

  return result.data;
}
