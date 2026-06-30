"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Klient-beacon. Skickar bara lättfångad presentationskontext; servern är
// auktoritativ för IP, UA, tid och geo (se /api/v1/track + build-visit).
export function VisitLogger() {
  const pathname = usePathname();
  const prev = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!pathname || pathname === prev.current) return;
    if (pathname.startsWith("/admin")) return; // logga inte adminvyer
    prev.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      lang: navigator.language || null,
      languages: navigator.languages ? Array.from(navigator.languages) : null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      screen: { w: window.screen.width, h: window.screen.height },
      viewport: { w: window.innerWidth, h: window.innerHeight },
      dpr: window.devicePixelRatio || null,
      utm:
        utmSource || utmMedium || utmCampaign
          ? { source: utmSource, medium: utmMedium, campaign: utmCampaign }
          : null,
    };

    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/v1/track", new Blob([body], { type: "application/json" }));
      } else {
        void fetch("/api/v1/track", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // beacon ska aldrig störa besökaren
    }
  }, [pathname]);

  return null;
}
