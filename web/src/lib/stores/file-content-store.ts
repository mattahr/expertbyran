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
