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
});
