"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./RevealOnScroll.module.css";

type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  delay?: number;
};

export function RevealOnScroll({
  children,
  className,
  as: Tag = "div",
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(() => {
    if (typeof window === "undefined") return false;
    return !("IntersectionObserver" in window);
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              window.setTimeout(() => setRevealed(true), delay);
            } else {
              setRevealed(true);
            }
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const combinedClassName = className ? `${styles.reveal} ${className}` : styles.reveal;

  const commonProps = {
    ref: ref as React.Ref<HTMLElement>,
    className: combinedClassName,
    "data-revealed": String(revealed),
  };

  if (Tag === "section") return <section {...(commonProps as unknown as React.HTMLAttributes<HTMLElement>)}>{children}</section>;
  if (Tag === "article") return <article {...(commonProps as unknown as React.HTMLAttributes<HTMLElement>)}>{children}</article>;
  return <div {...(commonProps as unknown as React.HTMLAttributes<HTMLElement>)}>{children}</div>;
}
