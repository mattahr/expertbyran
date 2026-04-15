import { NextRequest } from "next/server";
import { readBlogDataFromDisk, writeBlogDataToDisk, readBlogPostMarkdownFromDisk, writeBlogPostMarkdownToDisk, deleteBlogPostMarkdownFromDisk } from "@/lib/storage/disk-storage";
import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const catalog = await readBlogDataFromDisk();
    const post = catalog.posts.find((p) => p.slug === slug);

    if (!post) {
      return new Response(
        JSON.stringify({ error: `Blog post with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    const markdown = await readBlogPostMarkdownFromDisk(slug);

    return Response.json({ post, markdown });
  } catch (error) {
    console.error("[api] Failed to read blog post", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to read blog post" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const { slug } = await context.params;
    const { post, markdown } = await req.json() as { post?: BlogPostEntry; markdown?: string };

    const catalog = await readBlogDataFromDisk();
    const index = catalog.posts.findIndex((p) => p.slug === slug);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: `Blog post with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    // Update metadata if provided
    if (post) {
      // Check if slug is being changed
      if (post.slug !== slug) {
        // Check if new slug already exists
        if (catalog.posts.some((p) => p.slug === post.slug)) {
          return new Response(
            JSON.stringify({ error: `Blog post with slug ${post.slug} already exists` }),
            { status: 409, headers: { "content-type": "application/json" } },
          );
        }

        // Delete old markdown file
        await deleteBlogPostMarkdownFromDisk(slug);

        // Write new markdown file if markdown is provided
        if (markdown) {
          await writeBlogPostMarkdownToDisk(post.slug, markdown);
        } else {
          // Copy old content to new slug
          const oldMarkdown = await readBlogPostMarkdownFromDisk(slug);
          await writeBlogPostMarkdownToDisk(post.slug, oldMarkdown);
        }
      } else if (markdown) {
        // Just update markdown with same slug
        await writeBlogPostMarkdownToDisk(slug, markdown);
      }

      catalog.posts[index] = post;
      await writeBlogDataToDisk(catalog);
    } else if (markdown) {
      // Just update markdown
      await writeBlogPostMarkdownToDisk(slug, markdown);
    }

    const updatedPost = catalog.posts[index];
    const updatedMarkdown = markdown || await readBlogPostMarkdownFromDisk(updatedPost.slug);

    return Response.json({ success: true, data: { post: updatedPost, markdown: updatedMarkdown } });
  } catch (error) {
    console.error("[api] Failed to update blog post", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to update blog post" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const { slug } = await context.params;
    const catalog = await readBlogDataFromDisk();

    const index = catalog.posts.findIndex((p) => p.slug === slug);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: `Blog post with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    catalog.posts.splice(index, 1);
    await writeBlogDataToDisk(catalog);
    await deleteBlogPostMarkdownFromDisk(slug);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[api] Failed to delete blog post", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to delete blog post" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}
