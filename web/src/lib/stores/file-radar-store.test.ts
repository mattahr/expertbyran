// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileRadarStore } from "./file-radar-store";
import { ConflictError, NotFoundError } from "./types";

let dir: string;
let store: FileRadarStore;

const META = {
  slug: "teknikradar-2026",
  title: "Teknikradar 2026",
  date: "2026-06-03T00:00:00.000Z",
  segments: [
    { id: "ai-agenter", name: "AI & agenter" },
    { id: "infra", name: "Infrastruktur" },
    { id: "sakerhet", name: "Säkerhet" },
    { id: "styrning", name: "Styrning" },
  ],
};
const BLIPS = [
  {
    id: "pqc",
    name: "Post-kvant-kryptografi",
    segmentId: "sakerhet",
    ring: "prova" as const,
    description: "Beskrivning.",
    implications: "Implikationer.",
  },
];

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-radar-"));
  await fs.writeFile(path.join(dir, "radar-data.json"), JSON.stringify({ radars: [] }), "utf-8");
  store = new FileRadarStore(dir);
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileRadarStore", () => {
  it("skapar, hämtar, uppdaterar och tar bort en radar", async () => {
    await store.createRadar(META, BLIPS);

    expect(await store.listRadars()).toHaveLength(1);

    const got = await store.getRadar("teknikradar-2026");
    expect(got?.meta.title).toBe("Teknikradar 2026");
    expect(got?.blips).toHaveLength(1);

    await store.updateRadar("teknikradar-2026", {
      blips: [...BLIPS, { ...BLIPS[0], id: "rag", name: "RAG", segmentId: "ai-agenter" }],
    });
    expect((await store.getRadar("teknikradar-2026"))?.blips).toHaveLength(2);

    await store.deleteRadar("teknikradar-2026");
    expect(await store.getRadar("teknikradar-2026")).toBeNull();
    await expect(fs.access(path.join(dir, "radar", "teknikradar-2026.json"))).rejects.toThrow();
  });

  it("kastar ConflictError vid dubblett och NotFoundError för okänd slug", async () => {
    await store.createRadar(META, BLIPS);
    await expect(store.createRadar(META, BLIPS)).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteRadar("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("kastar vid blip som pekar på okänt segment", async () => {
    await expect(
      store.createRadar(META, [{ ...BLIPS[0], segmentId: "finns-ej" }]),
    ).rejects.toThrow(/segment/i);
  });
});
