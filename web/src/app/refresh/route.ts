import { getBlogData } from "@/lib/blog/store";
import { getSiteData } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [siteData, blogData] = await Promise.all([
      getSiteData({ fresh: true }),
      getBlogData({ fresh: true }),
    ]);

    return Response.json(
      {
        ok: true,
        experts: siteData.experts.length,
        teams: siteData.teams.length,
        posts: blogData.catalog.posts.length,
        refreshedAt: new Date().toISOString(),
      },
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown refresh error",
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
