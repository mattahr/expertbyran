"use client";

import { useEffect, useState } from "react";

import styles from "./ReadingProgress.module.css";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
      setProgress(ratio * 100);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={styles.root} aria-hidden>
      <div
        data-testid="reading-progress-bar"
        className={styles.bar}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
