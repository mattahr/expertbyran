"use client";

import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import styles from "./MobileNav.module.css";

type NavItem = {
  href: Route | string;
  label: string;
};

type MobileNavProps = {
  items: readonly NavItem[];
  currentPath: string;
  siteTagline?: string;
};

export function MobileNav({ items, currentPath, siteTagline }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }

      if (event.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>("button, a[href]"),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          if (active === first || !panelRef.current.contains(active)) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !panelRef.current.contains(active)) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKey);

    queueMicrotask(() => closeRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <div className={styles.root}>
      {/* aria-label hålls konstant; aria-expanded bär state.
          Dynamisk label skulle kollidera med stängknappen i testselektorer. */}
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label="Öppna meny"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.triggerIcon} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>

      {open ? (
        <>
          <div
            data-testid="mobilenav-backdrop"
            className={styles.backdrop}
            onClick={close}
            aria-hidden
          />
          <nav
            ref={panelRef}
            id={panelId}
            className={styles.panel}
            aria-label="Mobilmeny"
          >
            <div className={styles.panelHeader}>
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                aria-label="Stäng meny"
                onClick={close}
              >
                ×
              </button>
            </div>
            <div className={styles.links}>
              {items.map((item) => {
                const isActive = item.href === currentPath;
                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={isActive ? `${styles.link} ${styles.linkActive}` : styles.link}
                    aria-current={isActive ? "page" : undefined}
                    onClick={close}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            {siteTagline ? <div className={styles.footer}>{siteTagline}</div> : null}
          </nav>
        </>
      ) : null}
    </div>
  );
}
