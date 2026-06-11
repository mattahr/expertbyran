// web/src/lib/stores/store-contract.ts
//
// Delad kontraktssvit: samma beteendetester körs mot både in-memory- och
// SQLite-implementationerna så att de inte driftar isär. Anropas från
// sqlite-stores.test.ts respektive memory-stores.test.ts.
import { describe, expect, it } from "vitest";

import type { BlogPostEntry } from "@/lib/blog/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";
import type { Blip, RadarMeta } from "@/lib/radar/schema";
import type { BlogStore, ForesightStore, RadarStore } from "./types";
import { ConflictError, NotFoundError } from "./types";

function post(slug: string, date: string, areaSlugs: string[] = ["revisionsmetodik"]): BlogPostEntry {
  return {
    slug,
    title: `Titel ${slug}`,
    date,
    authorName: "Testförfattare",
    areaSlugs,
    excerpt: `Utdrag för ${slug}.`,
  };
}

export function blogStoreContract(name: string, makeStore: () => Promise<BlogStore> | BlogStore) {
  describe(`${name}: BlogStore-kontrakt`, () => {
    it("skapar inlägg, renderar HTML vid skrivning och hämtar per slug", async () => {
      const store = await makeStore();
      await store.createPost(post("a", "2026-01-01T10:00:00.000Z"), "# Rubrik\n\nText.");

      const stored = await store.getPost("a");
      expect(stored?.meta.slug).toBe("a");
      expect(stored?.markdown).toBe("# Rubrik\n\nText.");
      expect(stored?.html).toContain("<h1");
    });

    it("returnerar null för okänd slug", async () => {
      const store = await makeStore();
      expect(await store.getPost("saknas")).toBeNull();
    });

    it("listar nyast först", async () => {
      const store = await makeStore();
      await store.createPost(post("aldre", "2025-01-01T10:00:00.000Z"), "x");
      await store.createPost(post("nyare", "2026-01-01T10:00:00.000Z"), "x");

      const posts = await store.listPosts();
      expect(posts.map((p) => p.slug)).toEqual(["nyare", "aldre"]);
    });

    it("paginerar med totalantal och områdesfilter", async () => {
      const store = await makeStore();
      await store.createPost(post("p1", "2026-01-03T10:00:00.000Z", ["digitalisering"]), "x");
      await store.createPost(post("p2", "2026-01-02T10:00:00.000Z", ["revisionsmetodik"]), "x");
      await store.createPost(post("p3", "2026-01-01T10:00:00.000Z", ["digitalisering", "cyber"]), "x");

      const page1 = await store.listPostsPage({ offset: 0, limit: 2 });
      expect(page1.total).toBe(3);
      expect(page1.posts.map((p) => p.slug)).toEqual(["p1", "p2"]);

      const page2 = await store.listPostsPage({ offset: 2, limit: 2 });
      expect(page2.posts.map((p) => p.slug)).toEqual(["p3"]);

      const filtered = await store.listPostsPage({
        offset: 0,
        limit: 10,
        areaSlugs: ["digitalisering"],
      });
      expect(filtered.total).toBe(2);
      expect(filtered.posts.map((p) => p.slug)).toEqual(["p1", "p3"]);

      expect(await store.listUsedAreaSlugs()).toEqual(["cyber", "digitalisering", "revisionsmetodik"]);
    });

    it("uppdaterar metadata utan att tappa innehåll och renderar om vid ny markdown", async () => {
      const store = await makeStore();
      await store.createPost(post("a", "2026-01-01T10:00:00.000Z"), "# Ett");

      await store.updatePost("a", { meta: { ...post("a", "2026-01-01T10:00:00.000Z"), title: "Ny titel" } });
      let stored = await store.getPost("a");
      expect(stored?.meta.title).toBe("Ny titel");
      expect(stored?.html).toContain("Ett");

      await store.updatePost("a", { markdown: "# Två" });
      stored = await store.getPost("a");
      expect(stored?.html).toContain("Två");
    });

    it("flyttar innehållet vid slug-byte", async () => {
      const store = await makeStore();
      await store.createPost(post("gammal", "2026-01-01T10:00:00.000Z"), "# Innehåll");

      await store.updatePost("gammal", { meta: post("ny", "2026-01-01T10:00:00.000Z") });
      expect(await store.getPost("gammal")).toBeNull();
      const moved = await store.getPost("ny");
      expect(moved?.markdown).toBe("# Innehåll");
      expect(moved?.html).toContain("Innehåll");
    });

    it("kastar ConflictError vid dubblettslug och NotFoundError vid okänd slug", async () => {
      const store = await makeStore();
      await store.createPost(post("a", "2026-01-01T10:00:00.000Z"), "x");

      await expect(store.createPost(post("a", "2026-01-01T10:00:00.000Z"), "x")).rejects.toBeInstanceOf(ConflictError);
      await expect(store.updatePost("saknas", { markdown: "x" })).rejects.toBeInstanceOf(NotFoundError);
      await expect(store.deletePost("saknas")).rejects.toBeInstanceOf(NotFoundError);
    });

    it("tar bort inlägg", async () => {
      const store = await makeStore();
      await store.createPost(post("a", "2026-01-01T10:00:00.000Z"), "x");
      await store.deletePost("a");
      expect(await store.getPost("a")).toBeNull();
      expect((await store.listPostsPage({ offset: 0, limit: 10 })).total).toBe(0);
    });
  });
}

function foresight(slug: string, date: string): ForesightEntry {
  return {
    slug,
    title: `Foresight ${slug}`,
    date,
    authorName: "Chefsstrateg",
    areaSlugs: ["digitalisering"],
    excerpt: `Utdrag för ${slug}.`,
    horizon: "2026–2030",
  };
}

export function foresightStoreContract(
  name: string,
  makeStore: () => Promise<ForesightStore> | ForesightStore,
) {
  describe(`${name}: ForesightStore-kontrakt`, () => {
    it("skapar, renderar HTML vid skrivning, paginerar och tar bort", async () => {
      const store = await makeStore();
      await store.createForesight(foresight("f1", "2026-01-02T10:00:00.000Z"), "# Framtid");
      await store.createForesight(foresight("f2", "2026-01-01T10:00:00.000Z"), "# Dåtid");

      const stored = await store.getForesight("f1");
      expect(stored?.html).toContain("Framtid");
      expect(stored?.meta.horizon).toBe("2026–2030");

      expect((await store.listForesights()).map((f) => f.slug)).toEqual(["f1", "f2"]);

      const page = await store.listForesightsPage({ offset: 1, limit: 1 });
      expect(page.total).toBe(2);
      expect(page.foresights.map((f) => f.slug)).toEqual(["f2"]);

      await store.deleteForesight("f1");
      expect(await store.getForesight("f1")).toBeNull();
    });

    it("kastar ConflictError vid dubblett och NotFoundError vid okänd slug", async () => {
      const store = await makeStore();
      await store.createForesight(foresight("f1", "2026-01-01T10:00:00.000Z"), "x");
      await expect(store.createForesight(foresight("f1", "2026-01-01T10:00:00.000Z"), "x")).rejects.toBeInstanceOf(ConflictError);
      await expect(store.deleteForesight("saknas")).rejects.toBeInstanceOf(NotFoundError);
    });
  });
}

function radar(slug: string, date: string): { meta: RadarMeta; blips: Blip[] } {
  return {
    meta: {
      slug,
      title: `Radar ${slug}`,
      subtitle: "Undertitel",
      version: "1.0",
      date,
      segments: [
        { id: "verktyg", name: "Verktyg" },
        { id: "metoder", name: "Metoder" },
        { id: "plattformar", name: "Plattformar" },
        { id: "tekniker", name: "Tekniker" },
      ],
    },
    blips: [
      {
        id: "ai-granskning",
        name: "AI-granskning",
        segmentId: "metoder",
        ring: "prova",
        description: "Maskinassisterad granskning.",
        implications: "Kräver kvalitetskontroll.",
        areaSlugs: ["digitalisering"],
      },
    ],
  };
}

export function radarStoreContract(name: string, makeStore: () => Promise<RadarStore> | RadarStore) {
  describe(`${name}: RadarStore-kontrakt`, () => {
    it("skapar, listar nyast först och hämtar med blips", async () => {
      const store = await makeStore();
      const r1 = radar("r1", "2025-01-01T10:00:00.000Z");
      const r2 = radar("r2", "2026-01-01T10:00:00.000Z");
      await store.createRadar(r1.meta, r1.blips);
      await store.createRadar(r2.meta, r2.blips);

      expect((await store.listRadars()).map((r) => r.slug)).toEqual(["r2", "r1"]);

      const detail = await store.getRadar("r1");
      expect(detail?.meta.subtitle).toBe("Undertitel");
      expect(detail?.blips).toHaveLength(1);
      expect(detail?.blips[0].areaSlugs).toEqual(["digitalisering"]);
    });

    it("uppdaterar blips och validerar segmentintegritet", async () => {
      const store = await makeStore();
      const { meta, blips } = radar("r1", "2026-01-01T10:00:00.000Z");
      await store.createRadar(meta, blips);

      await store.updateRadar("r1", {
        blips: [
          ...blips,
          {
            id: "ny",
            name: "Ny",
            segmentId: "verktyg",
            ring: "bevaka",
            description: "Pilot.",
            implications: "Bygg kompetens.",
          },
        ],
      });
      expect((await store.getRadar("r1"))?.blips).toHaveLength(2);

      await expect(
        store.updateRadar("r1", {
          blips: [{ ...blips[0], segmentId: "finns-inte" }],
        }),
      ).rejects.toThrow(/okänt segment/);
    });

    it("kastar ConflictError vid dubblett och NotFoundError vid okänd slug", async () => {
      const store = await makeStore();
      const { meta, blips } = radar("r1", "2026-01-01T10:00:00.000Z");
      await store.createRadar(meta, blips);
      await expect(store.createRadar(meta, blips)).rejects.toBeInstanceOf(ConflictError);
      await expect(store.deleteRadar("saknas")).rejects.toBeInstanceOf(NotFoundError);
    });
  });
}
