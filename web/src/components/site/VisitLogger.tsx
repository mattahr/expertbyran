"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function VisitLogger() {
  const pathname = usePathname();
  const prev = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (pathname === prev.current || pathname === "/log") return;
    prev.current = pathname;

    fetch("/api/v1/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        path: pathname,
        method: "GET",
        userAgent: navigator.userAgent,
        ip: "",
        referer: document.referrer,
        lang: navigator.language,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
