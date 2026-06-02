// web/src/app/api/v1/blog/posts/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getBlogStore().listPosts();
    return Response.json({ posts });
  } catch (error) {
    console.error("[api] Failed to read blog posts", error);
    return Response.json({ error: "Failed to read blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { post, markdown } = (await req.json()) as {
      post: BlogPostEntry;
      markdown: string;
    };
    if (!post || !markdown) {
      return Response.json(
        { error: "Both 'post' metadata and 'markdown' content are required" },
        { status: 400 },
      );
    }
    const created = await getBlogStore().createPost(post, markdown);
    revalidateTag("blog", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create blog post" },
      { status: 400 },
    );
  }
}
