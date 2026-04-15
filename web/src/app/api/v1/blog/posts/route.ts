import { NextRequest } from "next/server";
import { readBlogDataFromDisk, writeBlogDataToDisk, readBlogPostMarkdownFromDisk, writeBlogPostMarkdownToDisk } from "@/lib/storage/disk-storage";
import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await readBlogDataFromDisk();
    return Response.json({ posts: catalog.posts });
  } catch (error) {
    console.error("[api] Failed to read blog posts", error);
    return new Response(
      JSON.stringify({ error: "Failed to read blog posts" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const { post, markdown } = await req.json() as { post: BlogPostEntry; markdown: string };

    if (!post || !markdown) {
      return new Response(
        JSON.stringify({ error: "Both 'post' metadata and 'markdown' content are required" }),
        { status: 400, headers: { "content-type": "application/json" } },
      );
    }

    const catalog = await readBlogDataFromDisk();

    // Check if post already exists
    if (catalog.posts.some((p) => p.slug === post.slug)) {
      return new Response(
        JSON.stringify({ error: `Blog post with slug ${post.slug} already exists` }),
        { status: 409, headers: { "content-type": "application/json" } },
      );
    }

    catalog.posts.push(post);
    await writeBlogDataToDisk(catalog);
    await writeBlogPostMarkdownToDisk(post.slug, markdown);

    return Response.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("[api] Failed to create blog post", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create blog post" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}
