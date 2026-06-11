// web/src/lib/stores/sqlite-content-store.ts
import type { DatabaseSync } from "node:sqlite";

import {
  parseExpert,
  parseExpertArea,
  type Expert,
  type ExpertArea,
} from "@/lib/content/schema";
import { getDb } from "@/lib/db/client";
import type { ContentStore } from "./types";
import { ConflictError, NotFoundError } from "./types";

// Experter och områden lagras som JSON-dokument per rad (de är små och läses
// som hela listor); rowid bevarar insättningsordningen som fil-stores hade.
// Referensintegriteten (expert.areaSlugs -> områden) som tidigare upprätthölls
// av helfilsvalideringen i parseSiteData kontrolleras här explicit per mutation.
export class SqliteContentStore implements ContentStore {
  constructor(private readonly dbInstance?: DatabaseSync) {}

  private get db(): DatabaseSync {
    return this.dbInstance ?? getDb();
  }

  private areaSlugSet(): Set<string> {
    const rows = this.db.prepare("SELECT slug FROM expert_areas").all() as { slug: string }[];
    return new Set(rows.map((row) => row.slug));
  }

  private assertAreaRefs(expert: Expert): void {
    const known = this.areaSlugSet();
    for (const slug of expert.areaSlugs) {
      if (!known.has(slug)) throw new Error(`Okänt expertområde: ${slug}.`);
    }
  }

  private expertsReferencingArea(areaSlug: string): string[] {
    const rows = this.db.prepare("SELECT slug, data FROM experts").all() as {
      slug: string;
      data: string;
    }[];
    return rows
      .filter((row) => (JSON.parse(row.data) as Expert).areaSlugs.includes(areaSlug))
      .map((row) => row.slug);
  }

  async listExperts(): Promise<Expert[]> {
    const rows = this.db.prepare("SELECT data FROM experts ORDER BY rowid").all() as {
      data: string;
    }[];
    return rows.map((row) => JSON.parse(row.data) as Expert);
  }

  async getExpert(slug: string): Promise<Expert | null> {
    const row = this.db.prepare("SELECT data FROM experts WHERE slug = ?").get(slug) as
      | { data: string }
      | undefined;
    return row ? (JSON.parse(row.data) as Expert) : null;
  }

  async createExpert(expert: Expert): Promise<Expert> {
    const validated = parseExpert(expert, "content-store-write");
    if (await this.getExpert(validated.slug)) {
      throw new ConflictError(`Expert with slug ${validated.slug} already exists`);
    }
    this.assertAreaRefs(validated);
    this.db
      .prepare("INSERT INTO experts (slug, data) VALUES (?, ?)")
      .run(validated.slug, JSON.stringify(validated));
    return validated;
  }

  async updateExpert(slug: string, expert: Expert): Promise<Expert> {
    const validated = parseExpert(expert, "content-store-write");
    if (!(await this.getExpert(slug))) {
      throw new NotFoundError(`Expert with slug ${slug} not found`);
    }
    if (validated.slug !== slug && (await this.getExpert(validated.slug))) {
      throw new ConflictError(`Expert with slug ${validated.slug} already exists`);
    }
    this.assertAreaRefs(validated);
    this.db
      .prepare("UPDATE experts SET slug = ?, data = ? WHERE slug = ?")
      .run(validated.slug, JSON.stringify(validated), slug);
    return validated;
  }

  async deleteExpert(slug: string): Promise<void> {
    const result = this.db.prepare("DELETE FROM experts WHERE slug = ?").run(slug);
    if (result.changes === 0) throw new NotFoundError(`Expert with slug ${slug} not found`);
  }

  async listAreas(): Promise<ExpertArea[]> {
    const rows = this.db.prepare("SELECT data FROM expert_areas ORDER BY rowid").all() as {
      data: string;
    }[];
    return rows.map((row) => JSON.parse(row.data) as ExpertArea);
  }

  async getArea(slug: string): Promise<ExpertArea | null> {
    const row = this.db.prepare("SELECT data FROM expert_areas WHERE slug = ?").get(slug) as
      | { data: string }
      | undefined;
    return row ? (JSON.parse(row.data) as ExpertArea) : null;
  }

  async createArea(area: ExpertArea): Promise<ExpertArea> {
    const validated = parseExpertArea(area, "content-store-write");
    if (await this.getArea(validated.slug)) {
      throw new ConflictError(`Area with slug ${validated.slug} already exists`);
    }
    this.db
      .prepare("INSERT INTO expert_areas (slug, data) VALUES (?, ?)")
      .run(validated.slug, JSON.stringify(validated));
    return validated;
  }

  async updateArea(slug: string, area: ExpertArea): Promise<ExpertArea> {
    const validated = parseExpertArea(area, "content-store-write");
    if (!(await this.getArea(slug))) {
      throw new NotFoundError(`Area with slug ${slug} not found`);
    }
    if (validated.slug !== slug) {
      if (await this.getArea(validated.slug)) {
        throw new ConflictError(`Area with slug ${validated.slug} already exists`);
      }
      const referencing = this.expertsReferencingArea(slug);
      if (referencing.length > 0) {
        throw new Error(
          `Expertområdet '${slug}' kan inte byta slug — refereras av: ${referencing.join(", ")}.`,
        );
      }
    }
    this.db
      .prepare("UPDATE expert_areas SET slug = ?, data = ? WHERE slug = ?")
      .run(validated.slug, JSON.stringify(validated), slug);
    return validated;
  }

  async deleteArea(slug: string): Promise<void> {
    if (!(await this.getArea(slug))) {
      throw new NotFoundError(`Area with slug ${slug} not found`);
    }
    const referencing = this.expertsReferencingArea(slug);
    if (referencing.length > 0) {
      throw new Error(
        `Expertområdet '${slug}' kan inte tas bort — refereras av: ${referencing.join(", ")}.`,
      );
    }
    this.db.prepare("DELETE FROM expert_areas WHERE slug = ?").run(slug);
  }
}
