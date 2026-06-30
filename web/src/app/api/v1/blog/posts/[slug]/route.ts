// web/src/app/api/v1/blog/posts/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getBlogStore().getPost(slug);
    if (!result) {
      return Response.json({ error: `Blog post with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ post: result.meta, markdown: result.markdown });
  } catch (error) {
    console.error("[api] Failed to read blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read blog post" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const { slug } = await context.params;
    const { post, markdown } = (await req.json()) as {
      post?: BlogPostEntry;
      markdown?: string;
    };
    const updated = await getBlogStore().updatePost(slug, { meta: post, markdown });
    const full = await getBlogStore().getPost(updated.slug);
    revalidateTag("blog", "max");
    return Response.json({
      success: true,
      data: { post: updated, markdown: full?.markdown ?? "" },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update blog post" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const { slug } = await context.params;
    await getBlogStore().deletePost(slug);
    revalidateTag("blog", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete blog post" },
      { status: 400 },
    );
  }
}
