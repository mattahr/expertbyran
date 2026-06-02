# Lagringsabstraktion + enhetligt innehålls-API — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abstrahera bort filerna bakom tre fokuserade gränssnitt, göra REST-API:et till enda skrivvägen för innehåll, pensionera GitHub-raw-läget, och flytta cachen till web-lagret med API-ägd invalidering.

**Architecture:** Tre store-gränssnitt (`ConfigStore`, `ContentStore`, `BlogStore`) med fil-implementationer och in-memory-implementationer för test. En composition root injicerar implementationer. Query-helpers (`getSiteData`, `getBlogData`) komponerar från storarna och wrappas i Next 16:s `unstable_cache` med taggar (`experts`, `areas`, `blog`). API-routes anropar storarna och kör `revalidateTag` efter skrivningar.

**Tech Stack:** Next.js 16 (App Router, standalone), TypeScript, Zod, Vitest, `node:fs/promises`.

**Spec:** `docs/superpowers/specs/2026-06-02-content-storage-abstraction-unified-api-design.md`

**Planeringsbeslut som förfinar specen (flaggas för granskning):**
- **`PUT /api/v1/site-data` tas bort** (specen sa "behåll config-PUT *eller* ta bort"). `ConfigStore` förblir då **read-only**; config (site/organization/marketplace) är seed-/filförfattad och muteras inte via API i denna iteration. Detta håller "API:et = enda skrivvägen för *content*" rent utan en config-skrivväg som krockar med samma fil.
- Bloggens metadatatyp heter `BlogPostEntry` i koden (specen skrev "BlogPostMeta"); vi använder `BlogPostEntry` genomgående.

**Branch:** Skapa en ren branch från `main` för detta arbete (UI-arbetet ligger på `web-uppfraschning-radar`; håll isär). Alla kommandon körs från `web/`.

---

## Filstruktur

**Skapas:**
- `web/src/lib/stores/types.ts` — gränssnitten + `SiteConfig`-typ + felklasser.
- `web/src/lib/stores/fs-helpers.ts` — låg-nivå fil-IO (resolveDataDir, atomisk JSON-skrivning, markdown-IO), parametriserad på `dataDir`.
- `web/src/lib/stores/file-config-store.ts` — `FileConfigStore`.
- `web/src/lib/stores/file-content-store.ts` — `FileContentStore`.
- `web/src/lib/stores/file-blog-store.ts` — `FileBlogStore`.
- `web/src/lib/stores/memory-stores.ts` — `InMemoryConfigStore/ContentStore/BlogStore`.
- `web/src/lib/stores/index.ts` — composition root (`getConfigStore/getContentStore/getBlogStore` + test-override).
- Tester: `web/src/lib/stores/file-content-store.test.ts`, `file-blog-store.test.ts`, `file-config-store.test.ts`, `memory-stores.test.ts`.
- `web/src/app/api/v1/areas/route.ts`, `web/src/app/api/v1/areas/[slug]/route.ts`.

**Ändras:**
- `web/src/lib/content/store.ts` — komponerar via stores + `unstable_cache(tags)`; URL-läget bort.
- `web/src/lib/blog/store.ts` — läser via `BlogStore` + `unstable_cache(tags)`; URL-läget bort.
- `web/src/app/api/v1/experts/route.ts`, `experts/[slug]/route.ts` — via `ContentStore` + `revalidateTag`.
- `web/src/app/api/v1/blog/posts/route.ts`, `blog/posts/[slug]/route.ts` — via `BlogStore` + `revalidateTag`.
- `web/src/app/api/v1/site-data/route.ts` — GET komponerar; PUT tas bort.
- `web/src/app/refresh/route.ts` — invaliderar taggar.
- `web/src/lib/content/store.test.ts`, `web/src/lib/blog/store.test.ts` — ersätts (URL-läge bort).
- Docs: `web/docs/architecture.md`, `web/API.md`, `web/CLAUDE.md`, `web/README.md`, `web/.env.example`.

**Tas bort:**
- `web/src/lib/github.ts` (+ `web/src/lib/robots-policy`? nej — endast github.ts om bara URL-läget använder den; verifieras i Task 14).
- `web/src/lib/storage/disk-storage.ts` (efter att alla routes repointats — Task 13).

---

## Task 1: Gränssnitt och felklasser

**Files:**
- Create: `web/src/lib/stores/types.ts`

- [ ] **Step 1: Skriv gränssnitten och felklasserna**

```ts
// web/src/lib/stores/types.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import type { BlogPostEntry } from "@/lib/blog/schema";

/** Config-delen av site-data.json som förblir filförfattad (inte "content"). */
export type SiteConfig = Pick<
  SiteData,
  "version" | "updatedAt" | "site" | "organization" | "marketplace"
>;

export interface ConfigStore {
  getSiteConfig(): Promise<SiteConfig>;
}

export interface ContentStore {
  listExperts(): Promise<Expert[]>;
  getExpert(slug: string): Promise<Expert | null>;
  createExpert(expert: Expert): Promise<Expert>;
  updateExpert(slug: string, expert: Expert): Promise<Expert>;
  deleteExpert(slug: string): Promise<void>;

  listAreas(): Promise<ExpertArea[]>;
  getArea(slug: string): Promise<ExpertArea | null>;
  createArea(area: ExpertArea): Promise<ExpertArea>;
  updateArea(slug: string, area: ExpertArea): Promise<ExpertArea>;
  deleteArea(slug: string): Promise<void>;
}

export interface BlogStore {
  listPosts(): Promise<BlogPostEntry[]>;
  getPost(slug: string): Promise<{ meta: BlogPostEntry; markdown: string } | null>;
  createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry>;
  updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry>;
  deletePost(slug: string): Promise<void>;
}

/** Kastas av stores när en slug redan finns. API mappar till 409. */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/** Kastas av stores när en post saknas. API mappar till 404. */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
```

- [ ] **Step 2: Verifiera att det typecheckar**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS (inga fel)

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/stores/types.ts
git commit -m "feat(stores): definiera ConfigStore/ContentStore/BlogStore-gränssnitt"
```

---

## Task 2: Låg-nivå fil-hjälpare

**Files:**
- Create: `web/src/lib/stores/fs-helpers.ts`

- [ ] **Step 1: Skriv fil-hjälparna**

```ts
// web/src/lib/stores/fs-helpers.ts
import fs from "node:fs/promises";
import path from "node:path";

/** Löser datakatalogen från env (samma logik som tidigare disk-storage). */
export function resolveDataDir(): string {
  const configured = process.env.DATA_DIR?.trim();
  if (configured) return path.resolve(configured);
  if (process.env.NODE_ENV === "production") return "/app/data";
  return path.resolve(process.cwd(), "data");
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

let tmpCounter = 0;

export async function atomicWriteFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp.${process.pid}.${tmpCounter++}`;
  try {
    await fs.writeFile(tmpPath, content, "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    await fs.unlink(tmpPath).catch(() => {});
    throw error;
  }
}

export async function readTextFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function deleteFileIfExists(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
```

- [ ] **Step 2: Verifiera typecheck**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/stores/fs-helpers.ts
git commit -m "feat(stores): låg-nivå fil-hjälpare (resolveDataDir, atomisk skrivning, markdown-IO)"
```

---

## Task 3: FileConfigStore (read-only config)

**Files:**
- Create: `web/src/lib/stores/file-config-store.ts`
- Test: `web/src/lib/stores/file-config-store.test.ts`

- [ ] **Step 1: Skriv det failande testet**

```ts
// web/src/lib/stores/file-config-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import { FileConfigStore } from "./file-config-store";

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-config-"));
  await fs.writeFile(path.join(dir, "site-data.json"), JSON.stringify(siteData), "utf-8");
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileConfigStore", () => {
  it("läser config-delen utan experter/områden", async () => {
    const store = new FileConfigStore(dir);
    const config = await store.getSiteConfig();

    expect(config.site.name).toBe(siteData.site.name);
    expect(config.marketplace.name).toBe(siteData.marketplace.name);
    expect(config.version).toBe(siteData.version);
    // Config-objektet exponerar inte experter/områden:
    expect((config as Record<string, unknown>).experts).toBeUndefined();
    expect((config as Record<string, unknown>).expertAreas).toBeUndefined();
  });
});
```

- [ ] **Step 2: Kör testet — verifiera att det failar**

Run (från `web/`): `npx vitest run src/lib/stores/file-config-store.test.ts`
Expected: FAIL ("Cannot find module './file-config-store'")

- [ ] **Step 3: Skriv implementationen**

```ts
// web/src/lib/stores/file-config-store.ts
import path from "node:path";

import { parseSiteData } from "@/lib/content/schema";
import type { ConfigStore, SiteConfig } from "./types";
import { readJsonFile, resolveDataDir } from "./fs-helpers";

export class FileConfigStore implements ConfigStore {
  private readonly file: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.file = path.join(dataDir, "site-data.json");
  }

  async getSiteConfig(): Promise<SiteConfig> {
    const raw = await readJsonFile(this.file);
    const data = parseSiteData(raw, this.file);
    const { version, updatedAt, site, organization, marketplace } = data;
    return { version, updatedAt, site, organization, marketplace };
  }
}
```

- [ ] **Step 4: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/stores/file-config-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/stores/file-config-store.ts web/src/lib/stores/file-config-store.test.ts
git commit -m "feat(stores): FileConfigStore + test"
```

---

## Task 4: FileContentStore (experter + områden)

**Files:**
- Create: `web/src/lib/stores/file-content-store.ts`
- Test: `web/src/lib/stores/file-content-store.test.ts`

`FileContentStore` läser/skriver `experts[]` och `expertAreas[]` inuti `site-data.json`.
Skrivningar läser hela filen, byter ut rätt array, bumpar `updatedAt`, validerar med
`parseSiteData` och skriver atomiskt — config bevaras.

- [ ] **Step 1: Skriv det failande testet**

```ts
// web/src/lib/stores/file-content-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import { FileContentStore } from "./file-content-store";
import { ConflictError, NotFoundError } from "./types";

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
    expect(experts.length).toBe(siteData.experts.length);
    const first = await store.getExpert(siteData.experts[0].slug);
    expect(first?.name).toBe(siteData.experts[0].name);
    expect(await store.getExpert("finns-inte")).toBeNull();
  });

  it("uppdaterar en expert och bevarar config", async () => {
    const target = siteData.experts[0];
    const updated = { ...target, name: "Nytt Namn" };
    const result = await store.updateExpert(target.slug, updated);
    expect(result.name).toBe("Nytt Namn");

    // Config bevarad efter skrivning:
    const onDisk = JSON.parse(
      await fs.readFile(path.join(dir, "site-data.json"), "utf-8"),
    );
    expect(onDisk.site.name).toBe(siteData.site.name);
    expect(onDisk.experts.find((e: { slug: string }) => e.slug === target.slug).name).toBe(
      "Nytt Namn",
    );
  });

  it("kastar NotFoundError vid uppdatering av okänd slug", async () => {
    await expect(store.updateExpert("finns-inte", siteData.experts[0])).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("kastar ConflictError vid skapande av befintlig slug", async () => {
    await expect(store.createExpert(siteData.experts[0])).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("FileContentStore områden", () => {
  it("listar och uppdaterar områden", async () => {
    const areas = await store.listAreas();
    expect(areas.length).toBe(siteData.expertAreas.length);
    const target = siteData.expertAreas[0];
    const result = await store.updateArea(target.slug, { ...target, name: "Nytt Område" });
    expect(result.name).toBe("Nytt Område");
  });
});
```

- [ ] **Step 2: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/lib/stores/file-content-store.test.ts`
Expected: FAIL ("Cannot find module './file-content-store'")

- [ ] **Step 3: Skriv implementationen**

```ts
// web/src/lib/stores/file-content-store.ts
import path from "node:path";

import { parseSiteData, type Expert, type ExpertArea, type SiteData } from "@/lib/content/schema";
import type { ContentStore } from "./types";
import { ConflictError, NotFoundError } from "./types";
import { atomicWriteFile, readJsonFile, resolveDataDir } from "./fs-helpers";

export class FileContentStore implements ContentStore {
  private readonly file: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.file = path.join(dataDir, "site-data.json");
  }

  private async read(): Promise<SiteData> {
    const raw = await readJsonFile(this.file);
    return parseSiteData(raw, this.file);
  }

  private async write(data: SiteData): Promise<void> {
    data.updatedAt = new Date().toISOString();
    const validated = parseSiteData(data, "content-store-write");
    await atomicWriteFile(this.file, JSON.stringify(validated, null, 2));
  }

  async listExperts(): Promise<Expert[]> {
    return (await this.read()).experts;
  }

  async getExpert(slug: string): Promise<Expert | null> {
    return (await this.read()).experts.find((e) => e.slug === slug) ?? null;
  }

  async createExpert(expert: Expert): Promise<Expert> {
    const data = await this.read();
    if (data.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    data.experts.push(expert);
    await this.write(data);
    return expert;
  }

  async updateExpert(slug: string, expert: Expert): Promise<Expert> {
    const data = await this.read();
    const index = data.experts.findIndex((e) => e.slug === slug);
    if (index === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    if (expert.slug !== slug && data.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    data.experts[index] = expert;
    await this.write(data);
    return expert;
  }

  async deleteExpert(slug: string): Promise<void> {
    const data = await this.read();
    const index = data.experts.findIndex((e) => e.slug === slug);
    if (index === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    data.experts.splice(index, 1);
    await this.write(data);
  }

  async listAreas(): Promise<ExpertArea[]> {
    return (await this.read()).expertAreas;
  }

  async getArea(slug: string): Promise<ExpertArea | null> {
    return (await this.read()).expertAreas.find((a) => a.slug === slug) ?? null;
  }

  async createArea(area: ExpertArea): Promise<ExpertArea> {
    const data = await this.read();
    if (data.expertAreas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    data.expertAreas.push(area);
    await this.write(data);
    return area;
  }

  async updateArea(slug: string, area: ExpertArea): Promise<ExpertArea> {
    const data = await this.read();
    const index = data.expertAreas.findIndex((a) => a.slug === slug);
    if (index === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    if (area.slug !== slug && data.expertAreas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    data.expertAreas[index] = area;
    await this.write(data);
    return area;
  }

  async deleteArea(slug: string): Promise<void> {
    const data = await this.read();
    const index = data.expertAreas.findIndex((a) => a.slug === slug);
    if (index === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    data.expertAreas.splice(index, 1);
    await this.write(data);
  }
}
```

- [ ] **Step 4: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/stores/file-content-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/stores/file-content-store.ts web/src/lib/stores/file-content-store.test.ts
git commit -m "feat(stores): FileContentStore (experter + områden) + test"
```

---

## Task 5: FileBlogStore (katalog + markdown)

**Files:**
- Create: `web/src/lib/stores/file-blog-store.ts`
- Test: `web/src/lib/stores/file-blog-store.test.ts`

- [ ] **Step 1: Skriv det failande testet**

```ts
// web/src/lib/stores/file-blog-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileBlogStore } from "./file-blog-store";
import { ConflictError, NotFoundError } from "./types";

let dir: string;
let store: FileBlogStore;

const META = {
  slug: "test-inlagg",
  title: "Testinlägg",
  date: "2026-04-15T10:00:00.000Z",
  authorName: "Anna Andersson",
  areaSlugs: ["revisionsmetodik"],
  excerpt: "Sammanfattning.",
};

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-blog-"));
  await fs.writeFile(path.join(dir, "blog-data.json"), JSON.stringify({ posts: [] }), "utf-8");
  store = new FileBlogStore(dir);
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileBlogStore", () => {
  it("skapar, hämtar, uppdaterar och tar bort ett inlägg", async () => {
    await store.createPost(META, "# Rubrik\n\nText.");

    const list = await store.listPosts();
    expect(list).toHaveLength(1);

    const got = await store.getPost("test-inlagg");
    expect(got?.meta.title).toBe("Testinlägg");
    expect(got?.markdown).toContain("# Rubrik");

    await store.updatePost("test-inlagg", { markdown: "# Ny\n\nNytt." });
    expect((await store.getPost("test-inlagg"))?.markdown).toContain("# Ny");

    await store.deletePost("test-inlagg");
    expect(await store.getPost("test-inlagg")).toBeNull();
    await expect(fs.access(path.join(dir, "blog", "posts", "test-inlagg.md"))).rejects.toThrow();
  });

  it("kastar ConflictError för dubbletter och NotFoundError för okänd slug", async () => {
    await store.createPost(META, "x");
    await expect(store.createPost(META, "y")).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deletePost("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});
```

- [ ] **Step 2: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/lib/stores/file-blog-store.test.ts`
Expected: FAIL ("Cannot find module './file-blog-store'")

- [ ] **Step 3: Skriv implementationen**

```ts
// web/src/lib/stores/file-blog-store.ts
import path from "node:path";

import { parseBlogCatalog, type BlogCatalog, type BlogPostEntry } from "@/lib/blog/schema";
import type { BlogStore } from "./types";
import { ConflictError, NotFoundError } from "./types";
import {
  atomicWriteFile,
  deleteFileIfExists,
  readJsonFile,
  readTextFile,
  resolveDataDir,
} from "./fs-helpers";

export class FileBlogStore implements BlogStore {
  private readonly catalogFile: string;
  private readonly postsDir: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.catalogFile = path.join(dataDir, "blog-data.json");
    this.postsDir = path.join(dataDir, "blog", "posts");
  }

  private async readCatalog(): Promise<BlogCatalog> {
    try {
      const raw = await readJsonFile(this.catalogFile);
      return parseBlogCatalog(raw, this.catalogFile);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { posts: [] };
      throw error;
    }
  }

  private async writeCatalog(catalog: BlogCatalog): Promise<void> {
    const validated = parseBlogCatalog(catalog, "blog-store-write");
    await atomicWriteFile(this.catalogFile, JSON.stringify(validated, null, 2));
  }

  private markdownPath(slug: string): string {
    return path.join(this.postsDir, `${slug}.md`);
  }

  async listPosts(): Promise<BlogPostEntry[]> {
    return (await this.readCatalog()).posts;
  }

  async getPost(slug: string): Promise<{ meta: BlogPostEntry; markdown: string } | null> {
    const meta = (await this.readCatalog()).posts.find((p) => p.slug === slug);
    if (!meta) return null;
    const markdown = await readTextFile(this.markdownPath(slug));
    return { meta, markdown };
  }

  async createPost(meta: BlogPostEntry, markdown: string): Promise<BlogPostEntry> {
    const catalog = await this.readCatalog();
    if (catalog.posts.some((p) => p.slug === meta.slug)) {
      throw new ConflictError(`Blog post with slug ${meta.slug} already exists`);
    }
    catalog.posts.push(meta);
    await this.writeCatalog(catalog);
    await atomicWriteFile(this.markdownPath(meta.slug), markdown);
    return meta;
  }

  async updatePost(
    slug: string,
    patch: { meta?: BlogPostEntry; markdown?: string },
  ): Promise<BlogPostEntry> {
    const catalog = await this.readCatalog();
    const index = catalog.posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);

    const nextMeta = patch.meta ?? catalog.posts[index];
    const slugChanged = nextMeta.slug !== slug;

    if (slugChanged && catalog.posts.some((p) => p.slug === nextMeta.slug)) {
      throw new ConflictError(`Blog post with slug ${nextMeta.slug} already exists`);
    }

    if (slugChanged) {
      const existingMarkdown = patch.markdown ?? (await readTextFile(this.markdownPath(slug)));
      await deleteFileIfExists(this.markdownPath(slug));
      await atomicWriteFile(this.markdownPath(nextMeta.slug), existingMarkdown);
    } else if (patch.markdown !== undefined) {
      await atomicWriteFile(this.markdownPath(slug), patch.markdown);
    }

    catalog.posts[index] = nextMeta;
    await this.writeCatalog(catalog);
    return nextMeta;
  }

  async deletePost(slug: string): Promise<void> {
    const catalog = await this.readCatalog();
    const index = catalog.posts.findIndex((p) => p.slug === slug);
    if (index === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    catalog.posts.splice(index, 1);
    await this.writeCatalog(catalog);
    await deleteFileIfExists(this.markdownPath(slug));
  }
}
```

- [ ] **Step 4: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/stores/file-blog-store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/stores/file-blog-store.ts web/src/lib/stores/file-blog-store.test.ts
git commit -m "feat(stores): FileBlogStore (katalog + markdown) + test"
```

---

## Task 6: In-memory-stores + composition root

**Files:**
- Create: `web/src/lib/stores/memory-stores.ts`
- Create: `web/src/lib/stores/index.ts`
- Test: `web/src/lib/stores/memory-stores.test.ts`

- [ ] **Step 1: Skriv det failande testet**

```ts
// web/src/lib/stores/memory-stores.test.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import {
  InMemoryBlogStore,
  InMemoryConfigStore,
  InMemoryContentStore,
} from "./memory-stores";
import { ConflictError, NotFoundError } from "./types";

const data = siteData as unknown as SiteData;

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

describe("InMemoryConfigStore", () => {
  it("returnerar config", async () => {
    const store = new InMemoryConfigStore(data);
    expect((await store.getSiteConfig()).site.name).toBe(data.site.name);
  });
});
```

- [ ] **Step 2: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/lib/stores/memory-stores.test.ts`
Expected: FAIL ("Cannot find module './memory-stores'")

- [ ] **Step 3: Skriv in-memory-implementationerna**

```ts
// web/src/lib/stores/memory-stores.ts
import type { Expert, ExpertArea, SiteData } from "@/lib/content/schema";
import type { BlogPostEntry } from "@/lib/blog/schema";
import type { BlogStore, ConfigStore, ContentStore, SiteConfig } from "./types";
import { ConflictError, NotFoundError } from "./types";

export class InMemoryConfigStore implements ConfigStore {
  constructor(private readonly data: SiteData) {}
  async getSiteConfig(): Promise<SiteConfig> {
    const { version, updatedAt, site, organization, marketplace } = this.data;
    return { version, updatedAt, site, organization, marketplace };
  }
}

export class InMemoryContentStore implements ContentStore {
  private experts: Expert[];
  private areas: ExpertArea[];

  constructor(experts: Expert[] = [], areas: ExpertArea[] = []) {
    this.experts = [...experts];
    this.areas = [...areas];
  }

  async listExperts() {
    return [...this.experts];
  }
  async getExpert(slug: string) {
    return this.experts.find((e) => e.slug === slug) ?? null;
  }
  async createExpert(expert: Expert) {
    if (this.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    this.experts.push(expert);
    return expert;
  }
  async updateExpert(slug: string, expert: Expert) {
    const i = this.experts.findIndex((e) => e.slug === slug);
    if (i === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    if (expert.slug !== slug && this.experts.some((e) => e.slug === expert.slug)) {
      throw new ConflictError(`Expert with slug ${expert.slug} already exists`);
    }
    this.experts[i] = expert;
    return expert;
  }
  async deleteExpert(slug: string) {
    const i = this.experts.findIndex((e) => e.slug === slug);
    if (i === -1) throw new NotFoundError(`Expert with slug ${slug} not found`);
    this.experts.splice(i, 1);
  }

  async listAreas() {
    return [...this.areas];
  }
  async getArea(slug: string) {
    return this.areas.find((a) => a.slug === slug) ?? null;
  }
  async createArea(area: ExpertArea) {
    if (this.areas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    this.areas.push(area);
    return area;
  }
  async updateArea(slug: string, area: ExpertArea) {
    const i = this.areas.findIndex((a) => a.slug === slug);
    if (i === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    if (area.slug !== slug && this.areas.some((a) => a.slug === area.slug)) {
      throw new ConflictError(`Area with slug ${area.slug} already exists`);
    }
    this.areas[i] = area;
    return area;
  }
  async deleteArea(slug: string) {
    const i = this.areas.findIndex((a) => a.slug === slug);
    if (i === -1) throw new NotFoundError(`Area with slug ${slug} not found`);
    this.areas.splice(i, 1);
  }
}

export class InMemoryBlogStore implements BlogStore {
  private posts: BlogPostEntry[] = [];
  private markdown = new Map<string, string>();

  async listPosts() {
    return [...this.posts];
  }
  async getPost(slug: string) {
    const meta = this.posts.find((p) => p.slug === slug);
    if (!meta) return null;
    return { meta, markdown: this.markdown.get(slug) ?? "" };
  }
  async createPost(meta: BlogPostEntry, markdown: string) {
    if (this.posts.some((p) => p.slug === meta.slug)) {
      throw new ConflictError(`Blog post with slug ${meta.slug} already exists`);
    }
    this.posts.push(meta);
    this.markdown.set(meta.slug, markdown);
    return meta;
  }
  async updatePost(slug: string, patch: { meta?: BlogPostEntry; markdown?: string }) {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    const nextMeta = patch.meta ?? this.posts[i];
    if (nextMeta.slug !== slug && this.posts.some((p) => p.slug === nextMeta.slug)) {
      throw new ConflictError(`Blog post with slug ${nextMeta.slug} already exists`);
    }
    const md = patch.markdown ?? this.markdown.get(slug) ?? "";
    if (nextMeta.slug !== slug) this.markdown.delete(slug);
    this.markdown.set(nextMeta.slug, md);
    this.posts[i] = nextMeta;
    return nextMeta;
  }
  async deletePost(slug: string) {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i === -1) throw new NotFoundError(`Blog post with slug ${slug} not found`);
    this.posts.splice(i, 1);
    this.markdown.delete(slug);
  }
}
```

- [ ] **Step 4: Skriv composition root**

```ts
// web/src/lib/stores/index.ts
import type { BlogStore, ConfigStore, ContentStore } from "./types";
import { FileConfigStore } from "./file-config-store";
import { FileContentStore } from "./file-content-store";
import { FileBlogStore } from "./file-blog-store";

type Stores = { config: ConfigStore; content: ContentStore; blog: BlogStore };

let override: Partial<Stores> | null = null;
let defaults: Stores | null = null;

function getDefaults(): Stores {
  if (!defaults) {
    defaults = {
      config: new FileConfigStore(),
      content: new FileContentStore(),
      blog: new FileBlogStore(),
    };
  }
  return defaults;
}

export function getConfigStore(): ConfigStore {
  return override?.config ?? getDefaults().config;
}
export function getContentStore(): ContentStore {
  return override?.content ?? getDefaults().content;
}
export function getBlogStore(): BlogStore {
  return override?.blog ?? getDefaults().blog;
}

/** Endast för test: injicera in-memory-stores. */
export function __setStoresForTest(stores: Partial<Stores> | null): void {
  override = stores;
}
```

- [ ] **Step 5: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/stores/memory-stores.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/stores/memory-stores.ts web/src/lib/stores/index.ts web/src/lib/stores/memory-stores.test.ts
git commit -m "feat(stores): in-memory-stores + composition root (med test-override)"
```

---

## Task 7: Repointa content/store.ts — komponera + cache via tags, ta bort URL-läget

**Files:**
- Modify: `web/src/lib/content/store.ts` (ersätt hela filen)
- Modify: `web/src/lib/content/store.test.ts` (ersätt hela filen)

- [ ] **Step 1: Ersätt store.test.ts med test mot abstraktionen**

```ts
// web/src/lib/content/store.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import { __setStoresForTest } from "@/lib/stores";
import { InMemoryConfigStore, InMemoryContentStore } from "@/lib/stores/memory-stores";
import { getSiteData } from "./store";

const data = siteData as unknown as SiteData;

afterEach(() => __setStoresForTest(null));

describe("getSiteData", () => {
  it("komponerar config + experter + områden från storarna", async () => {
    __setStoresForTest({
      config: new InMemoryConfigStore(data),
      content: new InMemoryContentStore(data.experts, data.expertAreas),
    });

    const result = await getSiteData();

    expect(result.site.name).toBe(data.site.name);
    expect(result.experts.length).toBe(data.experts.length);
    expect(result.expertAreas.length).toBe(data.expertAreas.length);
  });
});
```

- [ ] **Step 2: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/lib/content/store.test.ts`
Expected: FAIL (gamla `getSiteData` använder disk/URL, ny komposition saknas)

- [ ] **Step 3: Ersätt store.ts**

```ts
// web/src/lib/content/store.ts
import { unstable_cache } from "next/cache";

import type { SiteData } from "@/lib/content/schema";
import { getConfigStore, getContentStore } from "@/lib/stores";

export const CONTENT_TAGS = ["experts", "areas", "config"] as const;

const loadSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    const config = await getConfigStore().getSiteConfig();
    const content = getContentStore();
    const [experts, expertAreas] = await Promise.all([
      content.listExperts(),
      content.listAreas(),
    ]);
    return { ...config, expertAreas, experts };
  },
  ["site-data"],
  { tags: [...CONTENT_TAGS] },
);

export async function getSiteData(): Promise<SiteData> {
  return loadSiteData();
}
```

- [ ] **Step 4: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/content/store.test.ts`
Expected: PASS

(`vitest.setup.ts` mockar `unstable_cache` som passthrough, så storarna anropas direkt.)

- [ ] **Step 5: Verifiera att inget annat importerar borttaget API**

Run (från `web/`): `grep -rn "resetSiteDataCache\|getSiteData(.*fresh" src`
Expected: Endast träffar i `refresh/route.ts` (åtgärdas i Task 12) — inga andra.

- [ ] **Step 6: Commit**

```bash
git add web/src/lib/content/store.ts web/src/lib/content/store.test.ts
git commit -m "refactor(content): komponera site-data via stores + unstable_cache(tags); ta bort URL-läget"
```

---

## Task 8: Repointa blog/store.ts — läs via BlogStore + cache, ta bort URL-läget

**Files:**
- Modify: `web/src/lib/blog/store.ts` (ersätt hela filen)
- Modify: `web/src/lib/blog/store.test.ts` (ersätt hela filen)

- [ ] **Step 1: Ersätt blog/store.test.ts**

```ts
// web/src/lib/blog/store.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryBlogStore } from "@/lib/stores/memory-stores";
import { getBlogData } from "./store";

afterEach(() => __setStoresForTest(null));

describe("getBlogData", () => {
  it("läser katalog och renderar markdown till HTML via BlogStore", async () => {
    const blog = new InMemoryBlogStore();
    await blog.createPost(
      {
        slug: "test",
        title: "Test",
        date: "2026-04-15T10:00:00.000Z",
        authorName: "A",
        areaSlugs: ["revisionsmetodik"],
        excerpt: "e",
      },
      "# Rubrik\n\nText.",
    );
    __setStoresForTest({ blog });

    const data = await getBlogData();

    expect(data.catalog.posts).toHaveLength(1);
    expect(data.renderedPosts.get("test")).toContain("<h1");
  });
});
```

- [ ] **Step 2: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/lib/blog/store.test.ts`
Expected: FAIL

- [ ] **Step 3: Ersätt blog/store.ts**

Notera: `unstable_cache` kan inte cacha en `Map` (ej JSON-serialiserbar). Cacha därför
renderad HTML som array av tupler och bygg `Map` utanför cachen.

```ts
// web/src/lib/blog/store.ts
import { unstable_cache } from "next/cache";

import { renderBlogMarkdown } from "@/lib/blog/markdown";
import type { BlogCatalog } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";

export type BlogData = {
  catalog: BlogCatalog;
  renderedPosts: Map<string, string>;
};

export const BLOG_TAGS = ["blog"] as const;

const loadBlogData = unstable_cache(
  async (): Promise<{ catalog: BlogCatalog; rendered: [string, string][] }> => {
    const store = getBlogStore();
    const posts = await store.listPosts();
    const rendered = await Promise.all(
      posts.map(async (meta): Promise<[string, string]> => {
        const full = await store.getPost(meta.slug);
        const html = full ? await renderBlogMarkdown(full.markdown) : "";
        return [meta.slug, html];
      }),
    );
    return { catalog: { posts }, rendered };
  },
  ["blog-data"],
  { tags: [...BLOG_TAGS] },
);

export async function getBlogData(): Promise<BlogData> {
  const { catalog, rendered } = await loadBlogData();
  return { catalog, renderedPosts: new Map(rendered) };
}
```

- [ ] **Step 4: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/lib/blog/store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add web/src/lib/blog/store.ts web/src/lib/blog/store.test.ts
git commit -m "refactor(blog): läs via BlogStore + unstable_cache(tags); ta bort URL-läget"
```

---

## Task 9: Repointa experter-routes till ContentStore + revalidateTag

**Files:**
- Modify: `web/src/app/api/v1/experts/route.ts` (ersätt hela filen)
- Modify: `web/src/app/api/v1/experts/[slug]/route.ts` (ersätt hela filen)

- [ ] **Step 1: Ersätt experts/route.ts**

```ts
// web/src/app/api/v1/experts/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const experts = await getContentStore().listExperts();
    return Response.json({ experts });
  } catch (error) {
    console.error("[api] Failed to read experts", error);
    return Response.json({ error: "Failed to read experts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const expert = (await req.json()) as Expert;
    const created = await getContentStore().createExpert(expert);
    revalidateTag("experts");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create expert" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Ersätt experts/[slug]/route.ts**

```ts
// web/src/app/api/v1/experts/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const expert = await getContentStore().getExpert(slug);
    if (!expert) {
      return Response.json({ error: `Expert with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json(expert);
  } catch (error) {
    console.error("[api] Failed to read expert", error);
    return Response.json({ error: "Failed to read expert" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const updated = (await req.json()) as Expert;
    const result = await getContentStore().updateExpert(slug, updated);
    revalidateTag("experts");
    return Response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update expert" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getContentStore().deleteExpert(slug);
    revalidateTag("experts");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete expert" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 3: Verifiera typecheck**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/v1/experts
git commit -m "refactor(api): experter-routes via ContentStore + revalidateTag('experts')"
```

---

## Task 10: Nya areas-endpoints

**Files:**
- Create: `web/src/app/api/v1/areas/route.ts`
- Create: `web/src/app/api/v1/areas/[slug]/route.ts`

- [ ] **Step 1: Skriv areas/route.ts**

```ts
// web/src/app/api/v1/areas/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ExpertArea } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const areas = await getContentStore().listAreas();
    return Response.json({ areas });
  } catch (error) {
    console.error("[api] Failed to read areas", error);
    return Response.json({ error: "Failed to read areas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const area = (await req.json()) as ExpertArea;
    const created = await getContentStore().createArea(area);
    revalidateTag("areas");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create area" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Skriv areas/[slug]/route.ts**

```ts
// web/src/app/api/v1/areas/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ExpertArea } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const area = await getContentStore().getArea(slug);
    if (!area) {
      return Response.json({ error: `Area with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json(area);
  } catch (error) {
    console.error("[api] Failed to read area", error);
    return Response.json({ error: "Failed to read area" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const updated = (await req.json()) as ExpertArea;
    const result = await getContentStore().updateArea(slug, updated);
    revalidateTag("areas");
    return Response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update area" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getContentStore().deleteArea(slug);
    revalidateTag("areas");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete area" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 3: Verifiera typecheck**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/v1/areas
git commit -m "feat(api): områden-endpoints (/api/v1/areas) via ContentStore + revalidateTag('areas')"
```

---

## Task 11: Repointa blogg-routes till BlogStore + revalidateTag

**Files:**
- Modify: `web/src/app/api/v1/blog/posts/route.ts` (ersätt hela filen)
- Modify: `web/src/app/api/v1/blog/posts/[slug]/route.ts` (ersätt hela filen)

- [ ] **Step 1: Ersätt blog/posts/route.ts**

```ts
// web/src/app/api/v1/blog/posts/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await getBlogStore().listPosts();
    return Response.json({ posts });
  } catch (error) {
    console.error("[api] Failed to read blog posts", error);
    return Response.json({ error: "Failed to read blog posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { post, markdown } = (await req.json()) as {
      post: BlogPostEntry;
      markdown: string;
    };
    if (!post || !markdown) {
      return Response.json(
        { error: "Both 'post' metadata and 'markdown' content are required" },
        { status: 400 },
      );
    }
    const created = await getBlogStore().createPost(post, markdown);
    revalidateTag("blog");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create blog post" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 2: Ersätt blog/posts/[slug]/route.ts**

```ts
// web/src/app/api/v1/blog/posts/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { BlogPostEntry } from "@/lib/blog/schema";
import { getBlogStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getBlogStore().getPost(slug);
    if (!result) {
      return Response.json({ error: `Blog post with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ post: result.meta, markdown: result.markdown });
  } catch (error) {
    console.error("[api] Failed to read blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read blog post" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const { post, markdown } = (await req.json()) as {
      post?: BlogPostEntry;
      markdown?: string;
    };
    const updated = await getBlogStore().updatePost(slug, { meta: post, markdown });
    const full = await getBlogStore().getPost(updated.slug);
    revalidateTag("blog");
    return Response.json({
      success: true,
      data: { post: updated, markdown: full?.markdown ?? "" },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update blog post" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getBlogStore().deletePost(slug);
    revalidateTag("blog");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete blog post", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete blog post" },
      { status: 400 },
    );
  }
}
```

- [ ] **Step 3: Verifiera typecheck**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/v1/blog
git commit -m "refactor(api): blogg-routes via BlogStore + revalidateTag('blog')"
```

---

## Task 12: site-data GET komponerar, PUT tas bort; /refresh invaliderar taggar

**Files:**
- Modify: `web/src/app/api/v1/site-data/route.ts` (ersätt hela filen)
- Modify: `web/src/app/refresh/route.ts` (ersätt hela filen)
- Modify: `web/src/app/refresh/route.test.ts` (ersätt hela filen)

- [ ] **Step 1: Ersätt site-data/route.ts (GET komponerar; ingen PUT)**

```ts
// web/src/app/api/v1/site-data/route.ts
import { getSiteData } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteData();
    return Response.json(data);
  } catch (error) {
    console.error("[api] Failed to read site-data", error);
    return Response.json({ error: "Failed to read site-data" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Ersätt refresh/route.test.ts**

```ts
// web/src/app/refresh/route.test.ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { revalidateTag } from "next/cache";

import { GET } from "./route";

describe("GET /refresh", () => {
  it("invaliderar innehållstaggarna och svarar ok", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("experts");
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("areas");
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("blog");
  });
});
```

- [ ] **Step 3: Kör testet — verifiera FAIL**

Run (från `web/`): `npx vitest run src/app/refresh/route.test.ts`
Expected: FAIL (gamla route anropar inte `revalidateTag`)

- [ ] **Step 4: Ersätt refresh/route.ts**

```ts
// web/src/app/refresh/route.ts
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const TAGS = ["experts", "areas", "blog"] as const;

export async function GET() {
  for (const tag of TAGS) revalidateTag(tag);
  return Response.json(
    { ok: true, invalidated: TAGS, refreshedAt: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}
```

- [ ] **Step 5: Kör testet — verifiera PASS**

Run (från `web/`): `npx vitest run src/app/refresh/route.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add web/src/app/api/v1/site-data/route.ts web/src/app/refresh
git commit -m "refactor(api): site-data GET komponerar via stores, PUT borttaget; /refresh invaliderar taggar"
```

---

## Task 13: Ta bort disk-storage och github.ts; verifiera inga referenser

**Files:**
- Delete: `web/src/lib/storage/disk-storage.ts`
- Delete: `web/src/lib/github.ts`

- [ ] **Step 1: Hitta kvarvarande referenser till disk-storage**

Run (från `web/`): `grep -rn "storage/disk-storage\|lib/github\|toGitHubApiUrl" src`
Expected: Inga träffar (alla routes och stores använder nu fs-helpers/stores).
Om träffar finns: åtgärda dem innan borttagning (de ska peka på stores/fs-helpers).

- [ ] **Step 2: Ta bort filerna**

```bash
git rm web/src/lib/storage/disk-storage.ts web/src/lib/github.ts
```

Notera: `web/src/lib/storage/seed.ts` och `visit-log.ts` är kvar (oberoende av disk-storage).

- [ ] **Step 3: Verifiera typecheck + full testsvit**

Run (från `web/`): `npx tsc --noEmit && npx vitest run`
Expected: PASS — alla tester gröna.

- [ ] **Step 4: Commit**

```bash
git add -A web/src/lib
git commit -m "chore(web): ta bort disk-storage och github.ts (URL-läget pensionerat)"
```

---

## Task 14: Rensa env-variabler och uppdatera docs

**Files:**
- Modify: `web/.env.example`
- Modify: `web/API.md`
- Modify: `web/docs/architecture.md`
- Modify: `web/CLAUDE.md`
- Modify: `web/README.md`

- [ ] **Step 1: Uppdatera `.env.example`**

Ersätt innehållet med (URL-läges-variabler borttagna):

```bash
# web/.env.example
DATA_DIR=data
API_TOKEN=change-me
```

- [ ] **Step 2: Uppdatera API.md**

Gör följande ändringar i `web/API.md`:
- Ta bort raderna om `SITE_DATA_URL`, `SITE_DATA_REVALIDATE_SECONDS`,
  `SITE_DATA_FETCH_TIMEOUT_MS` i miljövariabel-tabellen.
- Ta bort sektionen `PUT /api/v1/site-data` (PUT finns inte längre).
- Lägg till en sektion **Expertområden** med endpoints, direkt efter Experter-sektionen:

```markdown
### Expertområden

#### GET /api/v1/areas
Hämtar lista av alla expertområden. Response: `{ "areas": [ ... ] }`.

#### POST /api/v1/areas
Skapar ett nytt område. Kräver autentisering. Body: ett ExpertArea-objekt.
409 om sluggen redan finns.

#### GET /api/v1/areas/[slug]
Hämtar ett specifikt område. 404 om det saknas.

#### PUT /api/v1/areas/[slug]
Uppdaterar ett område. Kräver autentisering.

#### DELETE /api/v1/areas/[slug]
Tar bort ett område. Kräver autentisering.
```

- I `## Översikt`: ändra meningen om lagring till att API:et är **enda skrivvägen**
  för innehåll och att lagringen är abstraherad bakom store-gränssnitt (filer idag,
  bytbar backend senare).

- [ ] **Step 3: Uppdatera docs/architecture.md**

Ersätt sektionen **2. Innehållslager** och **Dataflöde** med en beskrivning av store-
abstraktionen (ConfigStore/ContentStore/BlogStore), att API:et är enda skrivvägen, att
cachen ligger i web-lagret (`unstable_cache` + taggar `experts`/`areas`/`blog`) och
invalideras av API:et via `revalidateTag`, samt att GitHub-raw/URL-läget är borttaget.
Ta bort omnämnanden av `SITE_DATA_URL` och snapshot-från-GitHub.

- [ ] **Step 4: Uppdatera web/CLAUDE.md**

I `## Datamodell`: ta bort "### 2. URL-läge (bakåtkompatibelt)" och beskrivningen av
`SITE_DATA_URL` som HTTP-URL. Beskriv istället store-abstraktionen och att API:et är
enda skrivvägen. I miljövariabel-tabellen: ta bort `SITE_DATA_URL`,
`SITE_DATA_REVALIDATE_SECONDS`, `SITE_DATA_FETCH_TIMEOUT_MS`.

- [ ] **Step 5: Uppdatera README.md**

Ta bort referenser till `SITE_DATA_URL`/URL-läge; beskriv kort store-abstraktionen och
att innehåll muteras via API:et.

- [ ] **Step 6: Verifiera inga döda env-referenser i kod/docs**

Run (från `web/`): `grep -rn "SITE_DATA_URL\|SITE_DATA_REVALIDATE\|SITE_DATA_FETCH" src docs API.md CLAUDE.md README.md`
Expected: Inga träffar.

- [ ] **Step 7: Commit**

```bash
git add web/.env.example web/API.md web/docs/architecture.md web/CLAUDE.md web/README.md
git commit -m "docs(web): uppdatera för store-abstraktion + enhetligt API; ta bort URL-läges-docs"
```

---

## Task 15: Slutverifiering (tsc, lint, vitest, build, manuell rök)

**Files:** (inga ändringar — endast verifiering; eventuella fixar committas)

- [ ] **Step 1: Typecheck**

Run (från `web/`): `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 2: Lint**

Run (från `web/`): `npm run lint`
Expected: 0 errors (befintliga varningar i orörda filer är OK).

- [ ] **Step 3: Full testsvit (ren datakatalog)**

Run (från `web/`): `DATA_DIR=/tmp/eb-clean-nonexistent npx vitest run`
Expected: Alla tester gröna.

- [ ] **Step 4: Produktionsbuild**

Run (från `web/`): `npm run build`
Expected: Build lyckas; route-tabellen listar `/api/v1/areas`, `/api/v1/areas/[slug]`,
saknar ingen befintlig sida, och inkluderar inte längre någon URL-lägeskod.

- [ ] **Step 5: Manuell rök — skrivning invaliderar cache**

Starta dev (säkerställ att `DATA_DIR=data` i `web/.env` och att ingen stray `web/app/`
finns — se projektminnet om DATA_DIR). Verifiera:
1. `GET http://localhost:3000/api/v1/areas` returnerar områdeslistan.
2. Skapa/ändra en expert via `PUT /api/v1/experts/<slug>` med Bearer-token →
   `/experter`-sidan visar ändringen efter omladdning (tag-invalidering fungerar).
3. `GET /refresh` svarar `{ ok: true, invalidated: [...] }`.

- [ ] **Step 6: Commit eventuella fixar**

```bash
git add -A web
git commit -m "test(web): slutverifiering av store-abstraktion + enhetligt API"
```

---

## Self-review (utförd vid planskrivning)

**Spec-täckning:**
- Tre gränssnitt → Task 1. Fil-impl → Task 3–5. In-memory + composition root → Task 6.
- Konsumtion/komposition (getSiteData/getBlogData) → Task 7–8. Cache i web + tag-invalidering
  → Task 7–8 (cache) + Task 9–12 (revalidateTag). API enda skrivväg + areas-endpoints →
  Task 9–11. site-data PUT bort → Task 12. URL-läge bort → Task 7,8,13. Seeding orörd
  (seed.ts kvar). Testning/in-memory → Task 6 + ersatta tester. Docs → Task 14. Radar-
  förberedelse → ingen kod (medvetet; mönstret dokumenterat i specen). Följdarbete (skills)
  → egen spec, ej i denna plan.
- **Avvikelse flaggad:** PUT /site-data tas bort (specen tillät "eller tas bort"); ConfigStore
  förblir read-only. Se planhuvudet.

**Placeholder-scan:** Inga TBD/TODO; all kod komplett.

**Typkonsistens:** `BlogPostEntry` används genomgående (ej "BlogPostMeta"). `ConflictError`/
`NotFoundError` definieras i Task 1 och används i Task 4–6, 9–12. `getConfigStore/
getContentStore/getBlogStore/__setStoresForTest` definieras i Task 6 och används i Task 7–12.
`CONTENT_TAGS`/`BLOG_TAGS` definieras i Task 7–8. Tag-namn (`experts`/`areas`/`blog`) är
konsekventa mellan cache (Task 7–8) och invalidering (Task 9–12).
