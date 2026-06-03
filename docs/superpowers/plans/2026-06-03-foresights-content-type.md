# Foresights Content Type — Implementation Plan (Etapp 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add "foresights" as a first-class, blog-like content type to the `web/` app — its own store, REST API, cached pages (`/foresight` + `/foresight/[slug]`), and nav link — plus broaden the `expertbyran-radar` skill and `expertbyran-api` reference to cover foresights.

**Architecture:** Mirror the existing **blog** feature exactly. A `ForesightStore` (file + in-memory) behind the storage abstraction; the REST API (`/api/v1/foresights`) is the only write path; Next 16 `unstable_cache` + `revalidateTag("foresight","max")`; server-component pages reusing the blog pages' structure and `site.module.css` classes. A foresight is `meta` + markdown body, identical to a blog post plus an optional `horizon` field. Markdown rendering reuses the blog renderer.

**Tech Stack:** Next.js 16.2.3 (App Router), TypeScript 5.9, Zod 4, Vitest 4 (`vitest run` from `web/`), React 19, `marked` (via the existing blog markdown renderer).

**Reference spec:** `docs/superpowers/specs/2026-06-03-foresights-and-radar-related-content-design.md`. This plan is **Etapp 1** of that spec (foresight content type). Etapp 2 (blip `areaSlugs` + "Relaterat" in the radar panel) is a separate plan, written after this is built.

**Conventions:** All commands run from `web/`. Run the test suite with the project-local binary (`npm run test` from `web/`), NOT `npx vitest` (a global npx vitest lacks `jsdom` and reports false "Cannot find package 'jsdom'" errors). Swedish UI text with correct å/ä/ö. TDD: failing test → see it fail → minimal code → see it pass → commit. `tsc --noEmit` may surface PRE-EXISTING unrelated errors — only errors in files you touch matter. The `@/` alias maps to `web/src/`.

---

## File Structure

**Create:**
- `web/src/lib/foresight/schema.ts` — Zod schema + types + parse helpers (mirrors `blog/schema.ts`).
- `web/src/lib/foresight/store.ts` — cache layer (`FORESIGHT_TAGS`, `getForesightData`).
- `web/src/lib/foresight/query.ts` — `getForesightArchive`, `getForesight`, `formatForesightDate`.
- `web/src/lib/stores/file-foresight-store.ts` — `FileForesightStore`.
- `web/src/app/api/v1/foresights/route.ts` — GET (list) + POST (create).
- `web/src/app/api/v1/foresights/[slug]/route.ts` — GET + PUT + DELETE.
- `web/src/app/foresight/page.tsx` — list page.
- `web/src/app/foresight/[slug]/page.tsx` — detail page.
- Tests: `web/src/lib/foresight/schema.test.ts`, `web/src/lib/stores/file-foresight-store.test.ts`, `web/src/app/api/v1/foresights/route.test.ts`.
- Seed: `web/foresight-data.json`, `web/foresight/{slug}.md` (1–2 curated).

**Modify:**
- `web/src/lib/stores/types.ts` — add `ForesightStore` interface.
- `web/src/lib/stores/memory-stores.ts` — add `InMemoryForesightStore` (+ smoke test in `memory-stores.test.ts`).
- `web/src/lib/stores/index.ts` — add `foresight` to `Stores` + `getForesightStore()`.
- `web/src/app/refresh/route.ts` — add `"foresight"` tag.
- `web/src/components/site/SiteChrome.tsx` — nav link after `/radar`.
- `web/API.md` — foresight endpoints.
- `paperclip/skills/local/expertbyran-api/SKILL.md` + `references/payloads.md` — foresight endpoints + `ForesightEntry`.
- `paperclip/skills/local/expertbyran-radar/SKILL.md` — foresight editorial flow.

---

## Task 1: Foresight schema

**Files:**
- Create: `web/src/lib/foresight/schema.ts`
- Test: `web/src/lib/foresight/schema.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/lib/foresight/schema.test.ts`:
```typescript
import { describe, expect, it } from "vitest";

import { parseForesightCatalog, type ForesightEntry } from "./schema";

const ENTRY: ForesightEntry = {
  slug: "digital-suveranitet-2026-2030",
  title: "Digital suveränitet i svensk statsförvaltning 2026–2030",
  date: "2026-05-29T10:00:00.000Z",
  authorName: "Chefsstrateg",
  areaSlugs: ["digitalisering"],
  excerpt: "En analys av suveränitetsregimen.",
  horizon: "2026–2030",
};

describe("foresight schema", () => {
  it("validerar en korrekt katalog", () => {
    expect(parseForesightCatalog({ foresights: [ENTRY] }, "test").foresights).toHaveLength(1);
  });

  it("kräver minst ett expertområde", () => {
    const bad = { foresights: [{ ...ENTRY, areaSlugs: [] }] };
    expect(() => parseForesightCatalog(bad, "test")).toThrow();
  });

  it("kräver författarnamn eller -slug", () => {
    const { authorName: _omit, ...withoutAuthor } = ENTRY;
    expect(() => parseForesightCatalog({ foresights: [withoutAuthor] }, "test")).toThrow();
  });

  it("avvisar dubblett-slug", () => {
    expect(() => parseForesightCatalog({ foresights: [ENTRY, ENTRY] }, "test")).toThrow();
  });

  it("tillåter utelämnad horizon", () => {
    const { horizon: _omit, ...noHorizon } = ENTRY;
    expect(() => parseForesightCatalog({ foresights: [noHorizon] }, "test")).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/foresight/schema.test.ts`
Expected: FAIL — `Cannot find module './schema'`.

- [ ] **Step 3: Write the schema**

`web/src/lib/foresight/schema.ts`:
```typescript
import { z } from "zod";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, "Slug får bara innehålla a-z, 0-9 och bindestreck.");

const isoDateTimeSchema = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Måste vara en giltig ISO 8601-tidsstämpel (t.ex. 2026-05-29T10:00:00.000Z).",
  });

const foresightEntrySchema = z
  .object({
    slug: slugSchema,
    title: z.string().min(1),
    date: isoDateTimeSchema,
    authorSlug: slugSchema.optional(),
    authorName: z.string().min(1).optional(),
    authorRole: z.string().min(1).optional(),
    areaSlugs: z.array(slugSchema).min(1),
    excerpt: z.string().min(1),
    horizon: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.authorSlug || data.authorName), {
    message: "Minst en av authorSlug eller authorName måste anges.",
    path: ["authorName"],
  });

export const foresightCatalogSchema = z
  .object({ foresights: z.array(foresightEntrySchema) })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    data.foresights.forEach((entry, index) => {
      if (seen.has(entry.slug)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foresights", index, "slug"],
          message: "Foresightens slug måste vara unik.",
        });
      }
      seen.add(entry.slug);
    });
  });

export type ForesightEntry = z.infer<typeof foresightEntrySchema>;
export type ForesightCatalog = z.infer<typeof foresightCatalogSchema>;

export function formatForesightIssues(issues: z.ZodIssue[]) {
  return issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

export function parseForesightCatalog(input: unknown, source: string): ForesightCatalog {
  const result = foresightCatalogSchema.safeParse(input);
  if (!result.success) {
    console.error(`[schema] Invalid foresight-data from ${source}`, formatForesightIssues(result.error.issues));
    throw new Error(`Invalid foresight-data from ${source}`);
  }
  return result.data;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/foresight/schema.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/foresight/schema.ts src/lib/foresight/schema.test.ts
git commit -m "feat(foresight): zod-schema för ForesightEntry"
```

---

## Task 2: ForesightStore interface

**Files:**
- Modify: `web/src/lib/stores/types.ts`

- [ ] **Step 1: Add the import and interface**

In `web/src/lib/stores/types.ts`, add this import after the existing `BlogPostEntry` import:
```typescript
import type { ForesightEntry } from "@/lib/foresight/schema";
```

Add this interface after the `BlogStore` interface (the `RadarStore` interface is also in this file; place `ForesightStore` after `BlogStore`, before `RadarStore` or after it — either is fine):
```typescript
export interface ForesightStore {
  listForesights(): Promise<ForesightEntry[]>;
  getForesight(slug: string): Promise<{ meta: ForesightEntry; markdown: string } | null>;
  createForesight(meta: ForesightEntry, markdown: string): Promise<ForesightEntry>;
  updateForesight(
    slug: string,
    patch: { meta?: ForesightEntry; markdown?: string },
  ): Promise<ForesightEntry>;
  deleteForesight(slug: string): Promise<void>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing `types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/stores/types.ts
git commit -m "feat(foresight): ForesightStore-interface"
```

---

## Task 3: FileForesightStore

**Files:**
- Create: `web/src/lib/stores/file-foresight-store.ts`
- Test: `web/src/lib/stores/file-foresight-store.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/lib/stores/file-foresight-store.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/stores/file-foresight-store.test.ts`
Expected: FAIL — `Cannot find module './file-foresight-store'`.

- [ ] **Step 3: Write the implementation**

`web/src/lib/stores/file-foresight-store.ts`:
```typescript
import path from "node:path";

import {
  parseForesightCatalog,
  type ForesightCatalog,
  type ForesightEntry,
} from "@/lib/foresight/schema";
import type { ForesightStore } from "./types";
import { ConflictError, NotFoundError } from "./types";
import {
  atomicWriteFile,
  deleteFileIfExists,
  readJsonFile,
  readTextFile,
  resolveDataDir,
} from "./fs-helpers";

export class FileForesightStore implements ForesightStore {
  private readonly catalogFile: string;
  private readonly postsDir: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.catalogFile = path.join(dataDir, "foresight-data.json");
    this.postsDir = path.join(dataDir, "foresight");
  }

  private async readCatalog(): Promise<ForesightCatalog> {
    try {
      const raw = await readJsonFile(this.catalogFile);
      return parseForesightCatalog(raw, this.catalogFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { foresights: [] };
      throw error;
    }
  }

  private async writeCatalog(catalog: ForesightCatalog): Promise<void> {
    const validated = parseForesightCatalog(catalog, "foresight-store-write");
    await atomicWriteFile(this.catalogFile, JSON.stringify(validated, null, 2));
  }

  private markdownPath(slug: string): string {
    return path.join(this.postsDir, `${slug}.md`);
  }

  async listForesights(): Promise<ForesightEntry[]> {
    return (await this.readCatalog()).foresights;
  }

  async getForesight(slug: string): Promise<{ meta: ForesightEntry; markdown: string } | null> {
    const meta = (await this.readCatalog()).foresights.find((f) => f.slug === slug);
    if (!meta) return null;
    const markdown = await readTextFile(this.markdownPath(slug));
    return { meta, markdown };
  }

  async createForesight(meta: ForesightEntry, markdown: string): Promise<ForesightEntry> {
    const catalog = await this.readCatalog();
    if (catalog.foresights.some((f) => f.slug === meta.slug)) {
      throw new ConflictError(`Foresight with slug ${meta.slug} already exists`);
    }
    catalog.foresights.push(meta);
    await this.writeCatalog(catalog);
    await atomicWriteFile(this.markdownPath(meta.slug), markdown);
    return meta;
  }

  async updateForesight(
    slug: string,
    patch: { meta?: ForesightEntry; markdown?: string },
  ): Promise<ForesightEntry> {
    const catalog = await this.readCatalog();
    const index = catalog.foresights.findIndex((f) => f.slug === slug);
    if (index === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);

    const nextMeta = patch.meta ?? catalog.foresights[index];
    const slugChanged = nextMeta.slug !== slug;

    if (slugChanged && catalog.foresights.some((f) => f.slug === nextMeta.slug)) {
      throw new ConflictError(`Foresight with slug ${nextMeta.slug} already exists`);
    }

    if (slugChanged) {
      const existingMarkdown = patch.markdown ?? (await readTextFile(this.markdownPath(slug)));
      await atomicWriteFile(this.markdownPath(nextMeta.slug), existingMarkdown);
      await deleteFileIfExists(this.markdownPath(slug));
    } else if (patch.markdown !== undefined) {
      await atomicWriteFile(this.markdownPath(slug), patch.markdown);
    }

    catalog.foresights[index] = nextMeta;
    await this.writeCatalog(catalog);
    return nextMeta;
  }

  async deleteForesight(slug: string): Promise<void> {
    const catalog = await this.readCatalog();
    const index = catalog.foresights.findIndex((f) => f.slug === slug);
    if (index === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);
    catalog.foresights.splice(index, 1);
    await this.writeCatalog(catalog);
    await deleteFileIfExists(this.markdownPath(slug));
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/stores/file-foresight-store.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/file-foresight-store.ts src/lib/stores/file-foresight-store.test.ts
git commit -m "feat(foresight): FileForesightStore (katalog + markdown)"
```

---

## Task 4: InMemoryForesightStore + registration

**Files:**
- Modify: `web/src/lib/stores/memory-stores.ts`
- Modify: `web/src/lib/stores/index.ts`
- Test: extend `web/src/lib/stores/memory-stores.test.ts`

- [ ] **Step 1: Add InMemoryForesightStore**

In `web/src/lib/stores/memory-stores.ts`: add `import type { ForesightEntry } from "@/lib/foresight/schema";`, ensure `ForesightStore` is in the `import type { ... } from "./types"` list, and append:
```typescript
export class InMemoryForesightStore implements ForesightStore {
  private foresights: ForesightEntry[] = [];
  private markdown = new Map<string, string>();

  async listForesights() {
    return [...this.foresights];
  }
  async getForesight(slug: string) {
    const meta = this.foresights.find((f) => f.slug === slug);
    if (!meta) return null;
    return { meta, markdown: this.markdown.get(slug) ?? "" };
  }
  async createForesight(meta: ForesightEntry, markdown: string) {
    if (this.foresights.some((f) => f.slug === meta.slug)) {
      throw new ConflictError(`Foresight with slug ${meta.slug} already exists`);
    }
    this.foresights.push(meta);
    this.markdown.set(meta.slug, markdown);
    return meta;
  }
  async updateForesight(slug: string, patch: { meta?: ForesightEntry; markdown?: string }) {
    const i = this.foresights.findIndex((f) => f.slug === slug);
    if (i === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.foresights[i];
    if (nextMeta.slug !== slug && this.foresights.some((f) => f.slug === nextMeta.slug)) {
      throw new ConflictError(`Foresight with slug ${nextMeta.slug} already exists`);
    }
    const md = patch.markdown ?? this.markdown.get(slug) ?? "";
    if (nextMeta.slug !== slug) this.markdown.delete(slug);
    this.markdown.set(nextMeta.slug, md);
    this.foresights[i] = nextMeta;
    return nextMeta;
  }
  async deleteForesight(slug: string) {
    const i = this.foresights.findIndex((f) => f.slug === slug);
    if (i === -1) throw new NotFoundError(`Foresight with slug ${slug} not found`);
    this.foresights.splice(i, 1);
    this.markdown.delete(slug);
  }
}
```

- [ ] **Step 2: Register in composition root**

In `web/src/lib/stores/index.ts`: add `ForesightStore` to the `import type { ... } from "./types"` list; add `import { FileForesightStore } from "./file-foresight-store";`; add `foresight: ForesightStore;` to the `Stores` type; add `foresight: new FileForesightStore(),` in `getDefaults()`; and add:
```typescript
export function getForesightStore(): ForesightStore {
  return override?.foresight ?? getDefaults().foresight;
}
```

- [ ] **Step 3: Add a smoke test**

In `web/src/lib/stores/memory-stores.test.ts`, add a `describe("InMemoryForesightStore", ...)` mirroring the existing `InMemoryBlogStore` block: create → list length 1 → get returns meta+markdown; update markdown reflected; delete → null; ConflictError on duplicate; NotFoundError on unknown-slug delete. Use a valid fixture (`areaSlugs: ["digitalisering"]`, `authorName: "Chefsstrateg"`). Read the existing blog describe block first and follow its conventions.

- [ ] **Step 4: Verify**

Run: `npm run test -- src/lib/stores` and `npx tsc --noEmit`
Expected: all store tests pass; no tsc error in the two files.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stores/memory-stores.ts src/lib/stores/memory-stores.test.ts src/lib/stores/index.ts
git commit -m "feat(foresight): InMemoryForesightStore + getForesightStore"
```

---

## Task 5: Cache layer

**Files:**
- Create: `web/src/lib/foresight/store.ts`

- [ ] **Step 1: Write the cache module**

`web/src/lib/foresight/store.ts` (mirrors `web/src/lib/blog/store.ts`; reuses the blog markdown renderer):
```typescript
import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { ForesightCatalog } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";

export type ForesightData = {
  catalog: ForesightCatalog;
  renderedPosts: Map<string, string>;
};

export const FORESIGHT_TAGS = ["foresight"] as const;

const loadForesightData = unstable_cache(
  async (): Promise<{ catalog: ForesightCatalog; rendered: [string, string][] }> => {
    const store = getForesightStore();
    const foresights = await store.listForesights();
    const rendered = await Promise.all(
      foresights.map(async (meta): Promise<[string, string]> => {
        const full = await store.getForesight(meta.slug);
        const html = full ? await renderBlogMarkdown(full.markdown) : "";
        return [meta.slug, html];
      }),
    );
    return { catalog: { foresights }, rendered };
  },
  ["foresight-data"],
  { tags: [...FORESIGHT_TAGS] },
);

export async function getForesightData(): Promise<ForesightData> {
  const { catalog, rendered } = await loadForesightData();
  return { catalog, renderedPosts: new Map(rendered) };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing `store.ts`. (If `renderBlogMarkdown` is not exported from `@/lib/blog/markdown`, open that file and import the actual exported renderer name instead — report the discrepancy if it differs.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/foresight/store.ts
git commit -m "feat(foresight): cache-lager via unstable_cache (tag: foresight)"
```

---

## Task 6: Query layer

**Files:**
- Create: `web/src/lib/foresight/query.ts`

- [ ] **Step 1: Write the query module**

`web/src/lib/foresight/query.ts` (mirrors `web/src/lib/blog/query.ts`; self-contained author/area resolution to avoid coupling to blog query):
```typescript
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import { getSiteData } from "@/lib/content/store";

import type { ForesightCatalog, ForesightEntry } from "@/lib/foresight/schema";
import { getForesightData } from "@/lib/foresight/store";

export function formatForesightDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export type ResolvedAuthor = { name: string; role?: string; expertSlug?: string };

export type ForesightSummary = ForesightEntry & {
  author: ResolvedAuthor;
  areas: ExpertArea[];
};

export type ForesightFull = ForesightSummary & { contentHtml: string };

export type ForesightArchive = { foresights: ForesightSummary[]; areas: ExpertArea[] };

function resolveAuthor(experts: Expert[], entry: ForesightEntry): ResolvedAuthor | null {
  const expert = entry.authorSlug
    ? experts.find((candidate) => candidate.slug === entry.authorSlug)
    : undefined;
  if (expert) {
    return {
      name: entry.authorName ?? expert.name,
      role: entry.authorRole ?? expert.role,
      expertSlug: expert.slug,
    };
  }
  if (entry.authorName) {
    return { name: entry.authorName, role: entry.authorRole };
  }
  return null;
}

function resolveAreas(allAreas: ExpertArea[], areaSlugs: string[]): ExpertArea[] {
  const areaMap = new Map(allAreas.map((area) => [area.slug, area]));
  return areaSlugs
    .map((slug) => areaMap.get(slug))
    .filter((area): area is ExpertArea => Boolean(area));
}

function byAreaOrder(areas: ExpertArea[]) {
  return [...areas].sort((left, right) =>
    left.sortOrder === right.sortOrder
      ? left.name.localeCompare(right.name, "sv")
      : left.sortOrder - right.sortOrder,
  );
}

function resolveForesights(catalog: ForesightCatalog, siteData: SiteData): ForesightSummary[] {
  return catalog.foresights
    .map((entry) => {
      const author = resolveAuthor(siteData.experts, entry);
      if (!author) {
        console.warn(
          `[expertbyran:foresight] Hoppar över '${entry.slug}' — saknar visningsnamn.`,
        );
        return null;
      }
      const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
      return { ...entry, author, areas };
    })
    .filter((entry): entry is ForesightSummary => entry !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getForesightArchive(): Promise<ForesightArchive> {
  const [foresightData, siteData] = await Promise.all([getForesightData(), getSiteData()]);
  const foresights = resolveForesights(foresightData.catalog, siteData);
  const usedSlugs = new Set(foresights.flatMap((f) => f.areas.map((area) => area.slug)));
  return {
    foresights,
    areas: byAreaOrder(siteData.expertAreas.filter((area) => usedSlugs.has(area.slug))),
  };
}

export async function getForesight(slug: string): Promise<ForesightFull | null> {
  const [foresightData, siteData] = await Promise.all([getForesightData(), getSiteData()]);
  const entry = foresightData.catalog.foresights.find((f) => f.slug === slug);
  if (!entry) return null;
  const author = resolveAuthor(siteData.experts, entry);
  if (!author) return null;
  const areas = resolveAreas(siteData.expertAreas, entry.areaSlugs);
  const contentHtml = foresightData.renderedPosts.get(slug);
  if (!contentHtml) return null;
  return { ...entry, author, areas, contentHtml };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing `query.ts`. (Confirm `Expert`, `ExpertArea`, `SiteData` are exported from `@/lib/content/schema` and `getSiteData` from `@/lib/content/store` — they are, per the blog query which imports the same.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/foresight/query.ts
git commit -m "feat(foresight): query-lager (getForesightArchive, getForesight)"
```

---

## Task 7: API — list + create

**Files:**
- Create: `web/src/app/api/v1/foresights/route.ts`
- Test: `web/src/app/api/v1/foresights/route.test.ts`

- [ ] **Step 1: Write the failing test**

`web/src/app/api/v1/foresights/route.test.ts`:
```typescript
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryForesightStore } from "@/lib/stores/memory-stores";
import { GET, POST } from "./route";

const META = {
  slug: "digital-suveranitet-2026-2030",
  title: "Digital suveränitet 2026–2030",
  date: "2026-05-29T10:00:00.000Z",
  authorName: "Chefsstrateg",
  areaSlugs: ["digitalisering"],
  excerpt: "Sammanfattning.",
  horizon: "2026–2030",
};

function postReq(body: unknown, token = "test-token") {
  return new Request("http://localhost/api/v1/foresights", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.API_TOKEN = "test-token";
  __setStoresForTest({ foresight: new InMemoryForesightStore() });
});
afterEach(() => {
  __setStoresForTest(null);
});

describe("/api/v1/foresights", () => {
  it("GET returnerar tom lista initialt", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ foresights: [] });
  });

  it("POST utan token ger 401", async () => {
    const res = await POST(postReq({ foresight: META, markdown: "x" }, "fel") as never);
    expect(res.status).toBe(401);
  });

  it("POST skapar och GET listar", async () => {
    const created = await POST(postReq({ foresight: META, markdown: "# H\n\nText." }) as never);
    expect(created.status).toBe(201);
    const list = await (await GET()).json();
    expect(list.foresights).toHaveLength(1);
  });

  it("POST utan markdown ger 400", async () => {
    const res = await POST(postReq({ foresight: META }) as never);
    expect(res.status).toBe(400);
  });

  it("POST med dubblett-slug ger 409", async () => {
    await POST(postReq({ foresight: META, markdown: "x" }) as never);
    const res = await POST(postReq({ foresight: META, markdown: "y" }) as never);
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/app/api/v1/foresights/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Write the route**

`web/src/app/api/v1/foresights/route.ts` (mirrors `web/src/app/api/v1/blog/posts/route.ts`):
```typescript
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ForesightEntry } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const foresights = await getForesightStore().listForesights();
    return Response.json({ foresights });
  } catch (error) {
    console.error("[api] Failed to read foresights", error);
    return Response.json({ error: "Failed to read foresights" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { foresight, markdown } = (await req.json()) as {
      foresight: ForesightEntry;
      markdown: string;
    };
    if (!foresight || !markdown) {
      return Response.json(
        { error: "Both 'foresight' metadata and 'markdown' content are required" },
        { status: 400 },
      );
    }
    const created = await getForesightStore().createForesight(foresight, markdown);
    revalidateTag("foresight", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create foresight" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/app/api/v1/foresights/route.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/v1/foresights/route.ts src/app/api/v1/foresights/route.test.ts
git commit -m "feat(foresight): API GET/POST /api/v1/foresights"
```

---

## Task 8: API — get + update + delete

**Files:**
- Create: `web/src/app/api/v1/foresights/[slug]/route.ts`

- [ ] **Step 1: Write the route**

`web/src/app/api/v1/foresights/[slug]/route.ts` (mirrors `web/src/app/api/v1/blog/posts/[slug]/route.ts`):
```typescript
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ForesightEntry } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getForesightStore().getForesight(slug);
    if (!result) {
      return Response.json({ error: `Foresight with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ foresight: result.meta, markdown: result.markdown });
  } catch (error) {
    console.error("[api] Failed to read foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read foresight" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const { foresight, markdown } = (await req.json()) as {
      foresight?: ForesightEntry;
      markdown?: string;
    };
    const updated = await getForesightStore().updateForesight(slug, { meta: foresight, markdown });
    const full = await getForesightStore().getForesight(updated.slug);
    revalidateTag("foresight", "max");
    return Response.json({
      success: true,
      data: { foresight: updated, markdown: full?.markdown ?? "" },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update foresight" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getForesightStore().deleteForesight(slug);
    revalidateTag("foresight", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete foresight" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing the new route file.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/v1/foresights/[slug]/route.ts"
git commit -m "feat(foresight): API GET/PUT/DELETE /api/v1/foresights/[slug]"
```

---

## Task 9: Add foresight tag to /refresh

**Files:**
- Modify: `web/src/app/refresh/route.ts`

- [ ] **Step 1: Add the tag**

In `web/src/app/refresh/route.ts`, update the `TAGS` constant (it currently includes `"radar"`):
```typescript
const TAGS = ["experts", "areas", "blog", "radar", "foresight"] as const;
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing the refresh route.

- [ ] **Step 3: Commit**

```bash
git add src/app/refresh/route.ts
git commit -m "feat(foresight): inkludera foresight-tagg i /refresh"
```

---

## Task 10: Detail page

**Files:**
- Create: `web/src/app/foresight/[slug]/page.tsx`

- [ ] **Step 1: Write the page**

`web/src/app/foresight/[slug]/page.tsx` (mirrors `web/src/app/blogg/[slug]/page.tsx`, adds horizon to the sidebar):
```typescript
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { formatForesightDate, getForesight } from "@/lib/foresight/query";

type ForesightPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ForesightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const foresight = await getForesight(slug);
  if (!foresight) return { title: "Foresight saknas" };
  return { title: foresight.title, description: foresight.excerpt };
}

export default async function ForesightPage({ params }: ForesightPageProps) {
  const { slug } = await params;
  const foresight = await getForesight(slug);
  if (!foresight) notFound();

  return (
    <div className={styles.pageWrap}>
      <ReadingProgress />
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Foresight</p>
        <div className={styles.blogMeta}>
          <Pill variant="marine">{formatForesightDate(foresight.date)}</Pill>
          <Pill variant="neutral">{foresight.author.name}</Pill>
        </div>
        <h1 className={styles.blogTitle}>{foresight.title}</h1>
        <div className={styles.heroLine} />
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <aside className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Datum</span>
              <span className={styles.metaValue}>{formatForesightDate(foresight.date)}</span>
            </div>
            {foresight.horizon ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Horisont</span>
                <span className={styles.metaValue}>{foresight.horizon}</span>
              </div>
            ) : null}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Författare</span>
              <span className={styles.metaValue}>
                {foresight.author.expertSlug ? (
                  <Link href={`/experter/${foresight.author.expertSlug}`} className={styles.textLink}>
                    {foresight.author.name}
                  </Link>
                ) : (
                  foresight.author.name
                )}
              </span>
            </div>
            {foresight.author.role ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Roll</span>
                <span className={styles.metaValue}>{foresight.author.role}</span>
              </div>
            ) : null}
            {foresight.areas.map((area) => (
              <div key={area.slug} className={styles.metaRow}>
                <span className={styles.metaLabel}>Expertområde</span>
                <span className={styles.metaValue}>
                  <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                  <Link href={`/expertomraden/${area.slug}`} className={styles.textLink}>
                    {area.name}
                  </Link>
                </span>
              </div>
            ))}
          </aside>

          <div className={styles.detailMain}>
            <div
              className={styles.blogContent}
              dangerouslySetInnerHTML={{ __html: foresight.contentHtml }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing this file. (Confirm `ReadingProgress` exists at `@/components/site/ReadingProgress` and the classes `detailLayout`/`detailSidebar`/`metaRow`/`metaLabel`/`metaValue`/`textLink`/`blogContent`/`blogMeta`/`blogTitle` exist in `site.module.css` — they do; the blog detail page uses them. If any is missing, report rather than invent.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/foresight/[slug]/page.tsx"
git commit -m "feat(foresight): detaljsida /foresight/[slug]"
```

---

## Task 11: List page

**Files:**
- Create: `web/src/app/foresight/page.tsx`

- [ ] **Step 1: Write the page**

`web/src/app/foresight/page.tsx` (featured-first + grid like `/blogg`, no area filter — dynamic so it reads runtime data):
```typescript
import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { formatForesightDate, getForesightArchive } from "@/lib/foresight/query";
import type { ForesightSummary } from "@/lib/foresight/query";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Foresight",
  description: "Strategisk framsyn från Expertbyrån — scenarier och implikationer för offentlig sektor.",
};

function ForesightMeta({ foresight }: { foresight: ForesightSummary }) {
  return (
    <div className={styles.blogPostMeta}>
      <Pill variant="marine">{formatForesightDate(foresight.date)}</Pill>
      {foresight.horizon ? <Pill variant="neutral">{foresight.horizon}</Pill> : null}
      <div className={styles.blogAreaPills}>
        {foresight.areas.map((area) => (
          <span key={area.slug} className={styles.blogAreaPill}>
            <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
            {area.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function ForesightListPage() {
  const { foresights } = await getForesightArchive();
  const [featured, ...rest] = foresights;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Foresight</p>
        <h1 className={styles.heroTitle}>Strategisk framsyn.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Scenarier, drivkrafter och implikationer för offentlig sektor — kuraterad framsyn kopplad till våra expertområden.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla foresights</h2>
          <span className={styles.sectionCount}>{`${foresights.length} foresights`}</span>
        </div>

        {foresights.length === 0 ? (
          <div className={styles.emptyState}>Inga foresights publicerade ännu.</div>
        ) : (
          <>
            {featured ? (
              <Link href={`/foresight/${featured.slug}` as Route} className={styles.blogFeatured}>
                <ForesightMeta foresight={featured} />
                <h2 className={styles.blogFeaturedTitle}>{featured.title}</h2>
                {featured.excerpt ? <p className={styles.blogFeaturedSummary}>{featured.excerpt}</p> : null}
                <span className={styles.blogFeaturedReadMore}>Läs analysen →</span>
              </Link>
            ) : null}

            <div className={styles.blogGrid}>
              {rest.map((foresight) => (
                <Link key={foresight.slug} href={`/foresight/${foresight.slug}` as Route} className={styles.blogCard}>
                  <ForesightMeta foresight={foresight} />
                  <h3 className={styles.blogCardTitle}>{foresight.title}</h3>
                  {foresight.excerpt ? <p className={styles.blogCardSummary}>{foresight.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing this file.

- [ ] **Step 3: Commit**

```bash
git add src/app/foresight/page.tsx
git commit -m "feat(foresight): lista-sida /foresight"
```

---

## Task 12: Navigation link

**Files:**
- Modify: `web/src/components/site/SiteChrome.tsx`

- [ ] **Step 1: Add the nav item after /radar**

In `web/src/components/site/SiteChrome.tsx`, the `navigation` array already ends with `/blogg` then `/radar`. Add `/foresight` directly after `/radar`:
```typescript
const navigation = [
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/experter", label: "Våra experter" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/blogg", label: "Blogg" },
  { href: "/radar", label: "Radar" },
  { href: "/foresight", label: "Foresight" },
] as const;
```
(Read the file first to confirm the current array; only ADD the foresight line after radar.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no error referencing `SiteChrome.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/site/SiteChrome.tsx
git commit -m "feat(foresight): nav-länk till /foresight efter /radar"
```

---

## Task 13: Seed foresights

**Files:**
- Create: `web/foresight-data.json`
- Create: `web/foresight/{slug}.md` (1–2 files)

- [ ] **Step 1: Confirm the area slugs (already verified)**

The existing `web/site-data.json` defines 14 expertområden. The seed below uses these real slugs (verified to exist): `digitalisering` ("Statlig digitalisering och IT"), `cyber` ("Cybersäkerhet och informationssäkerhet"), `revisionsmetodik` ("Revisionsmetodik och analys"). Do NOT invent slugs; if you change the seed, every `areaSlugs` entry must match an existing slug in `web/site-data.json`. These areas were chosen to overlap thematically with radar blips so Etapp 2's related-links will match (e.g. PQC/agent-attack blips → `cyber`; suveränt moln/AI-granskning → `digitalisering`; algoritmrevision → `revisionsmetodik`).

- [ ] **Step 2: Write the catalog seed**

`web/foresight-data.json`:
```json
{
  "foresights": [
    {
      "slug": "digital-suveranitet-statsforvaltning-2026-2030",
      "title": "Digital suveränitet i svensk statsförvaltning 2026–2030",
      "date": "2026-05-29T10:00:00.000Z",
      "authorName": "Chefsstrateg",
      "authorRole": "Strategisk framsyn",
      "areaSlugs": ["digitalisering", "cyber"],
      "excerpt": "Hur regimen för digital suveränitet utvecklas i samspelet mellan svensk soft policy, EU:s CAIDA/EUCS, värdmyndigheterna och hyperscaler-beroendet.",
      "horizon": "2026–2030"
    },
    {
      "slug": "agentiska-organisationer-utan-governance",
      "title": "Agentiska organisationer utan governance-skikt",
      "date": "2026-05-22T10:00:00.000Z",
      "authorName": "Chefsstrateg",
      "authorRole": "Strategisk framsyn",
      "areaSlugs": ["digitalisering", "revisionsmetodik"],
      "excerpt": "Hur snabbt agentiska arbetsflöden rör sig från pilot till drift, och vad det betyder för granskning och intern revision.",
      "horizon": "2026–2029"
    }
  ]
}
```

- [ ] **Step 3: Write the markdown bodies**

Create `web/foresight/digital-suveranitet-statsforvaltning-2026-2030.md` and `web/foresight/agentiska-organisationer-utan-governance.md`. Each is a synthesized, neutral, Swedish markdown analysis (~250–500 words) drawn from the vault content — with `## Kärnfråga`, `## Scenarier`, `## Implikationer` sections. Keep it factual and balanced (no client names, no advocacy), correct å/ä/ö. (These are illustrative seed bodies; content faithfully reflecting the vault's themes is sufficient — do not copy huge verbatim sections.)

- [ ] **Step 4: Validate the seed loads**

Run a quick check that the catalog validates and markdown files exist:
```bash
node -e "const c=require('./foresight-data.json'); const fs=require('fs'); c.foresights.forEach(f=>{ if(!fs.existsSync('foresight/'+f.slug+'.md')) throw new Error('saknar md: '+f.slug); if(!f.areaSlugs.length) throw new Error('saknar area: '+f.slug); }); console.log('OK', c.foresights.length, 'foresights');"
```
Expected: `OK 2 foresights`.

- [ ] **Step 5: Commit**

```bash
git add foresight-data.json foresight/
git commit -m "feat(foresight): seed — två exempel-foresights ur Tech Foresight-vaultet"
```

---

## Task 14: Document the API in web/API.md

**Files:**
- Modify: `web/API.md`

- [ ] **Step 1: Update intro + abstraction**

In `web/API.md`: add "foresights" to the title intro line and to the `## Översikt` abstraction parenthetical (add `ForesightStore` to the store list and "foresights" to the content list). The file already documents experts/areas/blog/radar — read those sections to match the style.

- [ ] **Step 2: Add the Foresights section**

Insert after the `### Radarer` section (and before `## Miljövariabler`):
```markdown
### Foresights

En foresight är en strategisk framsynsanalys: metadata + markdown, precis som ett blogginlägg, med ett extra `horizon`-fält.

#### GET /api/v1/foresights
Hämtar metadata för alla foresights.

#### POST /api/v1/foresights
Skapar en foresight. Kräver autentisering. Body: `{ "foresight": {…metadata}, "markdown": "…" }`. `201` / `409` / `400`.

#### GET /api/v1/foresights/[slug]
Hämtar `{ "foresight": {…}, "markdown": "…" }`. `404` om saknas.

#### PUT /api/v1/foresights/[slug]
Uppdaterar metadata, markdown, eller båda. Kräver autentisering. Body: `{ "foresight"?: {…}, "markdown"?: "…" }`. `404`/`409`.

#### DELETE /api/v1/foresights/[slug]
Tar bort en foresight (metadata + markdown-fil). Kräver autentisering. `404` om saknas.
```

- [ ] **Step 3: Update Dataformat**

In `## Dataformat`, add after the radar entries:
```markdown
- `foresight-data.json` - Foresight-metadata
- `foresight/*.md` - Markdown för varje foresight
```

- [ ] **Step 4: Commit**

```bash
git add API.md
git commit -m "docs(foresight): dokumentera /api/v1/foresights i web/API.md"
```

---

## Task 15: expertbyran-api skill — foresight endpoints

**Files:**
- Modify: `paperclip/skills/local/expertbyran-api/SKILL.md`
- Modify: `paperclip/skills/local/expertbyran-api/references/payloads.md`

- [ ] **Step 1: Add foresight endpoints to SKILL.md**

In `paperclip/skills/local/expertbyran-api/SKILL.md`: add "foresights" to the mutable-content sentence; add a `### Foresights` endpoints block after the `### Radarer` block (mirror the blog block — `GET/POST /api/v1/foresights`, `GET/PUT/DELETE /api/v1/foresights/{slug}`, body `{ foresight, markdown }`); add `foresight` to the `/refresh` tag list; update the payloads reference sentence to mention `ForesightEntry`. Add a curl example for creating a foresight (mirror the blog curl example).

- [ ] **Step 2: Add ForesightEntry to payloads.md**

In `paperclip/skills/local/expertbyran-api/references/payloads.md`: add a `## Foresight` section with the `ForesightEntry` field table: `slug` (unik), `title`, `date` (ISO), `authorSlug?`, `authorName?`, `authorRole?`, `areaSlugs` (slug[] ≥1), `excerpt`, `horizon?` — plus the author rule (minst en av authorSlug/authorName) and that markdown skickas separat i `markdown`-fältet. Mirror the BlogPostEntry table.

- [ ] **Step 3: Commit**

```bash
git add paperclip/skills/local/expertbyran-api/SKILL.md paperclip/skills/local/expertbyran-api/references/payloads.md
git commit -m "docs(skills): expertbyran-api — foresight-endpoints + ForesightEntry"
```

---

## Task 16: expertbyran-radar skill — foresight flow

**Files:**
- Modify: `paperclip/skills/local/expertbyran-radar/SKILL.md`

- [ ] **Step 1: Broaden the skill to radar + foresights**

In `paperclip/skills/local/expertbyran-radar/SKILL.md` (keep the name `expertbyran-radar`), broaden the intro so it covers two editorial flows, and add a section for the foresight flow. Keep the existing radar/blip content. Add:
- A short "Två flöden" framing: (1) radar (blips), (2) foresights.
- **Foresight-flöde:** read a vault foresight folder (`40 Foresights/<namn>/`), synthesize Brief + Scenarios + Implications + Report into ONE neutral Swedish markdown document; set `excerpt`, `horizon` (from the vault `horizon` field), and `areaSlugs` (map the vault `domain/topic` tags to the nearest expertområde — look up available areas via the API); publish via `POST /api/v1/foresights` (PUT to update). Defer API mechanics to skill `expertbyran-api`, writing style to skill `blog-editor`.
- Update the description frontmatter to mention foresights so the skill triggers for foresight tasks too.

Keep the editorial rules (kurera inte dumpa, neutralt, inga kundnamn, svenska å/ä/ö). No file-path cross-links between skills (reference by name).

- [ ] **Step 2: Sanity check**

Re-read the edited SKILL.md: does the frontmatter `description` still parse (single line, < 1024 chars)? Are both flows clearly separated? Are all cross-skill references by name only (no paths)?

- [ ] **Step 3: Commit**

```bash
git add paperclip/skills/local/expertbyran-radar/SKILL.md
git commit -m "feat(skills): expertbyran-radar hanterar både radar och foresights"
```

---

## Task 17: Full verification + smoke

**Files:** none (verification only)

- [ ] **Step 1: Full test suite**

Run (from `web/`): `npm run test`
Expected: all pass, including the new foresight tests (schema, file store, memory smoke, API).

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: no errors; build succeeds; `/foresight`, `/foresight/[slug]`, `/api/v1/foresights`, `/api/v1/foresights/[slug]` appear in the route list.

- [ ] **Step 3: Curl smoke against the seed**

Boot the dev server reading the repo-root seed and verify (the running dev server uses `DATA_DIR=data`; for the seed at repo root use a dev server with `DATA_DIR=$(pwd)`):
```bash
# from web/
API_TOKEN=smoke DATA_DIR=$(pwd) PORT=3124 npx next dev &
# poll until up, then:
```
- `GET http://localhost:3124/api/v1/foresights` → 200, contains both seed slugs.
- `GET http://localhost:3124/api/v1/foresights/digital-suveranitet-statsforvaltning-2026-2030` → 200, has `foresight` + non-empty `markdown`.
- `GET http://localhost:3124/foresight` → 200, HTML contains "Strategisk framsyn" and a seed title.
- `GET http://localhost:3124/foresight/agentiska-organisationer-utan-governance` → 200, renders the markdown.
- `GET http://localhost:3124/foresight/finns-inte` → 404.
Kill the server when done.

- [ ] **Step 4: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "test(foresight): full verifiering — suite, build, smoke"
```

---

## Notes for the implementer

- Run tests with the **project-local** vitest (`npm run test` from `web/`), never global `npx vitest` (it lacks `jsdom`).
- A foresight body is **markdown** (like blog) — reuse `renderBlogMarkdown`; do not write a second renderer.
- The API is the only write path. Pages never write files.
- `revalidateTag("foresight", "max")` uses the **2-argument** form.
- Seed lives at the repo `web/` root (`web/foresight-data.json` + `web/foresight/`), NOT under `web/data/` (gitignored runtime dir).
- Swedish UI text with correct å/ä/ö.
- This is **Etapp 1**. Do NOT implement blip `areaSlugs` or the radar "Relaterat" panel here — that is Etapp 2 (separate plan). (The blip schema already tolerates an optional `areaSlugs`? No — it does not yet; leave the radar schema untouched in this plan.)
