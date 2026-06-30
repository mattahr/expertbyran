// web/src/lib/stores/store-contract.ts
//
// Delad kontraktssvit: samma beteendetester körs mot både in-memory- och
// SQLite-implementationerna så att de inte driftar isär. Anropas från
// sqlite-stores.test.ts respektive memory-stores.test.ts.
import { describe, expect, it } from "vitest";

import type { BlogPostEntry } from "@/lib/blog/schema";
import type { ForesightEntry } from "@/lib/foresight/schema";
import type { Blip, RadarMeta } from "@/lib/radar/schema";
import type { AnalyticsStore, BlogStore, ForesightStore, RadarStore, VisitInsert } from "./types";
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

function visit(overrides: Partial<VisitInsert>): VisitInsert {
  return {
    ts: 0,
    day: "2026-06-01",
    hour: 12,
    path: "/",
    referrerFull: null,
    referrerHost: null,
    source: "direct",
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    country: null,
    countryName: null,
    ip: "127.0.0.1",
    visitorId: "v0",
    uaRaw: null,
    browser: null,
    browserVersion: null,
    os: null,
    osVersion: null,
    device: "desktop",
    deviceBrand: null,
    deviceModel: null,
    isBot: false,
    lang: null,
    languages: null,
    timezone: null,
    screenW: null,
    screenH: null,
    viewportW: null,
    viewportH: null,
    dpr: null,
    ...overrides,
  };
}

export function analyticsStoreContract(
  name: string,
  makeStore: () => Promise<AnalyticsStore> | AnalyticsStore,
) {
  describe(`${name}: AnalyticsStore-kontrakt`, () => {
    it("aggregerar översikt med unika besökare och bot-exkludering", async () => {
      const store = await makeStore();
      store.record(visit({ ts: 100, day: "2026-06-01", path: "/a", visitorId: "V1", country: "SE", countryName: "Sverige", browser: "Chrome", os: "Windows", device: "desktop" }));
      store.record(visit({ ts: 200, day: "2026-06-01", path: "/a", visitorId: "V1", country: "SE", countryName: "Sverige", browser: "Chrome", os: "Windows", device: "desktop" }));
      store.record(visit({ ts: 300, day: "2026-06-02", path: "/b", visitorId: "V2", country: "US", countryName: "USA", browser: "Firefox", os: "macOS", device: "mobile", source: "search", referrerHost: "google.com" }));
      store.record(visit({ ts: 400, day: "2026-06-02", path: "/a", visitorId: "BOT", isBot: true, browser: "Bot", device: "bot" }));

      const r = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true });
      expect(r.summary.pageviews).toBe(3);
      expect(r.summary.visitors).toBe(2);
      expect(r.summary.days).toBe(2);
      expect(r.summary.botPageviews).toBe(1);
      expect(r.timeseries).toEqual([
        { day: "2026-06-01", pageviews: 2, visitors: 1 },
        { day: "2026-06-02", pageviews: 1, visitors: 1 },
      ]);
      expect(r.topPages[0]).toEqual({ path: "/a", pageviews: 2, visitors: 1 });
      expect(r.topCountries.find((c) => c.country === "SE")).toEqual({ country: "SE", countryName: "Sverige", pageviews: 2, visitors: 1 });
      expect(r.topReferrers).toEqual([{ host: "google.com", pageviews: 1 }]);

      const all = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: false });
      expect(all.summary.pageviews).toBe(4);
      expect(all.topDevices.find((d) => d.device === "bot")).toEqual({ device: "bot", pageviews: 1 });
    });

    it("respekterar datumgränser", async () => {
      const store = await makeStore();
      store.record(visit({ day: "2026-05-31", path: "/old" }));
      store.record(visit({ day: "2026-06-15", path: "/in" }));
      const r = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true });
      expect(r.summary.pageviews).toBe(1);
      expect(r.topPages[0].path).toBe("/in");
    });

    it("paginerar och filtrerar besökslistan, nyast först", async () => {
      const store = await makeStore();
      for (let i = 0; i < 5; i++) {
        store.record(visit({ ts: i, day: "2026-06-01", path: i % 2 ? "/a" : "/b", ip: `1.1.1.${i}`, country: i < 3 ? "SE" : "US" }));
      }
      const p1 = await store.listVisits({ from: "2026-06-01", to: "2026-06-30", page: 1, pageSize: 2, excludeBots: true });
      expect(p1.total).toBe(5);
      expect(p1.rows).toHaveLength(2);
      expect(p1.rows[0].ts).toBe(4);

      const se = await store.listVisits({ from: "2026-06-01", to: "2026-06-30", page: 1, pageSize: 50, excludeBots: true, country: "SE" });
      expect(se.total).toBe(3);

      const q = await store.listVisits({ from: "2026-06-01", to: "2026-06-30", page: 1, pageSize: 50, excludeBots: true, q: "1.1.1.4" });
      expect(q.total).toBe(1);
      expect(q.rows[0].ip).toBe("1.1.1.4");
    });

    it("söker literalt — LIKE-wildcards (%/_) tolkas inte", async () => {
      const store = await makeStore();
      store.record(visit({ ts: 1, day: "2026-06-01", path: "/a%b", ip: "10.0.0.1" }));
      store.record(visit({ ts: 2, day: "2026-06-01", path: "/azzb", ip: "10.0.0.2" }));
      const r = await store.listVisits({ from: "2026-06-01", to: "2026-06-30", page: 1, pageSize: 50, excludeBots: true, q: "a%b" });
      expect(r.total).toBe(1);
      expect(r.rows[0].path).toBe("/a%b");
    });

    it("grupperar kampanjer på hela tripeln utan separatorkollision", async () => {
      const store = await makeStore();
      store.record(visit({ day: "2026-06-01", utmCampaign: "x y", utmSource: "a", utmMedium: null }));
      store.record(visit({ day: "2026-06-01", utmCampaign: "x", utmSource: "y a", utmMedium: null }));
      const r = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true });
      expect(r.topCampaigns).toHaveLength(2);
    });

    it("grupperar sektioner och respekterar drill-down-filter", async () => {
      const store = await makeStore();
      store.record(visit({ ts: 1, day: "2026-06-01", path: "/blogg/a", visitorId: "V1", country: "SE", countryName: "Sverige" }));
      store.record(visit({ ts: 2, day: "2026-06-01", path: "/blogg/b", visitorId: "V1", country: "SE", countryName: "Sverige" }));
      store.record(visit({ ts: 3, day: "2026-06-02", path: "/foresight/x", visitorId: "V2", country: "US", countryName: "USA" }));

      const r = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true });
      expect(r.sections).toEqual([
        { section: "/blogg", pageviews: 2, visitors: 1 },
        { section: "/foresight", pageviews: 1, visitors: 1 },
      ]);

      const blogg = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true, pathPrefix: "/blogg" });
      expect(blogg.summary.pageviews).toBe(2);
      expect(blogg.topPages.map((p) => p.path).sort()).toEqual(["/blogg/a", "/blogg/b"]);

      const se = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true, country: "SE" });
      expect(se.summary.pageviews).toBe(2);
      expect(se.summary.visitors).toBe(1);

      // Filtrera på besökare (cookielös hash) — "återvändande användare"
      const v1 = await store.overview({ from: "2026-06-01", to: "2026-06-30", excludeBots: true, visitorId: "V1" });
      expect(v1.summary.pageviews).toBe(2);
      const v1visits = await store.listVisits({ from: "2026-06-01", to: "2026-06-30", page: 1, pageSize: 50, excludeBots: true, visitorId: "V1" });
      expect(v1visits.total).toBe(2);
      expect(v1visits.rows.every((row) => row.visitorId === "V1")).toBe(true);
    });

    it("earliestDay returnerar minsta dagen eller null", async () => {
      const store = await makeStore();
      expect(store.earliestDay()).toBeNull();
      store.record(visit({ day: "2026-06-01" }));
      store.record(visit({ day: "2026-05-20" }));
      expect(store.earliestDay()).toBe("2026-05-20");
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
