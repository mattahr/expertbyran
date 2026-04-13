# Responsiv omdesign av web/ — Implementationsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Göra `web/`-webbplatsen fullt responsiv (mobil/tablet/desktop), lägga till hamburger-meny, utvidga färgpaletten med marin + guld, och polera alla sidtyper med subtila scroll-reveal-animationer — utan att ändra tekniska stacken eller datamodellen.

**Architecture:** Mobile-first CSS med tre breakpoints (640/1024/1280px). Ny client component för hamburger-navigering, nya wrapper-komponenter för scroll-reveal och läsprogress, utvidgat färgsystem i `globals.css`. Befintliga server-komponenter förblir server-komponenter. Ingen ny dependency. Ingen ändring i `site-data.json` eller `schema.ts`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, vanilla CSS + CSS Modules, Vitest + `@testing-library/react` (om behövs — annars `renderToStaticMarkup`), IntersectionObserver (built-in).

**Spec:** [docs/superpowers/specs/2026-04-14-web-responsive-redesign.md](../specs/2026-04-14-web-responsive-redesign.md)

---

## Filöversikt

**Nya filer:**

- `web/src/components/site/MobileNav.tsx` — hamburger + slide-in-panel (client component)
- `web/src/components/site/MobileNav.module.css`
- `web/src/components/site/MobileNav.test.tsx`
- `web/src/components/site/RevealOnScroll.tsx` — wrapper som sätter `data-revealed` (client component)
- `web/src/components/site/RevealOnScroll.module.css`
- `web/src/components/site/RevealOnScroll.test.tsx`
- `web/src/components/site/StatCounter.tsx` — animerad räknare (client component)
- `web/src/components/site/StatCounter.test.tsx`
- `web/src/components/site/ReadingProgress.tsx` — läsprogress-bar för bloggartiklar (client component)
- `web/src/components/site/ReadingProgress.module.css`
- `web/src/components/site/ReadingProgress.test.tsx`
- `web/src/components/site/CTAButton.tsx` — knappkomponent (server-safe)
- `web/src/components/site/CTAButton.module.css`
- `web/src/components/site/Pill.tsx` — tag/pill-komponent (server-safe)
- `web/src/components/site/Pill.module.css`
- `web/src/components/site/Logo.tsx` — liten SVG-logomark

**Uppdaterade filer:**

- `web/src/app/globals.css` — nya färgtokens, mobile-first media queries, basstorlek 16px
- `web/src/components/site/SiteChrome.tsx` — integrerar MobileNav + Logo, uppdaterad footer
- `web/src/components/site/site.module.css` — stor responsive-omskrivning, nya animationer
- `web/src/components/site/GridCell.tsx` (och dess styling i `site.module.css`) — hover-polish
- `web/src/app/page.tsx` — "Utvalda experter"-sektion, RevealOnScroll, StatCounter
- `web/src/app/experter/[slug]/page.tsx` — marin-sidebar
- `web/src/app/blogg/page.tsx` — featured-first layout
- `web/src/app/blogg/[slug]/page.tsx` — ReadingProgress, pills för meta
- Övriga `page.tsx`-filer — RevealOnScroll-wrappa sektioner där relevant

**Oförändrade (explicit icke-förändring):**

- `web/site-data.json`
- `web/src/lib/content/schema.ts`, `store.ts`, `query.ts`
- `web/src/lib/blog/*`
- `web/next.config.ts`, `tsconfig.json`, `package.json`
- `web/Dockerfile`, `.github/workflows/`
- `web/docs/`

---

## Task 1: Utöka färgsystem och globala tokens

**Files:**

- Modify: `web/src/app/globals.css`

- [ ] **Step 1: Uppdatera globals.css med nya färgtokens och basstorlek**

Ersätt hela `:root {}`-blocket och uppdatera `body`-regeln:

```css
:root {
  /* Warm neutrals (befintliga) */
  --white: #ffffff;
  --black: #1c1917;
  --gray-100: #f8f6f3;
  --gray-200: #ebe8e3;
  --gray-300: #d6d1ca;
  --gray-400: #a39d94;
  --gray-500: #716b63;
  --gray-600: #504a43;

  /* Primär — rust-orange */
  --accent: #c26a3f;
  --accent-light: rgba(194, 106, 63, 0.08);
  --accent-border: rgba(194, 106, 63, 0.25);
  --accent-hover: #a85a34;

  /* Sekundär — marin */
  --marine: #1e3a5f;
  --marine-light: rgba(30, 58, 95, 0.08);
  --marine-border: rgba(30, 58, 95, 0.25);
  --marine-hover: #17304d;

  /* Tertiär — guld (sparsamt) */
  --gold: #e8b84a;
  --gold-deep: #8a6b1e;
  --gold-light: rgba(232, 184, 74, 0.15);

  /* Layout */
  --content-width: min(1120px, calc(100vw - 2rem));
  --header-height: 56px;
}

@media (min-width: 640px) {
  :root {
    --content-width: min(1120px, calc(100vw - 3rem));
  }
}

@media (min-width: 1024px) {
  :root {
    --header-height: 64px;
  }
}
```

Uppdatera `body`-regeln (ersätt hela body-blocket):

```css
body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--black);
  background: var(--gray-100);
  font-family: var(--font-body), -apple-system, system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

Ta bort den gamla `@media (max-width: 768px)`-regeln som ändrar `--content-width` (den är nu ersatt av mobile-first-versionen ovan).

- [ ] **Step 2: Verifiera att befintliga tester fortfarande passerar**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna (render-smoke, schema, store, refresh).

- [ ] **Step 3: Verifiera byggen går igenom**

Kör: `cd web && npm run lint && npx tsc --noEmit`
Expected: Inga fel.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/globals.css
git commit -m "Utöka färgsystem: marin och guld som sekundära accenter

Lägger till CSS-tokens för marinblå (inspirerat av Riksrevisionen) och guld för
badges/featured, samt en logisk gruppering av primära/sekundära/tertiära färger.
Basstorlek upp till 16px för bättre mobilläsbarhet.
"
```

---

## Task 2: Mobile-first refaktorisering av site.module.css

Konvertera befintliga `max-width: 768px`-queries till mobile-first med tre breakpoints. Detta är en strukturell omflytt — logiken bevaras men organisationen ändras.

**Files:**

- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Refaktorisera till mobile-first**

Ersätt hela filens layout- och responsive-delar (behåll keyframes, behåll färger som redan använder tokens). Strategi: basreglerna blir mobil-standard, sedan tillägg vid `min-width`.

Specifikt:

1. Ta bort hela `@media (max-width: 768px) { ... }`-blocket i slutet av filen.
2. Uppdatera följande basregler så att de matchar mobil-standardstilen (flytta det som tidigare låg i mobile-overrides till basreglerna):

```css
.headerInner {
  width: var(--content-width);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  gap: 16px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero {
  padding: 72px 0 56px;
  position: relative;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 40px 0;
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 72px;
  animation: fadeUp 0.6s ease-out 0.2s both;
}

.detailLayout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: start;
}

.detailSidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--white);
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
}

.twoCol {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding: 32px 0;
  border-top: 1px solid var(--gray-200);
}

.section {
  padding-bottom: 72px;
  animation: fadeUp 0.6s ease-out both;
}
```

3. Lägg till ett helt nytt block längst ner i filen (efter `/* === Blog content === */`-blocket):

```css
/* === Responsive breakpoints (mobile-first) === */

@media (min-width: 640px) {
  .hero {
    padding: 96px 0 80px;
  }

  .grid {
    grid-template-columns: 1fr 1fr;
  }

  .stats {
    flex-direction: row;
    gap: 64px;
    padding: 48px 0;
    margin-bottom: 88px;
  }

  .twoCol {
    grid-template-columns: 1fr 1fr;
    gap: 48px;
  }

  .section {
    padding-bottom: 88px;
  }
}

@media (min-width: 1024px) {
  .nav {
    gap: 32px;
  }

  .hero {
    padding: 120px 0 100px;
  }

  .hero::before {
    content: '';
    position: absolute;
    top: -56px;
    left: -30%;
    width: 70%;
    height: 360px;
    background: radial-gradient(ellipse at center, var(--accent-light) 0%, transparent 70%);
    pointer-events: none;
    z-index: -1;
  }

  .detailLayout {
    grid-template-columns: 280px 1fr;
    gap: 64px;
  }

  .detailSidebar {
    position: sticky;
    top: calc(var(--header-height) + 16px);
  }

  .stats {
    margin-bottom: 100px;
  }

  .section {
    padding-bottom: 100px;
  }
}
```

4. Ta bort den gamla `.hero::before`-regeln ur basblocket (den finns nu endast i `min-width: 1024px`-blocket).

5. Behåll `.navLink::after`-reglerna i basblocket som de är — vi hanterar mobilvisning i nästa task genom att dölja själva nav-menyn.

- [ ] **Step 2: Kör render-smoke-testerna**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna. Sidorna renderar fortfarande utan fel.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/site/site.module.css
git commit -m "Refaktorisera site-CSS till mobile-first med tre breakpoints

Basreglerna är nu mobil-standard. Tillägg vid 640px (tablet) och 1024px (desktop).
Ingen visuell förändring på desktop; mobil får korrekt spacing istället för den
gamla kolumn-kollapsande headern."
```

---

## Task 3: Logo-komponent (SVG-mark)

**Files:**

- Create: `web/src/components/site/Logo.tsx`

- [ ] **Step 1: Skapa Logo.tsx**

```tsx
type LogoProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

export function Logo({ size = 16, className, ...rest }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={rest["aria-hidden"] ?? true}
      focusable="false"
    >
      <circle cx="8" cy="8" r="7" fill="var(--accent)" />
      <circle cx="8" cy="8" r="2.5" fill="var(--marine)" />
    </svg>
  );
}
```

- [ ] **Step 2: Verifiera typkontroll**

Kör: `cd web && npx tsc --noEmit`
Expected: Inga fel.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/site/Logo.tsx
git commit -m "Lägg till Logo-komponent (SVG-mark)

Enkel geometrisk logomark: rust-cirkel med marin-prick. Används i header och
kan återanvändas som favicon-underlag."
```

---

## Task 4: MobileNav — hamburger och slide-in-panel (med tester)

**Files:**

- Create: `web/src/components/site/MobileNav.tsx`
- Create: `web/src/components/site/MobileNav.module.css`
- Create: `web/src/components/site/MobileNav.test.tsx`

- [ ] **Step 1: Skriv MobileNav.test.tsx (failing tests)**

```tsx
// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileNav } from "./MobileNav";

const navigation = [
  { href: "/om-oss" as const, label: "Om byrån" },
  { href: "/experter" as const, label: "Våra experter" },
  { href: "/blogg" as const, label: "Blogg" },
];

describe("MobileNav", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("renderar hamburger-knappen stängd som default", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    const button = screen.getByRole("button", { name: /öppna meny/i });
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("öppnar panelen vid klick på hamburger", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    const button = screen.getByRole("button", { name: /öppna meny/i });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: /stäng meny/i }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("navigation", { name: /mobilmeny/i })).toBeDefined();
  });

  it("låser body-scroll vid öppen panel", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("återställer body-scroll vid stängning", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    const open = screen.getByRole("button", { name: /öppna meny/i });
    fireEvent.click(open);
    const close = screen.getByRole("button", { name: /stäng meny/i });
    fireEvent.click(close);
    expect(document.body.style.overflow).toBe("");
  });

  it("stänger vid ESC-knapp", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("button", { name: /öppna meny/i }).getAttribute("aria-expanded")).toBe("false");
  });

  it("stänger vid klick på backdrop", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));
    const backdrop = screen.getByTestId("mobilenav-backdrop");
    fireEvent.click(backdrop);
    expect(screen.getByRole("button", { name: /öppna meny/i }).getAttribute("aria-expanded")).toBe("false");
  });

  it("markerar aktuell sida som aktiv", () => {
    render(<MobileNav items={navigation} currentPath="/experter" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));
    const activeLink = screen.getByRole("link", { name: "Våra experter" });
    expect(activeLink.getAttribute("aria-current")).toBe("page");
  });
});
```

- [ ] **Step 2: Kör testerna för att se dem fallera**

Kör: `cd web && npm run test -- --run MobileNav`
Expected: FAIL med "Cannot find module './MobileNav'".

- [ ] **Step 3: Skriv MobileNav.module.css**

```css
.root {
  display: flex;
  align-items: center;
}

.trigger {
  background: transparent;
  border: 0;
  padding: 8px;
  margin: -8px;
  cursor: pointer;
  color: var(--black);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 180ms;
}

.trigger:hover {
  background: var(--gray-200);
}

.triggerIcon {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  width: 22px;
}

.triggerIcon span {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: transform 200ms ease, opacity 200ms ease;
}

.triggerIcon span:nth-child(1) {
  width: 22px;
}

.triggerIcon span:nth-child(2) {
  width: 22px;
}

.triggerIcon span:nth-child(3) {
  width: 14px;
  background: var(--accent);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(28, 25, 23, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 40;
  animation: fadeIn 200ms ease-out;
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 360px;
  background: var(--gray-100);
  z-index: 50;
  display: flex;
  flex-direction: column;
  padding: 20px 24px 24px;
  box-shadow: -12px 0 40px rgba(28, 25, 23, 0.12);
  animation: slideIn 260ms cubic-bezier(0.2, 0.9, 0.3, 1);
}

.panelHeader {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.close {
  background: transparent;
  border: 0;
  padding: 8px;
  margin: -8px;
  cursor: pointer;
  color: var(--black);
  font-size: 22px;
  line-height: 1;
  border-radius: 8px;
  transition: background 180ms;
}

.close:hover {
  background: var(--gray-200);
}

.links {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.link {
  font-family: var(--font-display), Georgia, serif;
  font-size: 22px;
  color: var(--black);
  text-decoration: none;
  padding: 4px 0;
  position: relative;
  transition: color 180ms;
}

.link:hover {
  color: var(--accent);
}

.linkActive {
  font-weight: 500;
  color: var(--accent);
}

.linkActive::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--accent);
  border-radius: 2px;
}

.footer {
  font-size: 12px;
  color: var(--gray-500);
  letter-spacing: 0.04em;
  padding-top: 24px;
  border-top: 1px solid var(--gray-200);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .backdrop,
  .panel {
    animation-duration: 0.01ms;
  }
}

@media (min-width: 1024px) {
  .root {
    display: none;
  }
}
```

- [ ] **Step 4: Skriv MobileNav.tsx**

```tsx
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

  const close = useCallback(() => {
    setOpen(false);
    // återställ fokus på trigger för tangentbordsnavigering
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
    };
    document.addEventListener("keydown", onKey);

    // fokusera stängknappen när panelen öppnas
    queueMicrotask(() => closeRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <div className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={open ? "Stäng meny" : "Öppna meny"}
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
                aria-expanded={open}
                aria-controls={panelId}
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
```

- [ ] **Step 5: Kontrollera att testning-dependencies finns**

Kör: `cd web && cat package.json | grep -E '"(@testing-library|jsdom)"'`

Om `@testing-library/react` eller `jsdom` saknas, installera som dev-dependencies:

```bash
cd web && npm install --save-dev @testing-library/react jsdom
```

Uppdatera `web/vitest.config.ts` (eller `vite.config.ts`/`vitest.workspace.ts` — leta i `web/` efter konfigurationsfilen) så att jsdom-tester kan köras. De flesta befintliga tester använder `// @vitest-environment node` per-fil, vilket nu blandas med `// @vitest-environment jsdom` per-fil. Ingen global konfiguration krävs om projektet redan stöder per-fil environment-override.

Om `vitest.config.ts` inte finns, skapa den med följande minimala innehåll:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 6: Kör testerna igen**

Kör: `cd web && npm run test -- --run MobileNav`
Expected: Alla 7 MobileNav-tester gröna.

- [ ] **Step 7: Kör alla tester för att säkerställa regression-frihet**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 8: Commit**

```bash
git add web/src/components/site/MobileNav.tsx web/src/components/site/MobileNav.module.css web/src/components/site/MobileNav.test.tsx web/package.json web/package-lock.json web/vitest.config.ts
git commit -m "Lägg till MobileNav: hamburger med slide-in-panel

A11y-komplett: aria-expanded, aria-controls, ESC stänger, backdrop-klick stänger,
focus återställs. Scroll-lock på body vid öppen panel. Döljs på desktop (≥1024px)
via CSS. Respekterar prefers-reduced-motion."
```

---

## Task 5: Integrera MobileNav i SiteChrome + uppdatera header

**Files:**

- Modify: `web/src/components/site/SiteChrome.tsx`
- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Uppdatera SiteChrome.tsx**

Ersätt hela filen med:

```tsx
import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { getSiteData } from "@/lib/content/store";

import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import styles from "./site.module.css";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/om-oss", label: "Om byrån" },
  { href: "/experter", label: "Våra experter" },
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/team", label: "Team" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/blogg", label: "Blogg" },
] as const;

async function getCurrentPath(): Promise<string> {
  const headerList = await headers();
  // Next.js exponerar inte pathname i server-komponenter direkt;
  // vi förlitar oss på x-pathname satt via middleware, annars "/"
  return headerList.get("x-pathname") ?? "/";
}

export async function SiteChrome({ children }: SiteChromeProps) {
  const data = await getSiteData();
  const currentPath = await getCurrentPath();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Logo size={16} className={styles.brandLogo} />
            <span>{data.site.name}</span>
          </Link>
          <nav className={styles.nav} aria-label="Primär navigering">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav
            items={navigation}
            currentPath={currentPath}
            siteTagline={`${data.site.name} — Virtuellt konsultnätverk`}
          />
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Logo size={14} />
            <span>{data.site.name}</span>
          </div>
          <nav className={styles.footerNav} aria-label="Sekundär navigering">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className={styles.footerLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.footerMeta}>Virtuellt konsultnätverk</div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Skapa middleware för att exponera pathname**

Create: `web/src/middleware.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|schemas).*)",
};
```

- [ ] **Step 3: Uppdatera site.module.css — nav döljs på tablet+mobil, visas på desktop, logo-mark styling**

I `web/src/components/site/site.module.css`, byt ut `.nav`-basregeln och lägg till nya stilar:

Ta bort gamla `.nav`-basregeln (som redan har `display: flex` och `gap: 20px`) och ersätt med:

```css
.nav {
  display: none;
  align-items: center;
  gap: 20px;
}

@media (min-width: 1024px) {
  .nav {
    display: flex;
    gap: 32px;
  }
}
```

Lägg också till i basblocket (nära `.brand`):

```css
.brand {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brandLogo {
  flex-shrink: 0;
}

.footerBrand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.footerNav {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
}

.footerLink {
  color: var(--gray-500);
  transition: color 180ms;
}

.footerLink:hover {
  color: var(--accent);
}

.footerMeta {
  font-size: 12px;
  color: var(--gray-400);
}
```

Uppdatera `.footerInner`-regeln för att stapla vertikalt på mobil, 3 kolumner på desktop:

```css
.footerInner {
  width: var(--content-width);
  margin: 0 auto;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 12px;
  color: var(--gray-400);
}
```

Lägg till i `@media (min-width: 1024px)`-blocket (efter de befintliga desktop-reglerna):

```css
  .footerInner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 56px 0;
  }

  .footerNav {
    flex: 1;
    justify-content: center;
  }
```

I `@media (max-width: 768px)`-blocket finns tidigare en `.headerInner { flex-direction: column }`-regel — den ska vara **borttagen** (togs bort i Task 2). Dubbelkolla att så är fallet. Headern ska alltid vara i rad.

- [ ] **Step 4: Kör render-smoke-testerna (de testar server-rendering av sidorna, inte Middleware)**

Kör: `cd web && npm run test -- --run`

Mocken i `render-smoke.test.tsx` återskapar inte `headers()`-anropet direkt. Lägg till en mock för `next/headers` i testfilen:

Modify `web/src/app/render-smoke.test.tsx` — lägg till följande direkt efter de befintliga `vi.mock`-anropen (före imports av sidkomponenter):

```tsx
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-pathname", "/"]])),
}));
```

Men `Map` matchar inte `Headers`-interfacet helt. Byt mocken till:

```tsx
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-pathname" ? "/" : null),
  })),
}));
```

OBS: `SiteChrome` används inte direkt av sidorna i `render-smoke.test.tsx` — den wrappar sidorna via `layout.tsx`. Testerna renderar bara enskilda sidor. Ingen ytterligare ändring i `render-smoke.test.tsx` krävs om den inte importerar `SiteChrome` — verifiera detta genom att köra testerna först.

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 5: Verifiera TypeScript och lint**

Kör: `cd web && npx tsc --noEmit && npm run lint`
Expected: Inga fel.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/site/SiteChrome.tsx web/src/components/site/site.module.css web/src/middleware.ts
git commit -m "Integrera MobileNav i SiteChrome + utvidga footer

Header visar nu logo-mark bredvid ordmärket. Desktop-nav döljs under 1024px där
MobileNav tar över. Footer utvidgas till 3 kolumner på desktop (brand/nav/meta)
och staplas på mobil. Middleware exponerar pathname till server-komponenter."
```

---

## Task 6: RevealOnScroll-komponent (med tester)

**Files:**

- Create: `web/src/components/site/RevealOnScroll.tsx`
- Create: `web/src/components/site/RevealOnScroll.module.css`
- Create: `web/src/components/site/RevealOnScroll.test.tsx`

- [ ] **Step 1: Skriv RevealOnScroll.test.tsx**

```tsx
// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RevealOnScroll } from "./RevealOnScroll";

describe("RevealOnScroll", () => {
  let observed: Element[];
  let callback: IntersectionObserverCallback | null;

  beforeEach(() => {
    observed = [];
    callback = null;

    class MockObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe(target: Element) {
        observed.push(target);
      }
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }

    vi.stubGlobal("IntersectionObserver", MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renderar barnen direkt", () => {
    const { getByText } = render(<RevealOnScroll>Hej</RevealOnScroll>);
    expect(getByText("Hej")).toBeDefined();
  });

  it("startar med data-revealed='false'", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("data-revealed")).toBe("false");
  });

  it("sätter data-revealed='true' när element blir synligt", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;

    const entry = {
      isIntersecting: true,
      target: el,
    } as unknown as IntersectionObserverEntry;

    callback?.([entry], {} as IntersectionObserver);

    expect(el.getAttribute("data-revealed")).toBe("true");
  });

  it("observerar elementet vid mount", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;
    expect(observed).toContain(el);
  });
});
```

- [ ] **Step 2: Kör testerna — förvänta failure**

Kör: `cd web && npm run test -- --run RevealOnScroll`
Expected: FAIL med "Cannot find module './RevealOnScroll'".

- [ ] **Step 3: Skriv RevealOnScroll.module.css**

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 600ms ease-out, transform 600ms ease-out;
  will-change: opacity, transform;
}

.reveal[data-revealed="true"] {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal[data-revealed="true"] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 4: Skriv RevealOnScroll.tsx**

```tsx
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
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setRevealed(true);
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
```

- [ ] **Step 5: Kör testerna**

Kör: `cd web && npm run test -- --run RevealOnScroll`
Expected: Alla 4 tester gröna.

- [ ] **Step 6: Kör alla tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 7: Commit**

```bash
git add web/src/components/site/RevealOnScroll.tsx web/src/components/site/RevealOnScroll.module.css web/src/components/site/RevealOnScroll.test.tsx
git commit -m "Lägg till RevealOnScroll-wrapper för scroll-animationer

Klient-komponent som använder IntersectionObserver för att fade/slide in barn
när de scrollas in i viewporten. Respekterar prefers-reduced-motion."
```

---

## Task 7: StatCounter-komponent (med tester)

**Files:**

- Create: `web/src/components/site/StatCounter.tsx`
- Create: `web/src/components/site/StatCounter.test.tsx`

- [ ] **Step 1: Skriv StatCounter.test.tsx**

```tsx
// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StatCounter } from "./StatCounter";

describe("StatCounter", () => {
  let callback: IntersectionObserverCallback | null;

  beforeEach(() => {
    callback = null;
    vi.useFakeTimers();

    class MockObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    vi.stubGlobal("IntersectionObserver", MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renderar slutvärdet direkt om IntersectionObserver saknas", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<StatCounter value={42} />);
    expect(container.textContent).toBe("42");
  });

  it("startar på 0 och animerar till slutvärdet", async () => {
    const { container } = render(<StatCounter value={10} durationMs={1000} />);
    expect(container.textContent).toBe("0");

    const entry = { isIntersecting: true } as IntersectionObserverEntry;
    act(() => {
      callback?.([entry], {} as IntersectionObserver);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(container.textContent).toBe("10");
  });

  it("använder renderValue för formattering", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(
      <StatCounter value={1000} renderValue={(n) => `${n}+`} />,
    );
    expect(container.textContent).toBe("1000+");
  });
});
```

- [ ] **Step 2: Kör testerna — förvänta failure**

Kör: `cd web && npm run test -- --run StatCounter`
Expected: FAIL.

- [ ] **Step 3: Skriv StatCounter.tsx**

```tsx
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
          // easeOutCubic
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
```

- [ ] **Step 4: Kör testerna**

Kör: `cd web && npm run test -- --run StatCounter`
Expected: Alla 3 tester gröna.

Observera: om testet med `requestAnimationFrame` inte fungerar tillförlitligt med fake timers, justera testet att använda `vi.useFakeTimers({ toFake: ["setTimeout"] })` och låt `StatCounter.tsx` använda `setTimeout` istället för `requestAnimationFrame`. I så fall uppdatera `StatCounter.tsx` — ersätt `requestAnimationFrame(step)` med `window.setTimeout(() => step(performance.now()), 16)` och säkra att progress-loopen inte fortsätter efter unmount.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/site/StatCounter.tsx web/src/components/site/StatCounter.test.tsx
git commit -m "Lägg till StatCounter: animerad räknare vid scroll-in

easeOutCubic-animation över ~1.2s när elementet blir synligt. Respekterar
prefers-reduced-motion (sätter värdet direkt). Fallback om IntersectionObserver
saknas."
```

---

## Task 8: CTAButton- och Pill-komponenter (server-safe)

**Files:**

- Create: `web/src/components/site/CTAButton.tsx`
- Create: `web/src/components/site/CTAButton.module.css`
- Create: `web/src/components/site/Pill.tsx`
- Create: `web/src/components/site/Pill.module.css`

- [ ] **Step 1: Skriv CTAButton.module.css**

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  border-radius: 24px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background 180ms, border-color 180ms, color 180ms, transform 180ms;
  font-family: inherit;
}

.button:hover {
  transform: translateY(-1px);
}

.primary {
  background: var(--accent);
  color: var(--white);
}

.primary:hover {
  background: var(--accent-hover);
}

.secondary {
  background: var(--marine);
  color: var(--white);
}

.secondary:hover {
  background: var(--marine-hover);
}

.outline {
  background: transparent;
  color: var(--black);
  border-color: var(--gray-300);
}

.outline:hover {
  border-color: var(--black);
}

@media (prefers-reduced-motion: reduce) {
  .button,
  .button:hover {
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Skriv CTAButton.tsx**

```tsx
import type { Route } from "next";
import Link from "next/link";

import styles from "./CTAButton.module.css";

type Variant = "primary" | "secondary" | "outline";

type CTAButtonProps = {
  href: Route | string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
};

export function CTAButton({
  href,
  children,
  variant = "primary",
  className,
  external = false,
}: CTAButtonProps) {
  const variantClass =
    variant === "primary" ? styles.primary : variant === "secondary" ? styles.secondary : styles.outline;
  const classes = className
    ? `${styles.button} ${variantClass} ${className}`
    : `${styles.button} ${variantClass}`;

  if (external) {
    return (
      <a href={href as string} className={classes} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    );
  }
  return (
    <Link href={href as Route} className={classes}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Skriv Pill.module.css**

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.4;
  white-space: nowrap;
}

.rust {
  background: var(--accent-light);
  color: var(--accent);
}

.marine {
  background: var(--marine-light);
  color: var(--marine);
}

.gold {
  background: var(--gold-light);
  color: var(--gold-deep);
}

.neutral {
  background: var(--gray-200);
  color: var(--gray-600);
}
```

- [ ] **Step 4: Skriv Pill.tsx**

```tsx
import styles from "./Pill.module.css";

type PillVariant = "rust" | "marine" | "gold" | "neutral";

type PillProps = {
  children: React.ReactNode;
  variant?: PillVariant;
  className?: string;
};

export function Pill({ children, variant = "rust", className }: PillProps) {
  const variantClass = styles[variant];
  const classes = className ? `${styles.pill} ${variantClass} ${className}` : `${styles.pill} ${variantClass}`;
  return <span className={classes}>{children}</span>;
}
```

- [ ] **Step 5: Verifiera typkontroll och lint**

Kör: `cd web && npx tsc --noEmit && npm run lint`
Expected: Inga fel.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/site/CTAButton.tsx web/src/components/site/CTAButton.module.css web/src/components/site/Pill.tsx web/src/components/site/Pill.module.css
git commit -m "Lägg till CTAButton och Pill-komponenter

Server-safe komponenter: CTAButton med tre varianter (primär/sekundär/outline),
Pill med fyra färgvarianter (rust/marine/gold/neutral). Båda respekterar
prefers-reduced-motion."
```

---

## Task 9: GridCell — hover-polish

**Files:**

- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Uppdatera GridCell-styling**

Ersätt `.gridCell`- och `.gridCell:hover`-reglerna i `site.module.css` med:

```css
.gridCell {
  background: var(--white);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  border-radius: 14px;
  border-left: 3px solid transparent;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
  transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
              border-color 200ms ease;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
}

.gridCell:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(28, 25, 23, 0.08);
  border-left-color: var(--accent);
}

@media (prefers-reduced-motion: reduce) {
  .gridCell,
  .gridCell:hover {
    transform: none;
    transition: box-shadow 200ms, border-color 200ms;
  }
}
```

Uppdatera även `.expertCard` med matchande border-radius:

```css
.expertCard {
  background: var(--white);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
}
```

Och `.detailSidebar` (redan uppdaterad i Task 2 — kontrollera att border-radius är 14px).

- [ ] **Step 2: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/site/site.module.css
git commit -m "Polera GridCell: accent-border vid hover, mjukare skuggor

Vänstersida-border glider in i rust vid hover. Konsistent border-radius 14px
över GridCell, ExpertCard och DetailSidebar."
```

---

## Task 10: Hero dekorativa cirklar

**Files:**

- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Lägg till dekorativa cirklar på hero (endast tablet+)**

I `site.module.css`, inom `@media (min-width: 640px)`-blocket lägg till:

```css
  .hero::after {
    content: '';
    position: absolute;
    right: -40px;
    top: 80px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: rgba(194, 106, 63, 0.05);
    border: 1px solid rgba(194, 106, 63, 0.08);
    pointer-events: none;
    z-index: -1;
    animation: fadeUp 1s ease-out 0.5s both;
  }
```

I `@media (min-width: 1024px)`-blocket lägg till en andra, större cirkel:

```css
  .hero::after {
    width: 220px;
    height: 220px;
    right: -60px;
    top: 60px;
  }

  .heroDecoCircle {
    position: absolute;
    right: 140px;
    top: 200px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: rgba(30, 58, 95, 0.04);
    border: 1px solid rgba(30, 58, 95, 0.08);
    pointer-events: none;
    z-index: -1;
    animation: fadeUp 1s ease-out 0.7s both;
  }
```

Säkerställ att `.hero` fortfarande har `position: relative;` i basregeln (den ska ha det sedan tidigare).

- [ ] **Step 2: Lägg till deco-cirkeln i startsidans hero-markup**

Denna kräver en ändring i `web/src/app/page.tsx` (hero-sektionen). Leta upp hero-sektionen och lägg till ett extra `<span>` med klass `styles.heroDecoCircle`:

```tsx
<section className={styles.hero}>
  <span className={styles.heroDecoCircle} aria-hidden />
  <p className={styles.heroEyebrow}>...
```

Om startsidans komponent importerar `styles` från någon annan plats, säkerställ att den importerar från `@/components/site/site.module.css`. Om styling ligger lokalt i `page.module.css`, lägg då till `.heroDecoCircle`-regeln där istället (eller importera både stilarna och använd båda klasserna).

- [ ] **Step 3: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/site/site.module.css web/src/app/page.tsx
git commit -m "Hero-sektion: dekorativa cirklar på tablet och desktop

Två subtila cirklar (rust + marin, låg opacity) som fade-in efter hero-titeln
för mer visuellt liv. Visas endast på ≥640px för att inte trängas på mobil."
```

---

## Task 11: Integrera RevealOnScroll och "Utvalda experter"-sektion på startsidan

**Files:**

- Modify: `web/src/app/page.tsx`

- [ ] **Step 1: Läs den befintliga page.tsx**

Kör: `cd web && cat src/app/page.tsx` — förstå nuvarande struktur innan ändring.

- [ ] **Step 2: Wrap sektioner i RevealOnScroll**

Importera komponenterna:

```tsx
import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import { StatCounter } from "@/components/site/StatCounter";
```

Runt varje existerande `<section className={styles.section}>` på startsidan, wrappa i `<RevealOnScroll as="section" className={styles.section}>` istället (ta bort `section`-taggen där den nu finns hårdkodad).

Exempel:

```tsx
// Före
<section className={styles.section}>
  <div className={styles.sectionHeader}>...</div>
  ...
</section>

// Efter
<RevealOnScroll as="section" className={styles.section}>
  <div className={styles.sectionHeader}>...</div>
  ...
</RevealOnScroll>
```

Hero-sektionen (första sektionen) lämnas orörd — den har redan sin egen fadeUp-animation vid load.

- [ ] **Step 3: Lägg till "Utvalda experter"-sektion (efter hero, före övriga sektioner)**

```tsx
<RevealOnScroll as="section" className={styles.section}>
  <div className={styles.sectionHeader}>
    <span className={styles.sectionLabel}>Utvalda experter</span>
  </div>
  <div className={styles.featuredExperts}>
    {data.experts.slice(0, 3).map((expert) => (
      <article key={expert.slug} className={styles.featuredExpert}>
        <Link href={`/experter/${expert.slug}` as Route} className={styles.featuredExpertLink}>
          <div className={styles.featuredExpertPortrait} aria-hidden>
            <span>{expert.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
          </div>
          <div className={styles.featuredExpertBody}>
            <h3 className={styles.featuredExpertName}>{expert.name}</h3>
            <p className={styles.featuredExpertRole}>{expert.headline ?? expert.role ?? ""}</p>
          </div>
        </Link>
      </article>
    ))}
  </div>
</RevealOnScroll>
```

OBS: Justera fältnamnen (`expert.headline`, `expert.role`, etc.) efter vad schemat faktiskt innehåller. Läs `web/src/lib/content/schema.ts` och `web/site-data.json` först för att verifiera fältnamn. Om `headline` och `role` inte finns, använd t.ex. `expert.shortBio` eller hoppa över undertexten.

- [ ] **Step 4: Om stats-raden använder fasta siffror, integrera StatCounter**

Om det finns en stats-rad med hårdkodade eller datasatta nummer, wrappa dem:

```tsx
<div className={styles.stats}>
  <div>
    <div className={styles.statValue}>
      <StatCounter value={data.experts.length} renderValue={(n) => String(n)} />
    </div>
    <div className={styles.statLabel}>Experter</div>
  </div>
  ...
</div>
```

- [ ] **Step 5: Lägg till CSS för Utvalda experter-sektionen**

I `web/src/components/site/site.module.css`:

```css
.featuredExperts {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.featuredExpert {
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
  transition: transform 250ms, box-shadow 250ms;
}

.featuredExpert:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(28, 25, 23, 0.08);
}

.featuredExpertLink {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 24px;
  text-decoration: none;
  color: inherit;
}

.featuredExpertPortrait {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-light), var(--marine-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display), Georgia, serif;
  font-size: 20px;
  color: var(--accent);
  font-weight: 400;
}

.featuredExpertBody {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.featuredExpertName {
  font-family: var(--font-display), Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--black);
}

.featuredExpertRole {
  font-size: 13px;
  color: var(--gray-500);
  line-height: 1.5;
}

@media (min-width: 1024px) {
  .featuredExperts {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

- [ ] **Step 6: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna. `Utvalda experter` visas i home-page-HTML.

Om testet `renders the home page with seeded content` fallerar för att schema-fälten heter något annat, justera markupen att matcha schemat.

- [ ] **Step 7: Commit**

```bash
git add web/src/app/page.tsx web/src/components/site/site.module.css
git commit -m "Startsidan: Utvalda experter-sektion + scroll-reveal + stat-counter

Lägger till en ny sektion med de första 3 experterna som utvalda kort (portrait
med initialer mot gradient). Sektioner på startsidan wrappas i RevealOnScroll
för subtila fade-in vid scroll. Stats-raden animerar siffror via StatCounter."
```

---

## Task 12: ReadingProgress för bloggartiklar (med tester)

**Files:**

- Create: `web/src/components/site/ReadingProgress.tsx`
- Create: `web/src/components/site/ReadingProgress.module.css`
- Create: `web/src/components/site/ReadingProgress.test.tsx`

- [ ] **Step 1: Skriv ReadingProgress.test.tsx**

```tsx
// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadingProgress } from "./ReadingProgress";

describe("ReadingProgress", () => {
  it("renderar ett tomt progress-element med width 0", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[data-testid='reading-progress-bar']") as HTMLElement;
    expect(bar).toBeDefined();
    expect(bar.style.width).toBe("0%");
  });

  it("uppdaterar bredden vid scroll", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 500, writable: true, configurable: true });

    const { container } = render(<ReadingProgress />);
    fireEvent.scroll(window);

    const bar = container.querySelector("[data-testid='reading-progress-bar']") as HTMLElement;
    // 500 / (2000 - 1000) = 50%
    expect(bar.style.width).toBe("50%");
  });
});
```

- [ ] **Step 2: Kör testerna**

Kör: `cd web && npm run test -- --run ReadingProgress`
Expected: FAIL.

- [ ] **Step 3: Skriv ReadingProgress.module.css**

```css
.root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 60;
  pointer-events: none;
}

.bar {
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--accent), rgba(194, 106, 63, 0.5));
  transition: width 80ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .bar {
    transition: none;
  }
}
```

- [ ] **Step 4: Skriv ReadingProgress.tsx**

```tsx
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
```

- [ ] **Step 5: Kör testerna**

Kör: `cd web && npm run test -- --run ReadingProgress`
Expected: Alla 2 tester gröna.

- [ ] **Step 6: Commit**

```bash
git add web/src/components/site/ReadingProgress.tsx web/src/components/site/ReadingProgress.module.css web/src/components/site/ReadingProgress.test.tsx
git commit -m "Lägg till ReadingProgress: fast progress-bar högst upp

Tunn rust-linje som följer scroll-positionen. Används på bloggartiklar för
att ge läsaren orientering."
```

---

## Task 13: Bloggartikel — integrera ReadingProgress och pills för metadata

**Files:**

- Modify: `web/src/app/blogg/[slug]/page.tsx`
- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Läs nuvarande blogg-artikel-sida**

Kör: `cd web && cat src/app/blogg/[slug]/page.tsx`

- [ ] **Step 2: Lägg till ReadingProgress i toppen av sidan**

Importera:

```tsx
import { Pill } from "@/components/site/Pill";
import { ReadingProgress } from "@/components/site/ReadingProgress";
```

Lägg till `<ReadingProgress />` direkt innanför root-fragment/div i return.

- [ ] **Step 3: Visa metadata som pills ovanför rubriken**

Om datum och författare renderas som klartext, byt ut dem mot pills:

```tsx
<div className={styles.blogMeta}>
  <Pill variant="marine">{formatDate(post.publishedAt)}</Pill>
  {post.author ? <Pill variant="neutral">{post.author}</Pill> : null}
</div>
<h1 className={styles.blogTitle}>{post.title}</h1>
```

Bekräfta fältnamnen (`publishedAt`, `author`) genom att läsa `web/src/lib/blog/schema.ts` och/eller existing `blog/[slug]/page.tsx`.

- [ ] **Step 4: Begränsa läsbredd till 70ch för brödtext**

I `web/src/components/site/site.module.css`, uppdatera `.blogContent`:

```css
.blogContent {
  font-size: 16px;
  color: var(--gray-600);
  line-height: 1.75;
  max-width: 70ch;
}
```

Lägg även till:

```css
.blogMeta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.blogTitle {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(2rem, 4vw + 0.5rem, 3rem);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 24px;
  max-width: 24ch;
}
```

- [ ] **Step 5: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna, blogg-artikeln renderas med titel och innehåll.

- [ ] **Step 6: Commit**

```bash
git add web/src/app/blogg/[slug]/page.tsx web/src/components/site/site.module.css
git commit -m "Bloggartikel: läsprogress, pills för meta, bättre typografi

ReadingProgress-bar följer scroll. Publiceringsdatum och författare visas som
pills ovanför rubriken. Brödtexten är nu begränsad till 70ch för bättre
läsbarhet."
```

---

## Task 14: Blogglista — featured-first layout

**Files:**

- Modify: `web/src/app/blogg/page.tsx`
- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Läs nuvarande blogglista**

Kör: `cd web && cat src/app/blogg/page.tsx`

- [ ] **Step 2: Uppdatera layouten**

Första (senaste) artikeln i bredare kort över hela raden, övriga i 2-kolumnsrutnät.

```tsx
const [featured, ...rest] = posts;

return (
  <div className={styles.pageWrap}>
    <section className={styles.hero}>
      <p className={styles.heroEyebrow}>Blogg</p>
      <h1 className={styles.heroTitle}>Insikter och analys</h1>
      <div className={styles.heroLine} />
    </section>

    <section className={styles.section}>
      {featured ? (
        <Link href={`/blogg/${featured.slug}` as Route} className={styles.blogFeatured}>
          <div className={styles.blogFeaturedMeta}>
            <Pill variant="marine">{formatDate(featured.publishedAt)}</Pill>
          </div>
          <h2 className={styles.blogFeaturedTitle}>{featured.title}</h2>
          {featured.summary ? <p className={styles.blogFeaturedSummary}>{featured.summary}</p> : null}
          <span className={styles.blogFeaturedReadMore}>Läs artikeln →</span>
        </Link>
      ) : null}

      <div className={styles.blogGrid}>
        {rest.map((post) => (
          <Link key={post.slug} href={`/blogg/${post.slug}` as Route} className={styles.blogCard}>
            <Pill variant="marine">{formatDate(post.publishedAt)}</Pill>
            <h3 className={styles.blogCardTitle}>{post.title}</h3>
            {post.summary ? <p className={styles.blogCardSummary}>{post.summary}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  </div>
);
```

Bekräfta fältnamn mot schemat (`post.summary`, etc.).

- [ ] **Step 3: Lägg till CSS**

I `site.module.css`:

```css
.blogFeatured {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
  text-decoration: none;
  color: inherit;
  margin-bottom: 24px;
  border-left: 3px solid var(--accent);
  transition: transform 250ms, box-shadow 250ms;
}

.blogFeatured:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(28, 25, 23, 0.08);
}

.blogFeaturedMeta {
  display: flex;
  gap: 8px;
}

.blogFeaturedTitle {
  font-family: var(--font-display), Georgia, serif;
  font-size: clamp(1.5rem, 3vw + 0.5rem, 2.25rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.blogFeaturedSummary {
  font-size: 15px;
  color: var(--gray-500);
  line-height: 1.65;
  max-width: 60ch;
}

.blogFeaturedReadMore {
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-top: 4px;
}

.blogGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.blogCard {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  background: var(--white);
  border-radius: 14px;
  box-shadow: 0 2px 20px rgba(28, 25, 23, 0.04);
  text-decoration: none;
  color: inherit;
  transition: transform 250ms, box-shadow 250ms;
}

.blogCard:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(28, 25, 23, 0.08);
}

.blogCardTitle {
  font-family: var(--font-display), Georgia, serif;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.blogCardSummary {
  font-size: 13px;
  color: var(--gray-500);
  line-height: 1.6;
}

@media (min-width: 640px) {
  .blogGrid {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [ ] **Step 4: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna. Blogglistan renderas med featured + grid.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/blogg/page.tsx web/src/components/site/site.module.css
git commit -m "Blogglista: featured-first layout

Första artikeln visas i ett bredare 'featured'-kort med rust-border och större
typografi. Övriga artiklar i 2-kolumnsrutnät på tablet+ (1 kolumn på mobil)."
```

---

## Task 15: Expert-detalj — sidebar med marin-bakgrund

**Files:**

- Modify: `web/src/components/site/site.module.css`

- [ ] **Step 1: Uppdatera .detailSidebar**

I `site.module.css`, ersätt basregeln för `.detailSidebar` (som tidigare uppdaterades i Task 2):

```css
.detailSidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--marine-light);
  border: 1px solid var(--marine-border);
  padding: 24px;
  border-radius: 14px;
}
```

Inga ändringar i `@media (min-width: 1024px)`-varianten (sticky-beteendet är kvar).

- [ ] **Step 2: Kör render-smoke-tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/site/site.module.css
git commit -m "Expert-detalj: sidebar med subtil marin-bakgrund

Sidebaren på detaljsidor får marin-ljus bakgrund och subtil marin-border för
att lyfta den från huvudinnehållet utan att bli dominant."
```

---

## Task 16: Polish-pass övriga sidor (om-oss, team, expertområden, marknadsplats)

**Files:**

- Modify: `web/src/app/om-oss/page.tsx`
- Modify: `web/src/app/experter/page.tsx`
- Modify: `web/src/app/expertomraden/page.tsx`
- Modify: `web/src/app/team/page.tsx`
- Modify: `web/src/app/marknadsplats/page.tsx`

- [ ] **Step 1: Wrap sektioner i RevealOnScroll på varje sida**

För varje fil ovan:

1. Läs filen: `cd web && cat src/app/<path>`
2. Importera: `import { RevealOnScroll } from "@/components/site/RevealOnScroll";`
3. Byt ut varje `<section className={styles.section}>` mot `<RevealOnScroll as="section" className={styles.section}>`.
4. Hero-sektionen (första) lämnas orörd.

Gör detta som en enskild, fokuserad ändring per fil — inga andra ändringar i dessa filer.

- [ ] **Step 2: Verifiera typer**

Kör: `cd web && npx tsc --noEmit`
Expected: Inga fel.

- [ ] **Step 3: Kör alla tester**

Kör: `cd web && npm run test -- --run`
Expected: Alla render-smoke-tester gröna.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/om-oss/page.tsx web/src/app/experter/page.tsx web/src/app/expertomraden/page.tsx web/src/app/team/page.tsx web/src/app/marknadsplats/page.tsx
git commit -m "Polish-pass: scroll-reveal på övriga sidor

Wrappar sektioner på om-oss, experter, expertområden, team och marknadsplats i
RevealOnScroll för konsistent animation över hela webben."
```

---

## Task 17: Slutverifiering och manuell testning

**Files:** (ingen kodändring — verifiering)

- [ ] **Step 1: Kör hela testsviten**

Kör: `cd web && npm run test -- --run`
Expected: Alla tester gröna.

- [ ] **Step 2: Kör lint och typecheck**

Kör: `cd web && npm run lint && npx tsc --noEmit`
Expected: Inga fel, inga varningar.

- [ ] **Step 3: Bygg produktionsversion**

Kör: `cd web && npm run build`
Expected: Byggen passerar utan fel.

- [ ] **Step 4: Starta dev-servern och testa manuellt**

Kör: `cd web && npm run dev`

Öppna `http://localhost:3000` i Chrome. Använd DevTools Device Mode och verifiera följande skärmstorlekar:

- **iPhone SE (375×667):** Hamburger syns, meny öppnas korrekt, alla 6 länkar syns i panelen, stäng-knapp fungerar, ESC stänger, klick på backdrop stänger.
- **iPhone 14 Pro (393×852):** Samma som ovan.
- **iPad (768×1024):** Hamburger syns fortfarande (tablet använder hamburger), grid visar 2 kolumner där det finns, hero-padding känns rätt.
- **iPad Pro (1024×1366):** Desktop-nav syns, hamburger döljs. Grid visar 3 kolumner där relevant. Dekorativa cirklar i hero syns.
- **Desktop (1440×900):** Full desktop-layout.

Verifiera också:

- Alla 6 menylänkar fungerar på mobil och desktop
- "Blogg" syns i menyn på iPhone (den ursprungliga buggen)
- Scroll-reveal animeras smidigt på startsidan
- Hover-effekter på GridCell fungerar
- Bloggartikel: ReadingProgress-baren uppdateras vid scroll
- Blogglista: första artikeln renderas som featured-kort
- Expert-detalj: sidebar har marin-ljus bakgrund
- Aktivera `prefers-reduced-motion` i OS-settings och verifiera att animationer inaktiveras

- [ ] **Step 5: Verifiera a11y**

Öppna DevTools Lighthouse-fliken och kör Accessibility-audit på:

1. Startsidan
2. En bloggartikel
3. En expert-detalj

Expected: Accessibility-score ≥ 95. Inga kontrast-fel på rust mot vit, marin mot vit.

Om tid finns, kör `axe-core` via DevTools för djupare a11y-granskning.

- [ ] **Step 6: Dokumentera resultatet i CLAUDE.md (om relevant)**

Läs `web/CLAUDE.md`. Om det finns relevanta konventioner som ändrats (t.ex. nya komponenter som andra agenter bör känna till), gör en kort uppdatering under "Konventioner"- eller en ny "Komponenter"-sektion. Exempel:

```markdown
## Komponenter

Återanvändbara komponenter under `src/components/site/`:

- `SiteChrome` — header/footer-wrapper (server)
- `MobileNav` — hamburger-nav för tablet/mobil (client)
- `RevealOnScroll` — wrapper för scroll-reveal-animationer (client)
- `StatCounter` — animerad räknare (client)
- `ReadingProgress` — läsprogress-bar för bloggartiklar (client)
- `CTAButton`, `Pill` — UI-primitiver (server-safe)
```

Om `web/CLAUDE.md` inte behöver uppdateras, skippa detta steg.

- [ ] **Step 7: Slutcommit**

Om CLAUDE.md uppdaterades:

```bash
git add web/CLAUDE.md
git commit -m "Uppdatera CLAUDE.md: nya komponenter under site/"
```

Annars: inget att committa — slutverifieringen är klar.

---

## Självgranskning (utförd av planförfattaren)

- **Spec-täckning:** Alla spec-avsnitt har en motsvarande task:
  - Färgsystem → Task 1
  - Breakpoints → Task 1 + 2
  - Typografi (16px bas) → Task 1
  - Hamburger-navigering → Task 4 + 5
  - Logo-mark → Task 3 + 5
  - GridCell hover-polish → Task 9
  - Hero dekorativa cirklar → Task 10
  - Scroll-reveal → Task 6 + 11 + 16
  - CTA-knappar och pills → Task 8
  - Footer 3-kolumner → Task 5
  - "Utvalda experter" startsida → Task 11
  - Blogglista featured-first → Task 14
  - Blogg-artikel ReadingProgress + pills → Task 12 + 13
  - Expert-detalj marin-sidebar → Task 15
  - Polish-pass övriga sidor → Task 16
  - A11y + testning → genomgående, verifieras i Task 17
  - Stat-counter → Task 7 + 11
- **Inga placeholders eller TBD**.
- **Typkonsistens:** `MobileNav`, `RevealOnScroll`, `StatCounter`, `ReadingProgress` används konsekvent i efterföljande tasks.
- **Frekvens av commits:** Varje task slutar med en egen commit.
