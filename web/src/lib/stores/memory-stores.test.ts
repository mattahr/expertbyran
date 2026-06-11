// web/src/lib/stores/memory-stores.test.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import {
  InMemoryBlogStore,
  InMemoryConfigStore,
  InMemoryContentStore,
  InMemoryForesightStore,
  InMemoryRadarStore,
} from "./memory-stores";
import { ConflictError, NotFoundError } from "./types";
import {
  blogStoreContract,
  foresightStoreContract,
  radarStoreContract,
} from "./store-contract";
import type { Blip, RadarMeta } from "@/lib/radar/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";

const data = siteData as unknown as SiteData;

// Samma kontraktssvit som körs mot SQLite-storesen i sqlite-stores.test.ts.
blogStoreContract("InMemoryBlogStore", () => new InMemoryBlogStore());
foresightStoreContract("InMemoryForesightStore", () => new InMemoryForesightStore());
radarStoreContract("InMemoryRadarStore", () => new InMemoryRadarStore());

function radarFixture(): { meta: RadarMeta; blips: Blip[] } {
  const meta: RadarMeta = {
    slug: "teknikradar",
    title: "Teknikradar",
    date: "2026-06-03T00:00:00.000Z",
    segments: [
      { id: "verktyg", name: "Verktyg" },
      { id: "metoder", name: "Metoder" },
      { id: "plattformar", name: "Plattformar" },
      { id: "tekniker", name: "Tekniker" },
    ],
  };
  const blips: Blip[] = [
    {
      id: "ai-granskning",
      name: "AI-granskning",
      segmentId: "metoder",
      ring: "prova" as const,
      description: "Maskinassisterad granskning av underlag.",
      implications: "Snabbare iteration, kräver kvalitetskontroll.",
    },
  ];
  return { meta, blips };
}

describe("InMemoryContentStore", () => {
  it("speglar fil-storens kontrakt", async () => {
    const store = new InMemoryContentStore(data.experts, data.expertAreas);
    expect((await store.listExperts()).length).toBe(data.experts.length);
    await expect(store.createExpert(data.experts[0])).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteExpert("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("InMemoryBlogStore", () => {
  it("skapar och hämtar inlägg", async () => {
    const store = new InMemoryBlogStore();
    await store.createPost(
      {
        slug: "x",
        title: "X",
        date: "2026-04-15T10:00:00.000Z",
        authorName: "A",
        areaSlugs: ["revisionsmetodik"],
        excerpt: "e",
      },
      "# X",
    );
    expect((await store.getPost("x"))?.markdown).toBe("# X");
  });
});

describe("InMemoryRadarStore", () => {
  it("skapar och hämtar radar", async () => {
    const store = new InMemoryRadarStore();
    const { meta, blips } = radarFixture();
    await store.createRadar(meta, blips);
    expect((await store.listRadars()).length).toBe(1);
    const detail = await store.getRadar("teknikradar");
    expect(detail?.meta.slug).toBe("teknikradar");
    expect(detail?.blips).toHaveLength(1);
    expect(detail?.blips[0].segmentId).toBe("metoder");
  });

  it("uppdaterar blips och speglar i getRadar", async () => {
    const store = new InMemoryRadarStore();
    const { meta, blips } = radarFixture();
    await store.createRadar(meta, blips);
    const nextBlips: Blip[] = [
      ...blips,
      {
        id: "ny-plattform",
        name: "Ny plattform",
        segmentId: "plattformar",
        ring: "prova" as const,
        description: "Pilot av ny plattform.",
        implications: "Bygg kompetens stegvis.",
      },
    ];
    await store.updateRadar("teknikradar", { blips: nextBlips });
    expect((await store.getRadar("teknikradar"))?.blips).toHaveLength(2);
  });

  it("tar bort radar", async () => {
    const store = new InMemoryRadarStore();
    const { meta, blips } = radarFixture();
    await store.createRadar(meta, blips);
    await store.deleteRadar("teknikradar");
    expect(await store.getRadar("teknikradar")).toBeNull();
  });

  it("kastar ConflictError vid dubblettslug och NotFoundError vid okänd slug", async () => {
    const store = new InMemoryRadarStore();
    const { meta, blips } = radarFixture();
    await store.createRadar(meta, blips);
    await expect(store.createRadar(meta, blips)).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteRadar("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});

function foresightFixture(): ForesightEntry {
  return {
    slug: "digital-framtid",
    title: "Digital framtid",
    date: "2026-05-01T10:00:00.000Z",
    authorName: "Chefsstrateg",
    areaSlugs: ["digitalisering"],
    excerpt: "En analys av digitaliseringens framtid.",
  };
}

describe("InMemoryForesightStore", () => {
  it("skapar och hämtar foresight", async () => {
    const store = new InMemoryForesightStore();
    const meta = foresightFixture();
    await store.createForesight(meta, "# Digital framtid");
    expect((await store.listForesights()).length).toBe(1);
    const detail = await store.getForesight("digital-framtid");
    expect(detail?.meta.slug).toBe("digital-framtid");
    expect(detail?.markdown).toBe("# Digital framtid");
  });

  it("uppdaterar markdown och speglar i getForesight", async () => {
    const store = new InMemoryForesightStore();
    const meta = foresightFixture();
    await store.createForesight(meta, "# Ursprung");
    await store.updateForesight("digital-framtid", { markdown: "# Uppdaterad" });
    expect((await store.getForesight("digital-framtid"))?.markdown).toBe("# Uppdaterad");
  });

  it("tar bort foresight och returnerar null", async () => {
    const store = new InMemoryForesightStore();
    const meta = foresightFixture();
    await store.createForesight(meta, "# Digital framtid");
    await store.deleteForesight("digital-framtid");
    expect(await store.getForesight("digital-framtid")).toBeNull();
  });

  it("kastar ConflictError vid dubblettslug", async () => {
    const store = new InMemoryForesightStore();
    const meta = foresightFixture();
    await store.createForesight(meta, "# Digital framtid");
    await expect(store.createForesight(meta, "# Kopia")).rejects.toBeInstanceOf(ConflictError);
  });

  it("kastar NotFoundError vid okänd slug vid delete", async () => {
    const store = new InMemoryForesightStore();
    await expect(store.deleteForesight("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("InMemoryConfigStore", () => {
  it("returnerar config", async () => {
    const store = new InMemoryConfigStore(data);
    expect((await store.getSiteConfig()).site.name).toBe(data.site.name);
  });
});
