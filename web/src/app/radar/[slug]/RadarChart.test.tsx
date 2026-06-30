// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { RadarChart, wrapLabel } from "./RadarChart";

const SEGMENTS = [
  { id: "ai-agenter", name: "AI & agenter" },
  { id: "infra", name: "Infrastruktur" },
  { id: "sakerhet", name: "Säkerhet" },
  { id: "styrning", name: "Styrning" },
];
const RINGS = [
  { id: "anta", label: "Anta", blurb: "I drift, hög mognad", color: "#0e7c7b" },
  { id: "prova", label: "Pröva", blurb: "Pilot, bygg kompetens", color: "#1d4e74" },
  { id: "bevaka", label: "Bevaka", blurb: "Följ utvecklingen aktivt", color: "#d4982b" },
  { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet", color: "#64718a" },
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
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} rings={RINGS} />);

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
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} rings={RINGS} relatedByBlip={relatedByBlip} />);
    fireEvent.click(screen.getByRole("button", { name: /Post-kvant-kryptografi/ }));

    const link = screen.getByRole("link", { name: /Digital suveränitet/ });
    expect(link.getAttribute("href")).toBe("/foresight/digital-suveranitet");
  });

  it("visar ingen Relaterat-sektion utan relaterade poster", () => {
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} rings={RINGS} />);
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

    render(<RadarChart segments={sixSegments} blips={blips} rings={RINGS} />);

    expect(
      screen.getByRole("button", { name: /Signal i sjätte segmentet/ }),
    ).toBeTruthy();
  });

  it("renderar blip-namnet som rubrik under blobben", () => {
    render(<RadarChart segments={SEGMENTS} blips={BLIPS} rings={RINGS} />);
    // Rubriken ligger i ett aria-hidden <text>; blip-namnet ska finnas i DOM:en
    // även utan att man klickat på blobben.
    expect(screen.getByText("Post-kvant-kryptografi")).toBeTruthy();
  });

  it("renderar en radar med en anpassad ringuppsättning (3 egna ringar)", () => {
    const rings = [
      { id: "kor", label: "Kör", blurb: "I drift.", color: "#0e7c7b" },
      { id: "testa", label: "Testa", blurb: "Pilot.", color: "#1d4e74" },
      { id: "vanta", label: "Vänta", blurb: "Avvakta.", color: "#64718a" },
    ];
    const blips = [
      {
        id: "yttre",
        name: "Yttersta signalen",
        segmentId: "infra",
        ring: "vanta",
        description: "Beskrivning.",
        implications: "Implikationer.",
      },
    ];
    render(<RadarChart segments={SEGMENTS} blips={blips} rings={rings} />);

    // Blippen placeras via radarns egna ringar (annars hittas inte ringen "vanta").
    const blip = screen.getByRole("button", { name: /Yttersta signalen — Vänta/ });
    expect(blip).toBeTruthy();
    // Den egna ringetiketten syns (i diagram och teckenförklaring).
    expect(screen.getAllByText("Vänta").length).toBeGreaterThan(0);
    // Standardringen "Anta" ska INTE finnas — ringarna kommer från propen.
    expect(screen.queryByText("Anta")).toBeNull();
  });
});

describe("wrapLabel", () => {
  it("låter korta namn ligga på en rad", () => {
    expect(wrapLabel("Säkerhet")).toEqual(["Säkerhet"]);
  });

  it("behåller ett långt enskilt ord på en rad (inget att bryta på)", () => {
    expect(wrapLabel("Post-kvant-kryptografi")).toEqual(["Post-kvant-kryptografi"]);
  });

  it("bryter ett flerords-namn på ordgräns", () => {
    expect(wrapLabel("AI på arbetsmarknaden")).toEqual(["AI på", "arbetsmarknaden"]);
  });

  it("avkortar med … istället för att spilla över på en tredje rad", () => {
    const lines = wrapLabel("Svensk implementeringsaxel 2026 2027 extra ord");
    expect(lines).toHaveLength(2);
    expect(lines[lines.length - 1].endsWith("…")).toBe(true);
  });

  it("överskrider aldrig maxLines", () => {
    const lines = wrapLabel("ett två tre fyra fem sex sju åtta nio tio elva tolv");
    expect(lines.length).toBeLessThanOrEqual(2);
  });
});
