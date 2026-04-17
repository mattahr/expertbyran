import fs from "node:fs/promises";
import path from "node:path";
import { parseSiteData, type SiteData } from "@/lib/content/schema";
import { parseBlogCatalog, type BlogCatalog } from "@/lib/blog/schema";

function resolveDataDir() {
  const configuredDir = process.env.DATA_DIR?.trim();

  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  if (process.env.NODE_ENV === "production") {
    return "/app/data";
  }

  return path.resolve(process.cwd(), "data");
}

const DATA_DIR = resolveDataDir();
const SITE_DATA_FILE = "site-data.json";
const BLOG_DATA_FILE = "blog-data.json";
const BLOG_POSTS_DIR = "blog/posts";

export type StorageType = "site-data" | "blog-data";

function log(level: "info" | "warn" | "error", message: string, metadata?: unknown) {
  if (metadata) {
    console[level](`[disk-storage] ${message}`, metadata);
    return;
  }

  console[level](`[disk-storage] ${message}`);
}

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

async function atomicWrite(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const tmpPath = `${filePath}.tmp.${Date.now()}`;

  try {
    await fs.writeFile(tmpPath, content, "utf-8");
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    try {
      await fs.unlink(tmpPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}

export async function readSiteDataFromDisk(): Promise<SiteData> {
  const filePath = path.join(DATA_DIR, SITE_DATA_FILE);
  const content = await fs.readFile(filePath, "utf-8");
  const raw = JSON.parse(content);
  return parseSiteData(raw, filePath);
}

export async function writeSiteDataToDisk(data: SiteData): Promise<void> {
  const filePath = path.join(DATA_DIR, SITE_DATA_FILE);
  const validated = parseSiteData(data, "api-write");
  const content = JSON.stringify(validated, null, 2);
  await atomicWrite(filePath, content);
  log("info", `site-data.json written to ${filePath}`);
}

export async function readBlogDataFromDisk(): Promise<BlogCatalog> {
  const filePath = path.join(DATA_DIR, BLOG_DATA_FILE);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const raw = JSON.parse(content);
    return parseBlogCatalog(raw, filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      log("warn", `blog-data.json not found at ${filePath}, returning empty catalog`);
      return { posts: [] };
    }
    throw error;
  }
}

export async function writeBlogDataToDisk(data: BlogCatalog): Promise<void> {
  const filePath = path.join(DATA_DIR, BLOG_DATA_FILE);
  const validated = parseBlogCatalog(data, "api-write");
  const content = JSON.stringify(validated, null, 2);
  await atomicWrite(filePath, content);
  log("info", `blog-data.json written to ${filePath}`);
}

export async function readBlogPostMarkdownFromDisk(slug: string): Promise<string> {
  const filePath = path.join(DATA_DIR, BLOG_POSTS_DIR, `${slug}.md`);

  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new Error(`Blog post ${slug} not found`);
    }
    throw error;
  }
}

export async function writeBlogPostMarkdownToDisk(slug: string, markdown: string): Promise<void> {
  const filePath = path.join(DATA_DIR, BLOG_POSTS_DIR, `${slug}.md`);
  await atomicWrite(filePath, markdown);
  log("info", `Blog post ${slug}.md written to ${filePath}`);
}

export async function deleteBlogPostMarkdownFromDisk(slug: string): Promise<void> {
  const filePath = path.join(DATA_DIR, BLOG_POSTS_DIR, `${slug}.md`);

  try {
    await fs.unlink(filePath);
    log("info", `Blog post ${slug}.md deleted from ${filePath}`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      log("warn", `Blog post ${slug}.md not found at ${filePath}, ignoring delete`);
      return;
    }
    throw error;
  }
}

export async function listBlogPostSlugsFromDisk(): Promise<string[]> {
  const dirPath = path.join(DATA_DIR, BLOG_POSTS_DIR);

  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}
