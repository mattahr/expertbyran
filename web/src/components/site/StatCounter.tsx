"use client";

import { useEffect, useRef, useState } from "react";

type StatCounterProps = {
  value: number;
  durationMs?: number;
  renderValue?: (current: number) => string;
  className?: string;
};

export function StatCounter({
  value,
  durationMs = 1200,
  renderValue = (n) => String(n),
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const [hasObserver, setHasObserver] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window) || !window.IntersectionObserver) {
      setHasObserver(false);
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.disconnect();

        if (prefersReduced) {
          setDisplay(value);
          return;
        }

        const start = performance.now();
        const step = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(1, elapsed / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            setDisplay(value);
          }
        };
        requestAnimationFrame(step);
        return;
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {renderValue(hasObserver ? display : value)}
    </span>
  );
}
