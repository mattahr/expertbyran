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

  // Områden refereras även av innehåll (bloggens junction-tabell och
  // foresights areaSlugs) — radering/slug-byte får inte lämna dinglande
  // referenser. Radar-blips areaSlugs guardas inte: de degraderar ofarligt
  // (matchningen i related-poolen sker slug-mot-slug).
  private contentReferencingArea(areaSlug: string): string[] {
    const posts = this.db
      .prepare("SELECT post_slug FROM blog_post_areas WHERE area_slug = ?")
      .all(areaSlug) as { post_slug: string }[];
    const foresights = this.db
      .prepare(
        "SELECT slug FROM foresights WHERE EXISTS (SELECT 1 FROM json_each(foresights.area_slugs) WHERE json_each.value = ?)",
      )
      .all(areaSlug) as { slug: string }[];
    return [
      ...posts.map((row) => `blogg:${row.post_slug}`),
      ...foresights.map((row) => `foresight:${row.slug}`),
    ];
  }

  private assertAreaUnreferenced(slug: string, action: string): void {
    const referencing = [
      ...this.expertsReferencingArea(slug),
      ...this.contentReferencingArea(slug),
    ];
    if (referencing.length > 0) {
      throw new Error(
        `Expertområdet '${slug}' kan inte ${action} — refereras av: ${referencing.join(", ")}.`,
      );
    }
  }

  // Gamla helfilsvalideringen garanterade unika id:n utöver slugs; här
  // kontrolleras det explicit per mutation.
  private assertUniqueId(table: "experts" | "expert_areas", id: string, excludeSlug?: string): void {
    const row = excludeSlug
      ? this.db
          .prepare(`SELECT slug FROM ${table} WHERE json_extract(data, '$.id') = ? AND slug <> ?`)
          .get(id, excludeSlug)
      : this.db.prepare(`SELECT slug FROM ${table} WHERE json_extract(data, '$.id') = ?`).get(id);
    if (row) {
      throw new ConflictError(
        `${table === "experts" ? "Expert" : "Area"} with id ${id} already exists`,
      );
    }
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
    this.assertUniqueId("experts", validated.id);
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
    this.assertUniqueId("experts", validated.id, slug);
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
    this.assertUniqueId("expert_areas", validated.id);
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
      this.assertAreaUnreferenced(slug, "byta slug");
    }
    this.assertUniqueId("expert_areas", validated.id, slug);
    this.db
      .prepare("UPDATE expert_areas SET slug = ?, data = ? WHERE slug = ?")
      .run(validated.slug, JSON.stringify(validated), slug);
    return validated;
  }

  async deleteArea(slug: string): Promise<void> {
    if (!(await this.getArea(slug))) {
      throw new NotFoundError(`Area with slug ${slug} not found`);
    }
    this.assertAreaUnreferenced(slug, "tas bort");
    this.db.prepare("DELETE FROM expert_areas WHERE slug = ?").run(slug);
  }
}
