// web/src/lib/stores/sqlite-stores.test.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import { openDatabase } from "@/lib/db/client";
import {
  blogStoreContract,
  foresightStoreContract,
  radarStoreContract,
} from "./store-contract";
import { SqliteBlogStore } from "./sqlite-blog-store";
import { SqliteContentStore } from "./sqlite-content-store";
import { SqliteForesightStore } from "./sqlite-foresight-store";
import { SqliteRadarStore } from "./sqlite-radar-store";
import { ConflictError, NotFoundError } from "./types";

const data = siteData as unknown as SiteData;

function testDb() {
  return openDatabase(":memory:");
}

blogStoreContract("SqliteBlogStore", () => new SqliteBlogStore(testDb()));
foresightStoreContract("SqliteForesightStore", () => new SqliteForesightStore(testDb()));
radarStoreContract("SqliteRadarStore", () => new SqliteRadarStore(testDb()));

describe("SqliteContentStore", () => {
  async function seededStore() {
    const store = new SqliteContentStore(testDb());
    for (const area of data.expertAreas) await store.createArea(area);
    for (const expert of data.experts) await store.createExpert(expert);
    return store;
  }

  it("bevarar insättningsordningen och hämtar per slug", async () => {
    const store = await seededStore();
    expect((await store.listExperts()).map((e) => e.slug)).toEqual(
      data.experts.map((e) => e.slug),
    );
    expect((await store.listAreas()).map((a) => a.slug)).toEqual(
      data.expertAreas.map((a) => a.slug),
    );
    expect((await store.getExpert(data.experts[0].slug))?.name).toBe(data.experts[0].name);
  });

  it("kastar ConflictError vid dubblett och NotFoundError vid okänd slug", async () => {
    const store = await seededStore();
    await expect(store.createExpert(data.experts[0])).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteExpert("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
    await expect(store.createArea(data.expertAreas[0])).rejects.toBeInstanceOf(ConflictError);
  });

  it("vägrar skapa expert med okänt områdes-slug", async () => {
    const store = await seededStore();
    await expect(
      store.createExpert({ ...data.experts[0], slug: "ny-expert", id: "ny-id", areaSlugs: ["finns-inte"] }),
    ).rejects.toThrow(/Okänt expertområde/);
  });

  it("vägrar ta bort område som refereras av en expert", async () => {
    const store = await seededStore();
    const referencedArea = data.experts[0].areaSlugs[0];
    await expect(store.deleteArea(referencedArea)).rejects.toThrow(/refereras av/);
  });

  it("uppdaterar och tar bort experter", async () => {
    const store = await seededStore();
    const expert = data.experts[0];
    const updated = await store.updateExpert(expert.slug, { ...expert, name: "Nytt Namn" });
    expect(updated.name).toBe("Nytt Namn");
    expect((await store.getExpert(expert.slug))?.name).toBe("Nytt Namn");

    await store.deleteExpert(expert.slug);
    expect(await store.getExpert(expert.slug)).toBeNull();
  });
});
