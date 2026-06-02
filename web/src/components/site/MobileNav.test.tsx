// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileNav } from "./MobileNav";
import { isNavItemActive } from "./PrimaryNav";

const pathnameState = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.pathname,
}));

const navigation = [
  { href: "/expertomraden" as const, label: "Expertområden" },
  { href: "/experter" as const, label: "Våra experter" },
  { href: "/blogg" as const, label: "Blogg" },
];

describe("MobileNav", () => {
  beforeEach(() => {
    document.body.style.overflow = "";
    pathnameState.pathname = "/";
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
    expect(screen.getByRole("button", { name: /öppna meny/i }).getAttribute("aria-expanded")).toBe("true");
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

  it("markerar aktuell sida från browser-path när currentPath inte skickas in", () => {
    pathnameState.pathname = "/blogg/test-post";
    render(<MobileNav items={navigation} />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));
    const activeLink = screen.getByRole("link", { name: "Blogg" });
    expect(activeLink.getAttribute("aria-current")).toBe("page");
  });

  it("matchar nav-länkar mot undersidor men inte liknande prefix", () => {
    expect(isNavItemActive("/experter", "/experter/effektivitetsrevisor")).toBe(true);
    expect(isNavItemActive("/experter", "/expertomraden")).toBe(false);
  });

  it("focus-trap: Tab från sista länken går tillbaka till stängknappen", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));

    const links = screen.getAllByRole("link");
    const lastLink = links[links.length - 1];
    lastLink.focus();

    fireEvent.keyDown(document, { key: "Tab" });

    const closeButton = screen.getByRole("button", { name: /stäng meny/i });
    expect(document.activeElement).toBe(closeButton);
  });

  it("focus-trap: Shift+Tab från stängknappen går till sista länken", () => {
    render(<MobileNav items={navigation} currentPath="/" />);
    fireEvent.click(screen.getByRole("button", { name: /öppna meny/i }));

    const closeButton = screen.getByRole("button", { name: /stäng meny/i });
    closeButton.focus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });

    const links = screen.getAllByRole("link");
    const lastLink = links[links.length - 1];
    expect(document.activeElement).toBe(lastLink);
  });
});
