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
