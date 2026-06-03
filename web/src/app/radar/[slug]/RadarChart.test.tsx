// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RadarChart } from "./RadarChart";

const SEGMENTS = [
  { id: "ai-agenter", name: "AI & agenter" },
  { id: "infra", name: "Infrastruktur" },
  { id: "sakerhet", name: "Säkerhet" },
  { id: "styrning", name: "Styrning" },
];
const BLIPS = [
  {
    id: "pqc",
    name: "Post-kvant-kryptografi",
    segmentId: "sakerhet",
    ring: "prova" as const,
    description: "En neutral beskrivning av signalen.",
    implications: "Varför det spelar roll för granskning.",
  },
];

describe("RadarChart", () => {
  it("renderar en knapp per blip och visar detalj vid klick", () => {
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} />);

    const blip = screen.getByRole("button", { name: /Post-kvant-kryptografi/ });
    expect(blip).toBeTruthy();

    fireEvent.click(blip);
    expect(screen.getByText("En neutral beskrivning av signalen.")).toBeTruthy();
    expect(screen.getByText("Varför det spelar roll för granskning.")).toBeTruthy();
  });

  it("visar Relaterat-länkar för vald blip när relatedByBlip finns", () => {
    const relatedByBlip = {
      pqc: [
        {
          kind: "foresight" as const,
          slug: "digital-suveranitet",
          title: "Digital suveränitet",
          date: "2026-05-29T00:00:00.000Z",
          areaSlugs: ["cyber"],
        },
      ],
    };
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} relatedByBlip={relatedByBlip} />);
    fireEvent.click(screen.getByRole("button", { name: /Post-kvant-kryptografi/ }));

    const link = screen.getByRole("link", { name: /Digital suveränitet/ });
    expect(link.getAttribute("href")).toBe("/foresight/digital-suveranitet");
  });

  it("visar ingen Relaterat-sektion utan relaterade poster", () => {
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} />);
    fireEvent.click(screen.getByRole("button", { name: /Post-kvant-kryptografi/ }));
    expect(screen.queryByText("Relaterat")).toBeNull();
  });

  it("renderar utan krasch för en radar med 6 segment och en blip i sjätte segmentet", () => {
    const sixSegments = [
      { id: "seg-1", name: "Segment 1" },
      { id: "seg-2", name: "Segment 2" },
      { id: "seg-3", name: "Segment 3" },
      { id: "seg-4", name: "Segment 4" },
      { id: "seg-5", name: "Segment 5" },
      { id: "seg-6", name: "Segment 6" },
    ];
    const blips = [
      {
        id: "blip-6",
        name: "Signal i sjätte segmentet",
        segmentId: "seg-6",
        ring: "prova" as const,
        description: "Beskrivning.",
        implications: "Implikationer.",
      },
    ];

    render(<RadarChart segments={sixSegments} blips={blips} />);

    expect(
      screen.getByRole("button", { name: /Signal i sjätte segmentet/ }),
    ).toBeTruthy();
  });
});
