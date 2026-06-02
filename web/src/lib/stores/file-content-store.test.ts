// web/src/lib/stores/file-content-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import { FileContentStore } from "./file-content-store";
import { ConflictError, NotFoundError } from "./types";

const data = siteData as unknown as SiteData;

let dir: string;
let store: FileContentStore;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-content-"));
  await fs.writeFile(path.join(dir, "site-data.json"), JSON.stringify(siteData), "utf-8");
  store = new FileContentStore(dir);
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileContentStore experter", () => {
  it("listar och hämtar experter", async () => {
    const experts = await store.listExperts();
    expect(experts.length).toBe(data.experts.length);
    const first = await store.getExpert(data.experts[0].slug);
    expect(first?.name).toBe(data.experts[0].name);
    expect(await store.getExpert("finns-inte")).toBeNull();
  });

  it("uppdaterar en expert och bevarar config", async () => {
    const target = data.experts[0];
    const updated = { ...target, name: "Nytt Namn" };
    const result = await store.updateExpert(target.slug, updated);
    expect(result.name).toBe("Nytt Namn");

    const onDisk = JSON.parse(
      await fs.readFile(path.join(dir, "site-data.json"), "utf-8"),
    );
    expect(onDisk.site.name).toBe(data.site.name);
    expect(onDisk.experts.find((e: { slug: string }) => e.slug === target.slug).name).toBe(
      "Nytt Namn",
    );
  });

  it("kastar NotFoundError vid uppdatering av okänd slug", async () => {
    await expect(store.updateExpert("finns-inte", data.experts[0])).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("kastar ConflictError vid skapande av befintlig slug", async () => {
    await expect(store.createExpert(data.experts[0])).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("FileContentStore områden", () => {
  it("listar och uppdaterar områden", async () => {
    const areas = await store.listAreas();
    expect(areas.length).toBe(data.expertAreas.length);
    const target = data.expertAreas[0];
    const result = await store.updateArea(target.slug, { ...target, name: "Nytt Område" });
    expect(result.name).toBe("Nytt Område");
  });
});
