// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileForesightStore } from "./file-foresight-store";
import { ConflictError, NotFoundError } from "./types";

let dir: string;
let store: FileForesightStore;

const META = {
  slug: "digital-suveranitet-2026-2030",
  title: "Digital suveränitet 2026–2030",
  date: "2026-05-29T10:00:00.000Z",
  authorName: "Chefsstrateg",
  areaSlugs: ["digitalisering"],
  excerpt: "Sammanfattning.",
  horizon: "2026–2030",
};

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-foresight-"));
  await fs.writeFile(path.join(dir, "foresight-data.json"), JSON.stringify({ foresights: [] }), "utf-8");
  store = new FileForesightStore(dir);
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileForesightStore", () => {
  it("skapar, hämtar, uppdaterar och tar bort en foresight", async () => {
    await store.createForesight(META, "# Rubrik\n\nText.");
    expect(await store.listForesights()).toHaveLength(1);

    const got = await store.getForesight("digital-suveranitet-2026-2030");
    expect(got?.meta.title).toBe("Digital suveränitet 2026–2030");
    expect(got?.markdown).toContain("# Rubrik");

    await store.updateForesight("digital-suveranitet-2026-2030", { markdown: "# Ny\n\nNytt." });
    expect((await store.getForesight("digital-suveranitet-2026-2030"))?.markdown).toContain("# Ny");

    await store.deleteForesight("digital-suveranitet-2026-2030");
    expect(await store.getForesight("digital-suveranitet-2026-2030")).toBeNull();
    await expect(
      fs.access(path.join(dir, "foresight", "digital-suveranitet-2026-2030.md")),
    ).rejects.toThrow();
  });

  it("kastar ConflictError vid dubblett och NotFoundError för okänd slug", async () => {
    await store.createForesight(META, "x");
    await expect(store.createForesight(META, "y")).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteForesight("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});
