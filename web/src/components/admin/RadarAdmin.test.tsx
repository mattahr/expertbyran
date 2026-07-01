// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { RadarAdmin } from "./RadarAdmin";

const META = {
  slug: "teknikradar-2026",
  title: "Teknikradar 2026",
  date: "2026-06-03T00:00:00.000Z",
  segments: [
    { id: "s1", name: "Ett" },
    { id: "s2", name: "Två" },
    { id: "s3", name: "Tre" },
    { id: "s4", name: "Fyra" },
  ],
  rings: [
    { id: "anta", label: "Anta", blurb: "I drift.", color: "#0e7c7b" },
    { id: "prova", label: "Pröva", blurb: "Pilot.", color: "#1d4e74" },
    { id: "bevaka", label: "Bevaka", blurb: "Följ.", color: "#d4982b" },
  ],
};

function jsonRes(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
}

function mockFetch() {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    if (u.endsWith("/api/v1/radars")) return jsonRes({ radars: [META] });
    if (u.endsWith("/api/v1/site-data")) return jsonRes({ expertAreas: [] });
    if (u.includes("/api/v1/radars/")) return jsonRes({ meta: META, blips: [] });
    return jsonRes({});
  });
}

// Minimal DataTransfer-attrapp — jsdom saknar den, och drag-handlarna sätter
// effectAllowed/dropEffect samt anropar setData/setDragImage.
function dataTransfer() {
  const store: Record<string, string> = {};
  return {
    effectAllowed: "",
    dropEffect: "",
    setData: (k: string, v: string) => {
      store[k] = v;
    },
    getData: (k: string) => store[k] ?? "",
    setDragImage: () => {},
  };
}

async function openRingEditor() {
  render(<RadarAdmin />);
  fireEvent.click(await screen.findByText("Redigera"));
  await screen.findByText(/Ringar \(3 av/);
}

const ringLabels = () =>
  screen
    .getAllByPlaceholderText("Ringnamn (t.ex. Anta)")
    .map((el) => (el as HTMLInputElement).value);

describe("RadarAdmin ring-editor", () => {
  beforeEach(() => vi.stubGlobal("fetch", mockFetch()));
  afterEach(() => vi.unstubAllGlobals());

  it("visar ett drag-handtag per ring och inga upp/ner-pilar", async () => {
    await openRingEditor();
    expect(screen.getAllByLabelText(/Dra för att flytta ringen/)).toHaveLength(3);
    expect(screen.queryByLabelText("Flytta ringen inåt")).toBeNull();
    expect(screen.queryByLabelText("Flytta ringen utåt")).toBeNull();
  });

  it("drag-and-drop flyttar en ring till en ny position", async () => {
    await openRingEditor();
    expect(ringLabels()).toEqual(["Anta", "Pröva", "Bevaka"]);

    const handles = screen.getAllByLabelText(/Dra för att flytta ringen/);
    const rows = handles.map((h) => h.parentElement as HTMLElement);
    const dt = dataTransfer();

    // Dra den inre ringen (index 0) och släpp den på ytterst (index 2).
    fireEvent.dragStart(handles[0], { dataTransfer: dt });
    fireEvent.dragOver(rows[2], { dataTransfer: dt });
    fireEvent.drop(rows[2], { dataTransfer: dt });

    expect(ringLabels()).toEqual(["Pröva", "Bevaka", "Anta"]);
  });
});
