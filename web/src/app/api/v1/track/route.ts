// web/src/app/api/v1/track/route.ts
//
// Publik insamlingsendpoint. Klienten skickar presentationskontext; servern
// härleder IP, UA, tid och geo (se build-visit). Beacon — fel sväljs tyst.
import { NextRequest } from "next/server";

import { buildVisit } from "@/lib/analytics/build-visit";
import { trackPayloadSchema } from "@/lib/analytics/track-schema";
import { getVisitorSalt } from "@/lib/admin/config";
import { getAnalyticsStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() ?? "";
  return req.headers.get("x-real-ip")?.trim() ?? "";
}

function headerCountry(req: NextRequest): string | null {
  return (
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("x-geo-country")
  );
}

export async function POST(req: NextRequest) {
  try {
    const parsed = trackPayloadSchema.safeParse(await req.json());
    if (!parsed.success) return new Response(null, { status: 400 });

    const visit = buildVisit({
      payload: parsed.data,
      now: Date.now(),
      ip: clientIp(req),
      uaRaw: req.headers.get("user-agent"),
      clientHints: {
        platform: req.headers.get("sec-ch-ua-platform"),
        platformVersion: req.headers.get("sec-ch-ua-platform-version"),
        mobile: req.headers.get("sec-ch-ua-mobile"),
      },
      headerCountry: headerCountry(req),
      ownHost: req.headers.get("host"),
      visitorSalt: getVisitorSalt(),
    });

    getAnalyticsStore().record(visit);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api/track] kunde inte logga besök", error);
    return new Response(null, { status: 204 });
  }
}
