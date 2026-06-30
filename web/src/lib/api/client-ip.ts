// web/src/lib/api/client-ip.ts
//
// Härleder klientens IP på ett proxy-säkert sätt. Den VÄNSTRASTE posten i
// X-Forwarded-For är klientstyrd (spoofbar) — en betrodd reverse proxy
// (nginx `$proxy_add_x_forwarded_for`, Cloudflare m.fl.) APPENDAR den verkliga
// IP:n till höger och sätter X-Real-IP. Vi föredrar därför X-Real-IP och faller
// annars tillbaka på den HÖGRASTE XFF-posten (närmaste betrodda hopp).
//
// OBS: bakom flera proxys, eller vid direkt exponering utan proxy, kan headern
// fortfarande vara opålitlig — sätt X-Real-IP i din proxy för korrekt resultat.
import type { NextRequest } from "next/server";

export function clientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "";
}
