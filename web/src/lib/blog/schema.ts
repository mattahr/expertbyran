import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum måste vara i formatet YYYY-MM-DD.")
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara ett giltigt datum.",
  });

const blogPostEntrySchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  date: isoDateSchema,
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
