// web/src/app/api/v1/rerender/route.ts
//
// Underhållsendpoint: renderar om lagrad HTML för rader vars renderer_version
// avviker från aktuell MARKDOWN_RENDERER_VERSION (markdown är källan, HTML är
// härledd). Körs efter deploy av en ny renderarversion; bootstrap loggar en
// varning när det behövs. Går direkt mot databasen — detta är en
// förvaltningsoperation under store-abstraktionen.
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import { MARKDOWN_RENDERER_VERSION, renderBlogMarkdown } from "@/lib/blog/markdown";
import { getDb } from "@/lib/db/client";

export const dynamic = "force-dynamic";

async function rerenderTable(table: "blog_posts" | "foresights"): Promise<number> {
  const db = getDb();
  const rows = db
    .prepare(`SELECT slug, markdown FROM ${table} WHERE renderer_version <> ?`)
    .all(MARKDOWN_RENDERER_VERSION) as { slug: string; markdown: string }[];

  for (const row of rows) {
    const html = await renderBlogMarkdown(row.markdown);
    db.prepare(
      `UPDATE ${table} SET html = ?, renderer_version = ?, updated_at = ? WHERE slug = ?`,
    ).run(html, MARKDOWN_RENDERER_VERSION, new Date().toISOString(), row.slug);
  }
  return rows.length;
}

export async function POST(req: NextRequest) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const blog = await rerenderTable("blog_posts");
    const foresights = await rerenderTable("foresights");
    if (blog > 0) revalidateTag("blog", "max");
    if (foresights > 0) revalidateTag("foresight", "max");
    return Response.json({
      ok: true,
      rerendered: { blog, foresights },
      rendererVersion: MARKDOWN_RENDERER_VERSION,
    });
  } catch (error) {
    console.error("[api] Omrendering misslyckades", error);
    return Response.json({ error: "Omrendering misslyckades" }, { status: 500 });
  }
}
