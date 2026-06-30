// web/src/lib/stores/sqlite-radar-store.ts
import type { DatabaseSync } from "node:sqlite";

import {
  assertRadarIntegrity,
  radarBlipsFileSchema,
  radarMetaSchema,
  type Blip,
  type RadarMeta,
} from "@/lib/radar/schema";
import { defaultRings } from "@/lib/radar/rings";
import { getDb } from "@/lib/db/client";
import type { RadarStore } from "./types";
import { ConflictError, NotFoundError } from "./types";

type RadarRow = {
  slug: string;
  title: string;
  subtitle: string | null;
  version: string | null;
  date: string;
  segments: string;
  rings: string | null;
  blips?: string;
};

const META_COLUMNS = "slug, title, subtitle, version, date, segments, rings";

function rowToMeta(row: RadarRow): RadarMeta {
  const meta: RadarMeta = {
    slug: row.slug,
    title: row.title,
    date: row.date,
    segments: JSON.parse(row.segments) as RadarMeta["segments"],
    // Defensivt: en rad utan ringar (NULL) faller tillbaka på standarduppsättningen.
    rings: row.rings ? (JSON.parse(row.rings) as RadarMeta["rings"]) : defaultRings(),
  };
  if (row.subtitle !== null) meta.subtitle = row.subtitle;
  if (row.version !== null) meta.version = row.version;
  return meta;
}

function validateRadarMeta(meta: RadarMeta): RadarMeta {
  const result = radarMetaSchema.safeParse(meta);
  if (!result.success) {
    throw new Error(
      `Invalid radar meta: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  }
  return result.data;
}

function validateBlips(blips: Blip[]): Blip[] {
  const result = radarBlipsFileSchema.safeParse({ blips });
  if (!result.success) {
    throw new Error(
      `Invalid radar blips: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  }
  return result.data.blips;
}

export class SqliteRadarStore implements RadarStore {
  constructor(private readonly dbInstance?: DatabaseSync) {}

  private get db(): DatabaseSync {
    return this.dbInstance ?? getDb();
  }

  private exists(slug: string): boolean {
    return Boolean(this.db.prepare("SELECT 1 FROM radars WHERE slug = ?").get(slug));
  }

  async listRadars(): Promise<RadarMeta[]> {
    const rows = this.db
      .prepare(`SELECT ${META_COLUMNS} FROM radars ORDER BY date_ms DESC, slug`)
      .all() as RadarRow[];
    return rows.map(rowToMeta);
  }

  async getRadar(slug: string): Promise<{ meta: RadarMeta; blips: Blip[] } | null> {
    const row = this.db
      .prepare(`SELECT ${META_COLUMNS}, blips FROM radars WHERE slug = ?`)
      .get(slug) as RadarRow | undefined;
    if (!row) return null;
    return { meta: rowToMeta(row), blips: JSON.parse(row.blips ?? "[]") as Blip[] };
  }

  async createRadar(meta: RadarMeta, blips: Blip[]): Promise<RadarMeta> {
    const validatedMeta = validateRadarMeta(meta);
    const validatedBlips = validateBlips(blips);
    assertRadarIntegrity(validatedMeta, validatedBlips);
    if (this.exists(validatedMeta.slug)) {
      throw new ConflictError(`Radar with slug ${validatedMeta.slug} already exists`);
    }
    this.db
      .prepare(
        `INSERT INTO radars (slug, title, subtitle, version, date, date_ms, segments, rings, blips, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        validatedMeta.slug,
        validatedMeta.title,
        validatedMeta.subtitle ?? null,
        validatedMeta.version ?? null,
        validatedMeta.date,
        Date.parse(validatedMeta.date),
        JSON.stringify(validatedMeta.segments),
        JSON.stringify(validatedMeta.rings),
        JSON.stringify(validatedBlips),
        new Date().toISOString(),
      );
    return validatedMeta;
  }

  async updateRadar(
    slug: string,
    patch: { meta?: RadarMeta; blips?: Blip[] },
  ): Promise<RadarMeta> {
    const existing = await this.getRadar(slug);
    if (!existing) throw new NotFoundError(`Radar with slug ${slug} not found`);

    const nextMeta = patch.meta ? validateRadarMeta(patch.meta) : existing.meta;
    const nextBlips = patch.blips ? validateBlips(patch.blips) : existing.blips;
    assertRadarIntegrity(nextMeta, nextBlips);

    const slugChanged = nextMeta.slug !== slug;
    if (slugChanged && this.exists(nextMeta.slug)) {
      throw new ConflictError(`Radar with slug ${nextMeta.slug} already exists`);
    }

    this.db
      .prepare(
        `UPDATE radars
         SET slug = ?, title = ?, subtitle = ?, version = ?, date = ?, date_ms = ?, segments = ?, rings = ?, blips = ?, updated_at = ?
         WHERE slug = ?`,
      )
      .run(
        nextMeta.slug,
        nextMeta.title,
        nextMeta.subtitle ?? null,
        nextMeta.version ?? null,
        nextMeta.date,
        Date.parse(nextMeta.date),
        JSON.stringify(nextMeta.segments),
        JSON.stringify(nextMeta.rings),
        JSON.stringify(nextBlips),
        new Date().toISOString(),
        slug,
      );
    return nextMeta;
  }

  async deleteRadar(slug: string): Promise<void> {
    const result = this.db.prepare("DELETE FROM radars WHERE slug = ?").run(slug);
    if (result.changes === 0) throw new NotFoundError(`Radar with slug ${slug} not found`);
  }
}
