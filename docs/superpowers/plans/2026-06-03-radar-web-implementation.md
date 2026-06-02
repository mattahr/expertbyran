# Radar (tech-radar) Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a round, interactive tech-radar in the `web/` Next.js app — a `/radar` list page and a `/radar/[slug]` detail page that renders curated foresight "blips" placed by editorial posture (rings) and theme (segments).

**Architecture:** Mirror the existing **blog** feature exactly: a `RadarStore` behind the storage abstraction (file + in-memory), the REST API (`/api/v1/radars`) as the only write path, Next 16 `unstable_cache` + `revalidateTag("radar","max")` for caching, server components for pages, and one `"use client"` island for the interactive SVG. Unlike blog, a radar's body is **structured JSON** (`{meta, blips}`), not markdown. Rings are a fixed global constant; segments are defined per radar.

**Tech Stack:** Next.js 16.2.3 (App Router), TypeScript 5.9, Zod 4, Vitest 4 (`vitest run`), React 19. Design tokens live in `web/src/app/globals.css`; shared UI classes in `web/src/components/site/site.module.css`.

**Reference spec:** `docs/superpowers/specs/2026-06-03-radar-tech-radar-design.md`. Seed data already committed: `web/radar-data.json` + `web/radar/teknikradar-2026.json`. Static visual reference: `web/radar_example/teknikradar-expertbyran-preview.html`.

**Conventions:** All commands run from `web/`. Swedish UI text with correct å/ä/ö. TDD: write failing test → see it fail → minimal code → see it pass → commit.

---

## File Structure

**Create:**
- `web/src/lib/radar/rings.ts` — fixed ring constant (`RINGS`, `RING_IDS`, `RingId`).
- `web/src/lib/radar/schema.ts` — Zod schemas + types (`Segment`, `RadarMeta`, `Blip`, `RadarDetail`, `RadarCatalog`) + parse/integrity helpers.
- `web/src/lib/stores/file-radar-store.ts` — `FileRadarStore`.
- `web/src/lib/radar/store.ts` — cache layer (`RADAR_TAGS`, `getRadarData`).
- `web/src/lib/radar/query.ts` — `getRadarArchive`, `getRadar`, `formatRadarDate`.
- `web/src/app/api/v1/radars/route.ts` — `GET` (list) + `POST` (create).
- `web/src/app/api/v1/radars/[slug]/route.ts` — `GET` + `PUT` + `DELETE`.
- `web/src/app/radar/page.tsx` — list page.
- `web/src/app/radar/[slug]/page.tsx` — detail page (server).
- `web/src/app/radar/[slug]/RadarChart.tsx` — interactive SVG island (`"use client"`).
- `web/src/app/radar/[slug]/RadarChart.module.css` — styles for the chart + legend + detail panel.
- Tests: `web/src/lib/radar/schema.test.ts`, `web/src/lib/stores/file-radar-store.test.ts`, `web/src/app/api/v1/radars/route.test.ts`, `web/src/app/radar/[slug]/RadarChart.test.tsx`.

**Modify:**
- `web/src/lib/stores/types.ts` — add `RadarStore` interface.
- `web/src/lib/stores/memory-stores.ts` — add `InMemoryRadarStore`.
- `web/src/lib/stores/index.ts` — add `radar` to `Stores` + `getRadarStore()`.
- `web/src/app/refresh/route.ts` — add `"radar"` tag.
- `web/src/components/site/SiteChrome.tsx` — add nav link after `/blogg`.

---

## Task 1: Ring constant

**Files:**
- Create: `web/src/lib/radar/rings.ts`

- [ ] **Step 1: Create the ring constant**

`web/src/lib/radar/rings.ts`:
```typescript
// Fast ringuppsättning — redaktionell hållning, delas av alla radarer.
// Inre ring = anta, yttre = avvakta. Färgerna är web/:s palett.
export const RING_IDS = ["anta", "prova", "bevaka", "avvakta"] as const;

export type RingId = (typeof RING_IDS)[number];

export type Ring = {
  id: RingId;
  label: string;
  blurb: string;
  color: string;
};

export const RINGS: Ring[] = [
  { id: "anta", label: "Anta", blurb: "I drift, hög mognad", color: "#0e7c7b" },
  { id: "prova", label: "Pröva", blurb: "Pilot, bygg kompetens", color: "#1d4e74" },
  { id: "bevaka", label: "Bevaka", blurb: "Följ utvecklingen aktivt", color: "#d4982b" },
  { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet", color: "#64718a" },
];

export const RING_BY_ID: Record<RingId, Ring> = Object.fromEntries(
  RINGS.map((ring) => [ring.id, ring]),
) as Record<RingId, Ring>;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/radar/rings.ts
git commit -m "feat(radar): fast ringkonstant (anta/prova/bevaka/avvakta)"
```

---

## Task 2: Radar schema + integrity helpers

**Files:**
- Create: `web/src/lib/radar/schema.ts`
- Test: `web/src/lib/radar/schema.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/lib/radar/schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";

import {
  assertRadarIntegrity,
  parseRadarCatalog,
  parseRadarBlips,
  radarInputSchema,
} from "./schema";

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

const BLIP = {
  id: "pqc",
  name: "Post-kvant-kryptografi",
  segmentId: "sakerhet",
  ring: "prova",
  description: "En neutral beskrivning.",
  implications: "Varför det spelar roll.",
};

describe("radar schema", () => {
  it("validerar en korrekt katalog och blips", () => {
    expect(parseRadarCatalog({ radars: [META] }, "test").radars).toHaveLength(1);
    expect(parseRadarBlips({ blips: [BLIP] }, "test").blips).toHaveLength(1);
  });

  it("avvisar för få segment", () => {
    const bad = { radars: [{ ...META, segments: META.segments.slice(0, 2) }] };
    expect(() => parseRadarCatalog(bad, "test")).toThrow();
  });

  it("avvisar ogiltig ring via radarInputSchema", () => {
    const parsed = radarInputSchema.safeParse({ meta: META, blips: [{ ...BLIP, ring: "köp" }] });
    expect(parsed.success).toBe(false);
  });

  it("assertRadarIntegrity kastar för okänt segment", () => {
    expect(() => assertRadarIntegrity(META, [{ ...BLIP, segmentId: "finns-ej" }])).toThrow(
      /segment/i,
    );
  });

  it("assertRadarIntegrity kastar för dubblett-blip-id", () => {
    expect(() => assertRadarIntegrity(META, [BLIP, BLIP])).toThrow(/unik/i);
  });

  it("assertRadarIntegrity accepterar giltiga blips", () => {
    expect(() => assertRadarIntegrity(META, [BLIP])).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/radar/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'`.

- [ ] **Step 3: Write the schema**

`web/src/lib/radar/schema.ts`:
```typescript
import { z } from "zod";

import { RING_IDS } from "@/lib/radar/rings";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-06-03T00:00:00.000Z).",
  });

const segmentSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
});

export const ringSchema = z.enum(RING_IDS);

export const radarMetaSchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    subtitle: z.string().min(1).optional(),
    version: z.string().min(1).optional(),
    date: isoDateTimeSchema,
    segments: z.array(segmentSchema).min(4).max(6),
  })
  .superRefine((meta, ctx) => {
    const seen = new Set<string>();
    meta.segments.forEach((segment, index) => {
      if (seen.has(segment.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["segments", index, "id"],
          message: "Segment-id måste vara unikt inom radarn.",
        });
      }
      seen.add(segment.id);
    });
  });

export const blipSchema = z.object({
  id: slugSchema,
  name: z.string().min(1),
  segmentId: slugSchema,
  ring: ringSchema,
  description: z.string().min(1),
  implications: z.string().min(1),
});

export const radarCatalogSchema = z
  .object({ radars: z.array(radarMetaSchema) })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.radars.forEach((radar, index) => {
      if (seen.has(radar.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["radars", index, "slug"],
          message: "Radarns slug måste vara unik.",
        });
      }
      seen.add(radar.slug);
    });
  });

export const radarBlipsFileSchema = z.object({ blips: z.array(blipSchema) });

// Används av API:et som body-validering vid POST/PUT (formvalidering; segment-
// integritet kontrolleras av assertRadarIntegrity i storen).
export const radarInputSchema = z.object({
  meta: radarMetaSchema,
  blips: z.array(blipSchema),
});

export type Segment = z.infer<typeof segmentSchema>;
export type RadarMeta = z.infer<typeof radarMetaSchema>;
export type Blip = z.infer<typeof blipSchema>;
export type RadarCatalog = z.infer<typeof radarCatalogSchema>;
export type RadarDetail = { meta: RadarMeta; blips: Blip[] };

function formatRadarIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export function parseRadarCatalog(input: unknown, source: string): RadarCatalog {
  const result = radarCatalogSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid radar-data from ${source}`, formatRadarIssues(result.error.issues));
    throw new Error(`Invalid radar-data from ${source}`);
  }
  return result.data;
}

export function parseRadarBlips(input: unknown, source: string): { blips: Blip[] } {
  const result = radarBlipsFileSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid radar blips from ${source}`, formatRadarIssues(result.error.issues));
    throw new Error(`Invalid radar blips from ${source}`);
  }
  return result.data;
}

// Kontrollerar att varje blip pekar på ett segment som finns och att blip-id är unika.
// Kastar Error (API mappar till 400) vid brott.
export function assertRadarIntegrity(meta: RadarMeta, blips: Blip[]): void {
  const segmentIds = new Set(meta.segments.map((segment) => segment.id));
  const seenBlipIds = new Set<string>();
  for (const blip of blips) {
    if (!segmentIds.has(blip.segmentId)) {
      throw new Error(`Blip '${blip.id}' refererar okänt segment '${blip.segmentId}'.`);
    }
    if (seenBlipIds.has(blip.id)) {
      throw new Error(`Blip-id '${blip.id}' måste vara unikt inom radarn.`);
    }
    seenBlipIds.add(blip.id);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/radar/schema.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/radar/schema.ts src/lib/radar/schema.test.ts
git commit -m "feat(radar): zod-schema för RadarMeta/Blip + integritetskontroll"
```

---

## Task 3: RadarStore interface

**Files:**
- Modify: `web/src/lib/stores/types.ts`

- [ ] **Step 1: Add the interface**

In `web/src/lib/stores/types.ts`, add this import near the top (after the existing `BlogPostEntry` import):
```typescript
import type { Blip, RadarMeta } from "@/lib/radar/schema";
```

Then add this interface after the `BlogStore` interface (before the `ConflictError` class):
```typescript
export interface RadarStore {
  listRadars(): Promise<RadarMeta[]>;
  getRadar(slug: string): Promise<{ meta: RadarMeta; blips: Blip[] } | null>;
  createRadar(meta: RadarMeta, blips: Blip[]): Promise<RadarMeta>;
  updateRadar(
    slug: string,
    patch: { meta?: RadarMeta; blips?: Blip[] },
  ): Promise<RadarMeta>;
  deleteRadar(slug: string): Promise<void>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stores/types.ts
git commit -m "feat(radar): RadarStore-interface i storage-abstraktionen"
```

---

## Task 4: FileRadarStore

**Files:**
- Create: `web/src/lib/stores/file-radar-store.ts`
- Test: `web/src/lib/stores/file-radar-store.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/lib/stores/file-radar-store.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/stores/file-radar-store.test.ts`
Expected: FAIL — `Cannot find module './file-radar-store'`.

- [ ] **Step 3: Write the implementation**

`web/src/lib/stores/file-radar-store.ts`:
```typescript
import path from "node:path";

import {
  assertRadarIntegrity,
  parseRadarBlips,
  parseRadarCatalog,
  type Blip,
  type RadarCatalog,
  type RadarMeta,
} from "@/lib/radar/schema";
import type { RadarStore } from "./types";
import { ConflictError, NotFoundError } from "./types";
import {
  atomicWriteFile,
  deleteFileIfExists,
  readJsonFile,
  resolveDataDir,
} from "./fs-helpers";

export class FileRadarStore implements RadarStore {
  private readonly catalogFile: string;
  private readonly radarsDir: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.catalogFile = path.join(dataDir, "radar-data.json");
    this.radarsDir = path.join(dataDir, "radar");
  }

  private async readCatalog(): Promise<RadarCatalog> {
    try {
      const raw = await readJsonFile(this.catalogFile);
      return parseRadarCatalog(raw, this.catalogFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { radars: [] };
      throw error;
    }
  }

  private async writeCatalog(catalog: RadarCatalog): Promise<void> {
    const validated = parseRadarCatalog(catalog, "radar-store-write");
    await atomicWriteFile(this.catalogFile, JSON.stringify(validated, null, 2));
  }

  private blipsPath(slug: string): string {
    return path.join(this.radarsDir, `${slug}.json`);
  }

  private async readBlips(slug: string): Promise<Blip[]> {
    return parseRadarBlips(await readJsonFile(this.blipsPath(slug)), this.blipsPath(slug)).blips;
  }

  private async writeBlips(slug: string, blips: Blip[]): Promise<void> {
    await atomicWriteFile(this.blipsPath(slug), JSON.stringify({ blips }, null, 2));
  }

  async listRadars(): Promise<RadarMeta[]> {
    return (await this.readCatalog()).radars;
  }

  async getRadar(slug: string): Promise<{ meta: RadarMeta; blips: Blip[] } | null> {
    const meta = (await this.readCatalog()).radars.find((r) => r.slug === slug);
    if (!meta) return null;
    return { meta, blips: await this.readBlips(slug) };
  }

  async createRadar(meta: RadarMeta, blips: Blip[]): Promise<RadarMeta> {
    assertRadarIntegrity(meta, blips);
    const catalog = await this.readCatalog();
    if (catalog.radars.some((r) => r.slug === meta.slug)) {
      throw new ConflictError(`Radar with slug ${meta.slug} already exists`);
    }
    catalog.radars.push(meta);
    await this.writeCatalog(catalog);
    await this.writeBlips(meta.slug, blips);
    return meta;
  }

  async updateRadar(
    slug: string,
    patch: { meta?: RadarMeta; blips?: Blip[] },
  ): Promise<RadarMeta> {
    const catalog = await this.readCatalog();
    const index = catalog.radars.findIndex((r) => r.slug === slug);
    if (index === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);

    const nextMeta = patch.meta ?? catalog.radars[index];
    const nextBlips = patch.blips ?? (await this.readBlips(slug));
    assertRadarIntegrity(nextMeta, nextBlips);

    const slugChanged = nextMeta.slug !== slug;
    if (slugChanged && catalog.radars.some((r) => r.slug === nextMeta.slug)) {
      throw new ConflictError(`Radar with slug ${nextMeta.slug} already exists`);
    }

    await this.writeBlips(nextMeta.slug, nextBlips);
    if (slugChanged) await deleteFileIfExists(this.blipsPath(slug));

    catalog.radars[index] = nextMeta;
    await this.writeCatalog(catalog);
    return nextMeta;
  }

  async deleteRadar(slug: string): Promise<void> {
    const catalog = await this.readCatalog();
    const index = catalog.radars.findIndex((r) => r.slug === slug);
    if (index === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);
    catalog.radars.splice(index, 1);
    await this.writeCatalog(catalog);
    await deleteFileIfExists(this.blipsPath(slug));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/stores/file-radar-store.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/file-radar-store.ts src/lib/stores/file-radar-store.test.ts
git commit -m "feat(radar): FileRadarStore (katalog + per-radar blips-fil)"
```

---

## Task 5: InMemoryRadarStore + registration

**Files:**
- Modify: `web/src/lib/stores/memory-stores.ts`
- Modify: `web/src/lib/stores/index.ts`

- [ ] **Step 1: Add InMemoryRadarStore**

In `web/src/lib/stores/memory-stores.ts`, add this import alongside the existing schema imports:
```typescript
import { assertRadarIntegrity, type Blip, type RadarMeta } from "@/lib/radar/schema";
```
Ensure `RadarStore` is included in the import from `./types` (add it to the existing `import type { ... } from "./types"` list), and that `ConflictError, NotFoundError` are imported from `./types`.

Then add this class at the end of the file:
```typescript
export class InMemoryRadarStore implements RadarStore {
  private radars: RadarMeta[] = [];
  private blips = new Map<string, Blip[]>();

  async listRadars() {
    return [...this.radars];
  }
  async getRadar(slug: string) {
    const meta = this.radars.find((r) => r.slug === slug);
    if (!meta) return null;
    return { meta, blips: [...(this.blips.get(slug) ?? [])] };
  }
  async createRadar(meta: RadarMeta, blips: Blip[]) {
    assertRadarIntegrity(meta, blips);
    if (this.radars.some((r) => r.slug === meta.slug)) {
      throw new ConflictError(`Radar with slug ${meta.slug} already exists`);
    }
    this.radars.push(meta);
    this.blips.set(meta.slug, blips);
    return meta;
  }
  async updateRadar(slug: string, patch: { meta?: RadarMeta; blips?: Blip[] }) {
    const i = this.radars.findIndex((r) => r.slug === slug);
    if (i === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.radars[i];
    const nextBlips = patch.blips ?? this.blips.get(slug) ?? [];
    assertRadarIntegrity(nextMeta, nextBlips);
    if (nextMeta.slug !== slug && this.radars.some((r) => r.slug === nextMeta.slug)) {
      throw new ConflictError(`Radar with slug ${nextMeta.slug} already exists`);
    }
    if (nextMeta.slug !== slug) this.blips.delete(slug);
    this.blips.set(nextMeta.slug, nextBlips);
    this.radars[i] = nextMeta;
    return nextMeta;
  }
  async deleteRadar(slug: string) {
    const i = this.radars.findIndex((r) => r.slug === slug);
    if (i === -1) throw new NotFoundError(`Radar with slug ${slug} not found`);
    this.radars.splice(i, 1);
    this.blips.delete(slug);
  }
}
```

- [ ] **Step 2: Register in the composition root**

In `web/src/lib/stores/index.ts`, update imports, the `Stores` type, `getDefaults`, and add `getRadarStore`:
```typescript
import type { BlogStore, ConfigStore, ContentStore, RadarStore } from "./types";
import { FileConfigStore } from "./file-config-store";
import { FileContentStore } from "./file-content-store";
import { FileBlogStore } from "./file-blog-store";
import { FileRadarStore } from "./file-radar-store";

type Stores = {
  config: ConfigStore;
  content: ContentStore;
  blog: BlogStore;
  radar: RadarStore;
};
```
In `getDefaults()`, add `radar: new FileRadarStore(),` to the `defaults = { ... }` object. Then add this exported getter alongside the others:
```typescript
export function getRadarStore(): RadarStore {
  return override?.radar ?? getDefaults().radar;
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/stores/memory-stores.ts src/lib/stores/index.ts
git commit -m "feat(radar): InMemoryRadarStore + getRadarStore i kompositionsroten"
```

---

## Task 6: Cache layer

**Files:**
- Create: `web/src/lib/radar/store.ts`

- [ ] **Step 1: Write the cache module**

`web/src/lib/radar/store.ts`:
```typescript
import { unstable_cache } from "next/cache";

import type { RadarDetail } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";

export const RADAR_TAGS = ["radar"] as const;

const loadRadarData = unstable_cache(
  async (): Promise<{ radars: RadarDetail[] }> => {
    const store = getRadarStore();
    const metas = await store.listRadars();
    const radars = await Promise.all(
      metas.map(async (meta): Promise<RadarDetail> => {
        const full = await store.getRadar(meta.slug);
        return full ?? { meta, blips: [] };
      }),
    );
    return { radars };
  },
  ["radar-data"],
  { tags: [...RADAR_TAGS] },
);

export async function getRadarData(): Promise<{ radars: RadarDetail[] }> {
  return loadRadarData();
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/radar/store.ts
git commit -m "feat(radar): cache-lager via unstable_cache (tag: radar)"
```

---

## Task 7: Query layer

**Files:**
- Create: `web/src/lib/radar/query.ts`

- [ ] **Step 1: Write the query module**

`web/src/lib/radar/query.ts`:
```typescript
import type { RadarDetail, RadarMeta } from "@/lib/radar/schema";
import { getRadarData } from "@/lib/radar/store";

export function formatRadarDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getRadarArchive(): Promise<RadarMeta[]> {
  const { radars } = await getRadarData();
  return radars
    .map((radar) => radar.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getRadar(slug: string): Promise<RadarDetail | null> {
  const { radars } = await getRadarData();
  return radars.find((radar) => radar.meta.slug === slug) ?? null;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/radar/query.ts
git commit -m "feat(radar): query-lager (getRadarArchive, getRadar)"
```

---

## Task 8: API — list + create

**Files:**
- Create: `web/src/app/api/v1/radars/route.ts`
- Test: `web/src/app/api/v1/radars/route.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/app/api/v1/radars/route.test.ts`:
```typescript
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryRadarStore } from "@/lib/stores/memory-stores";
import { GET, POST } from "./route";

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
    ring: "prova",
    description: "Beskrivning.",
    implications: "Implikationer.",
  },
];

function postReq(body: unknown, token = "test-token") {
  return new Request("http://localhost/api/v1/radars", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.API_TOKEN = "test-token";
  __setStoresForTest({ radar: new InMemoryRadarStore() });
});
afterEach(() => {
  __setStoresForTest(null);
});

describe("/api/v1/radars", () => {
  it("GET returnerar tom lista initialt", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ radars: [] });
  });

  it("POST utan token ger 401", async () => {
    const res = await POST(postReq({ meta: META, blips: BLIPS }, "fel") as never);
    expect(res.status).toBe(401);
  });

  it("POST skapar en radar och GET listar den", async () => {
    const created = await POST(postReq({ meta: META, blips: BLIPS }) as never);
    expect(created.status).toBe(201);
    const list = await (await GET()).json();
    expect(list.radars).toHaveLength(1);
  });

  it("POST med blip mot okänt segment ger 400", async () => {
    const res = await POST(
      postReq({ meta: META, blips: [{ ...BLIPS[0], segmentId: "finns-ej" }] }) as never,
    );
    expect(res.status).toBe(400);
  });

  it("POST med dubblett-slug ger 409", async () => {
    await POST(postReq({ meta: META, blips: BLIPS }) as never);
    const res = await POST(postReq({ meta: META, blips: BLIPS }) as never);
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/api/v1/radars/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Write the route**

`web/src/app/api/v1/radars/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import { radarInputSchema } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const radars = await getRadarStore().listRadars();
    return Response.json({ radars });
  } catch (error) {
    console.error("[api] Failed to read radars", error);
    return Response.json({ error: "Failed to read radars" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const parsed = radarInputSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid radar payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created = await getRadarStore().createRadar(parsed.data.meta, parsed.data.blips);
    revalidateTag("radar", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create radar" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/api/v1/radars/route.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/v1/radars/route.ts src/app/api/v1/radars/route.test.ts
git commit -m "feat(radar): API GET/POST /api/v1/radars"
```

---

## Task 9: API — get + update + delete

**Files:**
- Create: `web/src/app/api/v1/radars/[slug]/route.ts`

- [ ] **Step 1: Write the route**

`web/src/app/api/v1/radars/[slug]/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import { blipSchema, radarMetaSchema } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

const radarPatchSchema = z.object({
  meta: radarMetaSchema.optional(),
  blips: z.array(blipSchema).optional(),
});

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getRadarStore().getRadar(slug);
    if (!result) {
      return Response.json({ error: `Radar with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ meta: result.meta, blips: result.blips });
  } catch (error) {
    console.error("[api] Failed to read radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read radar" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const parsed = radarPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid radar payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const updated = await getRadarStore().updateRadar(slug, {
      meta: parsed.data.meta,
      blips: parsed.data.blips,
    });
    const full = await getRadarStore().getRadar(updated.slug);
    revalidateTag("radar", "max");
    return Response.json({ success: true, data: { meta: updated, blips: full?.blips ?? [] } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update radar" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getRadarStore().deleteRadar(slug);
    revalidateTag("radar", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete radar" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/v1/radars/[slug]/route.ts"
git commit -m "feat(radar): API GET/PUT/DELETE /api/v1/radars/[slug]"
```

---

## Task 10: Add radar to the refresh route

**Files:**
- Modify: `web/src/app/refresh/route.ts`

- [ ] **Step 1: Add the radar tag**

In `web/src/app/refresh/route.ts`, change the `TAGS` constant:
```typescript
const TAGS = ["experts", "areas", "blog", "radar"] as const;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/refresh/route.ts
git commit -m "feat(radar): inkludera radar-tagg i /refresh"
```

---

## Task 11: Interactive SVG island (RadarChart)

**Files:**
- Create: `web/src/app/radar/[slug]/RadarChart.tsx`
- Create: `web/src/app/radar/[slug]/RadarChart.module.css`
- Test: `web/src/app/radar/[slug]/RadarChart.test.tsx`

- [ ] **Step 1: Write the failing test**

`web/src/app/radar/[slug]/RadarChart.test.tsx`:
```typescript
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/app/radar/[slug]/RadarChart.test.tsx"`
Expected: FAIL — `Cannot find module './RadarChart'`.

- [ ] **Step 3: Write the component**

`web/src/app/radar/[slug]/RadarChart.tsx`:
```typescript
"use client";

import { useState } from "react";

import type { Blip, Segment } from "@/lib/radar/schema";
import { RINGS, RING_BY_ID, type RingId } from "@/lib/radar/rings";
import styles from "./RadarChart.module.css";

const C = 450;
const R_MAX = 400;
const RING_EDGES = [0, 110, 205, 300, R_MAX];
// Vinkelspann (grader) per segmentindex 0..3, medurs från övre högra kvadranten.
const SEG_RANGE: [number, number][] = [
  [272, 358],
  [2, 88],
  [92, 178],
  [182, 268],
];
const SEG_LABEL_ANGLE = [315, 45, 135, 225];
const SEG_LABEL_COLOR = ["#1d4e74", "#0e7c7b", "#d4982b", "#64718a"];

type PlacedBlip = Blip & { x: number; y: number; number: number };

function placeBlips(segments: Segment[], blips: Blip[]): PlacedBlip[] {
  const segIndex = new Map(segments.map((segment, index) => [segment.id, index]));
  const ringIndex = new Map<RingId, number>(RINGS.map((ring, index) => [ring.id, index]));

  // Gruppera på segment+ring för jämn vinkelfördelning inom varje band.
  const groups = new Map<string, Blip[]>();
  blips.forEach((blip) => {
    const key = `${blip.segmentId}|${blip.ring}`;
    const list = groups.get(key) ?? [];
    list.push(blip);
    groups.set(key, list);
  });

  const placed: PlacedBlip[] = [];
  let counter = 0;
  groups.forEach((group, key) => {
    const [segmentId, ring] = key.split("|");
    const seg = segIndex.get(segmentId);
    const ringNo = ringIndex.get(ring as RingId);
    if (seg === undefined || ringNo === undefined) return;
    const [a0, a1] = SEG_RANGE[seg];
    const rIn = RING_EDGES[ringNo] + 22;
    const rOut = RING_EDGES[ringNo + 1] - 16;
    group.forEach((blip, i) => {
      const frac = (i + 1) / (group.length + 1);
      const ang = ((a0 + (a1 - a0) * frac) * Math.PI) / 180;
      const rr = rIn + (rOut - rIn) * (0.35 + 0.5 * (i % 2));
      placed.push({
        ...blip,
        number: (counter += 1),
        x: C + rr * Math.cos(ang),
        y: C + rr * Math.sin(ang),
      });
    });
  });
  return placed;
}

export function RadarChart({ segments, blips }: { segments: Segment[]; blips: Blip[] }) {
  const placed = placeBlips(segments, blips);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = placed.find((blip) => blip.id === selectedId) ?? null;
  const selectedSegment = selected
    ? segments.find((segment) => segment.id === selected.segmentId)
    : null;

  return (
    <div className={styles.layout}>
      <div className={styles.radarCard}>
        <svg viewBox="0 0 900 900" className={styles.svg} aria-label="Radar">
          {RING_EDGES.slice(1)
            .map((edge, i) => ({ edge, ring: RINGS[i] }))
            .reverse()
            .map(({ edge, ring }) => (
              <circle
                key={ring.id}
                cx={C}
                cy={C}
                r={edge}
                fill={ring.color}
                fillOpacity={0.07}
                stroke="#e2e7ef"
                strokeWidth={1}
              />
            ))}
          {[0, 90, 180, 270].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={C}
                y1={C}
                x2={C + R_MAX * Math.cos(r)}
                y2={C + R_MAX * Math.sin(r)}
                stroke="#e2e7ef"
                strokeWidth={1}
              />
            );
          })}
          {RINGS.map((ring, i) => {
            const r = (RING_EDGES[i] + RING_EDGES[i + 1]) / 2;
            return (
              <text key={ring.id} x={C + 4} y={C - r + 4} className={styles.ringLabel} textAnchor="start">
                {ring.label}
              </text>
            );
          })}
          {segments.slice(0, 4).map((segment, i) => {
            const r = (SEG_LABEL_ANGLE[i] * Math.PI) / 180;
            return (
              <text
                key={segment.id}
                x={C + (R_MAX - 24) * Math.cos(r)}
                y={C + (R_MAX - 24) * Math.sin(r)}
                className={styles.segLabel}
                fill={SEG_LABEL_COLOR[i]}
                textAnchor="middle"
              >
                {segment.name}
              </text>
            );
          })}
          {placed.map((blip) => (
            <g
              key={blip.id}
              className={`${styles.blip} ${selectedId === blip.id ? styles.blipActive : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${blip.name} — ${RING_BY_ID[blip.ring].label}`}
              onClick={() => setSelectedId(blip.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedId(blip.id);
                }
              }}
            >
              <circle cx={blip.x} cy={blip.y} r={14} fill={RING_BY_ID[blip.ring].color} />
              <text x={blip.x} y={blip.y + 4} textAnchor="middle" className={styles.blipNumber}>
                {blip.number}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <aside className={styles.side}>
        <div className={styles.legend}>
          <h3 className={styles.legendTitle}>Hållning</h3>
          {RINGS.map((ring) => (
            <div key={ring.id} className={styles.legRow}>
              <span className={styles.dot} style={{ background: ring.color }} aria-hidden />
              <b>{ring.label}</b> – {ring.blurb}
            </div>
          ))}
        </div>

        <div className={styles.detail}>
          {selected ? (
            <>
              <span className={styles.dTag}>
                <span className={styles.dot} style={{ background: RING_BY_ID[selected.ring].color }} aria-hidden />
                {RING_BY_ID[selected.ring].label}
              </span>
              <h2 className={styles.dTitle}>
                {selected.number}. {selected.name}
              </h2>
              {selectedSegment ? <div className={styles.dSeg}>{selectedSegment.name}</div> : null}
              <p className={styles.dDesc}>{selected.description}</p>
              <div className={styles.dSub}>Implikationer</div>
              <p className={styles.dImpact}>{selected.implications}</p>
            </>
          ) : (
            <div className={styles.empty}>
              <span>Välj en signal</span>
              Klicka på en punkt i radarn för att se hållning, beskrivning och implikationer.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Write the CSS module**

`web/src/app/radar/[slug]/RadarChart.module.css`:
```css
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  align-items: start;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.radarCard {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-sm), var(--shadow-ring);
}
.svg {
  width: 100%;
  height: auto;
  display: block;
}

.ringLabel {
  font-size: 11px;
  font-weight: 600;
  fill: var(--gray-500);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.segLabel {
  font-family: var(--font-display), Georgia, serif;
  font-size: 16px;
}

.blip {
  cursor: pointer;
}
.blip circle {
  stroke: var(--white);
  stroke-width: 1.4;
  transition: filter 0.18s ease;
}
.blip:hover circle {
  filter: drop-shadow(0 0 8px rgba(13, 27, 42, 0.28));
}
.blip:focus {
  outline: none;
}
.blip:focus circle,
.blipActive circle {
  stroke: var(--black);
  stroke-width: 2.4;
}
.blipNumber {
  font-size: 11px;
  font-weight: 600;
  fill: var(--white);
  pointer-events: none;
}

.side {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.legend,
.detail {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  padding: 20px;
  box-shadow: var(--shadow-sm), var(--shadow-ring);
}
.legendTitle {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 400;
  font-size: 18px;
  margin-bottom: 12px;
}
.legRow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray-500);
  margin: 8px 0;
}
.legRow b {
  color: var(--black);
  font-weight: 600;
}
.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex: none;
}
.detail {
  min-height: 240px;
}
.empty {
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.6;
}
.empty span {
  display: block;
  font-family: var(--font-display), Georgia, serif;
  font-size: 20px;
  color: var(--black);
  margin-bottom: 8px;
}
.dTag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 5px 11px;
  border-radius: var(--radius-pill);
  background: var(--gray-100);
}
.dTitle {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 1.1;
  margin: 14px 0 4px;
  color: var(--black);
}
.dSeg {
  font-size: 12.5px;
  color: var(--gold-deep);
  font-weight: 600;
  margin-bottom: 14px;
}
.dDesc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray-600);
}
.dSub {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gray-500);
  margin: 18px 0 8px;
}
.dImpact {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--gray-600);
  background: var(--accent-light);
  border-left: 3px solid var(--accent);
  padding: 10px 14px;
  border-radius: 0 8px 8px 0;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run "src/app/radar/[slug]/RadarChart.test.tsx"`
Expected: PASS (1 test).

> If a CSS variable referenced above (e.g. `--gold-deep`, `--accent-light`, `--shadow-ring`) is missing in `web/src/app/globals.css`, the test still passes (jsdom ignores unknown vars). Verify them visually in Task 14; the names come from the existing blog CSS and `globals.css` palette.

- [ ] **Step 6: Commit**

```bash
git add "src/app/radar/[slug]/RadarChart.tsx" "src/app/radar/[slug]/RadarChart.module.css" "src/app/radar/[slug]/RadarChart.test.tsx"
git commit -m "feat(radar): interaktiv SVG-ö (RadarChart) med detaljpanel"
```

---

## Task 12: Detail page

**Files:**
- Create: `web/src/app/radar/[slug]/page.tsx`

- [ ] **Step 1: Write the page**

`web/src/app/radar/[slug]/page.tsx`:
```typescript
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { getRadar } from "@/lib/radar/query";
import { RadarChart } from "./RadarChart";

type RadarPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RadarPageProps): Promise<Metadata> {
  const { slug } = await params;
  const radar = await getRadar(slug);
  if (!radar) return { title: "Radar saknas" };
  return { title: radar.meta.title, description: radar.meta.subtitle };
}

export default async function RadarDetailPage({ params }: RadarPageProps) {
  const { slug } = await params;
  const radar = await getRadar(slug);
  if (!radar) notFound();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Radar</p>
        <h1 className={styles.heroTitle}>{radar.meta.title}</h1>
        <div className={styles.heroLine} />
        {radar.meta.subtitle ? <p className={styles.heroIntro}>{radar.meta.subtitle}</p> : null}
      </div>

      <section className={styles.section}>
        <RadarChart segments={radar.meta.segments} blips={radar.blips} />
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/radar/[slug]/page.tsx"
git commit -m "feat(radar): detaljsida /radar/[slug]"
```

---

## Task 13: List page

**Files:**
- Create: `web/src/app/radar/page.tsx`

- [ ] **Step 1: Write the page**

`web/src/app/radar/page.tsx`. Reuses existing shared classes from `site.module.css` (`pageWrap`, `hero*`, `section*`, `blogGrid`, `blogCard*`, `emptyState`):
```typescript
import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { formatRadarDate, getRadarArchive } from "@/lib/radar/query";

export const metadata = {
  title: "Radar",
  description: "Expertbyråns tech-radar — teknik och regelverk som påverkar offentlig granskning.",
};

export default async function RadarListPage() {
  const radars = await getRadarArchive();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Radar</p>
        <h1 className={styles.heroTitle}>Tech-radar.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Kuraterade foresight-signaler placerade efter redaktionell hållning och tema — teknik och regelverk som påverkar offentlig granskning.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Radarer</h2>
          <span className={styles.sectionCount}>{`${radars.length} radarer`}</span>
        </div>

        {radars.length === 0 ? (
          <div className={styles.emptyState}>Inga radarer publicerade ännu.</div>
        ) : (
          <div className={styles.blogGrid}>
            {radars.map((radar) => (
              <Link key={radar.slug} href={`/radar/${radar.slug}` as Route} className={styles.blogCard}>
                <div className={styles.blogPostMeta}>
                  <Pill variant="marine">{formatRadarDate(radar.date)}</Pill>
                  {radar.version ? <Pill variant="neutral">{`Version ${radar.version}`}</Pill> : null}
                </div>
                <h3 className={styles.blogCardTitle}>{radar.title}</h3>
                {radar.subtitle ? <p className={styles.blogCardSummary}>{radar.subtitle}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/radar/page.tsx
git commit -m "feat(radar): lista-sida /radar"
```

---

## Task 14: Navigation link

**Files:**
- Modify: `web/src/components/site/SiteChrome.tsx`

- [ ] **Step 1: Add the nav item after Blogg**

In `web/src/components/site/SiteChrome.tsx`, update the `navigation` array so `/radar` follows `/blogg`:
```typescript
const navigation = [
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/experter", label: "Våra experter" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/blogg", label: "Blogg" },
  { href: "/radar", label: "Radar" },
] as const;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/site/SiteChrome.tsx
git commit -m "feat(radar): nav-länk till /radar efter /blogg"
```

---

## Task 15: Document the radar API in web/API.md

**Files:**
- Modify: `web/API.md`

- [ ] **Step 1: Update the intro + abstraction sentence**

In `web/API.md`, update the two intro lines to mention radarer:
- Line under the title: `API för att hantera experter, expertområden, blogginlägg och radarer på Expertbyråns webbplats.`
- In `## Översikt`, change the abstraction list to `(`ConfigStore`, `ContentStore`, `BlogStore`, `RadarStore`)` and add "radarer" to the parenthetical "(experter, expertområden, blogginlägg, radarer)".

- [ ] **Step 2: Add the Radarer section after the Blogginlägg endpoints**

Insert this block immediately after the `#### DELETE /api/v1/blog/posts/[slug]` subsection (before `## Miljövariabler`):
```markdown
### Radarer

En radar består av metadata (`meta`, inkl. namngivna `segments`) och en lista `blips`.
Ringarna (`anta`/`prova`/`bevaka`/`avvakta`) är fasta för alla radarer; segmenten
definieras per radar.

#### GET /api/v1/radars
Hämtar metadata för alla radarer (utan blips).

**Response:**
```json
{ "radars": [ { "slug": "teknikradar-2026", "title": "Teknikradar 2026", "date": "2026-06-03T00:00:00.000Z", "segments": [ { "id": "ai-agenter", "name": "AI & agenter" } ] } ] }
```

#### POST /api/v1/radars
Skapar en radar. Kräver autentisering. Body: `{ "meta": {…}, "blips": [ … ] }`.
`201` vid skapad, `409` om slug finns, `400` vid valideringsfel (inkl. blip mot okänt segment).

#### GET /api/v1/radars/[slug]
Hämtar `{ "meta": {…}, "blips": [ … ] }`. `404` om radarn saknas.

#### PUT /api/v1/radars/[slug]
Uppdaterar metadata, blips, eller båda. Kräver autentisering. Body: `{ "meta"?: {…}, "blips"?: [ … ] }`. `404`/`409`/`400`.

#### DELETE /api/v1/radars/[slug]
Tar bort en radar (metadata + blips-fil). Kräver autentisering. `404` om saknas.
```

- [ ] **Step 3: Update the Dataformat list**

In `## Dataformat`, add these two lines after the `blog/posts/*.md` line:
```markdown
- `radar-data.json` - Radarmetadata (inkl. segment)
- `radar/*.json` - Blips för varje radar
```

- [ ] **Step 4: Commit**

```bash
git add API.md
git commit -m "docs(radar): dokumentera /api/v1/radars i web/API.md"
```

---

## Task 16: Full verification + manual smoke

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run (from `web/`): `npm run test`
Expected: all tests pass, including the four new radar tests.

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; `/radar` and `/radar/[slug]` appear in the route output.

- [ ] **Step 4: Manual smoke test**

Run: `DATA_DIR=. npm run dev` (so the store reads the tracked seed at `web/radar-data.json` + `web/radar/teknikradar-2026.json`).
Then verify in the browser:
- `http://localhost:3000/radar` lists "Teknikradar 2026".
- `http://localhost:3000/radar/teknikradar-2026` renders the round radar with 16 numbered blips, the legend, and a working detail panel on click.
- The header nav shows "Radar" directly after "Blogg".

> Note: locally `DATA_DIR=.` points the store at `web/` root where the seed lives. The memory note `web-datadir-shadows-app-router` warns that `DATA_DIR=app/data` shadows the App Router — do not use that. Compare blog: it loads from the same root seed.

- [ ] **Step 5: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "test(radar): full verifiering — suite, build, smoke"
```

---

## Notes for the implementer

- **Do not** reintroduce markdown for radar — a radar's body is structured `{meta, blips}` JSON. There is no `renderRadarMarkdown`.
- **Rings are fixed** (`RINGS` in `rings.ts`); never store ring definitions per radar. Segments are per-radar.
- The API is the only write path. The seed files are read by the store; never have a page write files directly.
- `revalidateTag("radar", "max")` uses the **2-argument** form (required in this codebase).
- Keep Swedish UI text with correct å/ä/ö.
