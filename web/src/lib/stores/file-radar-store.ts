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
