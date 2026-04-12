import { getSiteData } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteData({ fresh: true });

    return Response.json(
      {
        ok: true,
        experts: data.experts.length,
        teams: data.teams.length,
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
