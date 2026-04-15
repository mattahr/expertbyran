import fs from "node:fs/promises";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || "/app/data";
const SEED_DIR = "/app/seed";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyFile(src: string, dest: string) {
  const destDir = path.dirname(dest);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(src, dest);
}

async function copyDir(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

export default async function seedData() {
  const siteDataPath = path.join(DATA_DIR, "site-data.json");
  const blogDataPath = path.join(DATA_DIR, "blog-data.json");

  // Check if already initialized
  if (await fileExists(siteDataPath)) {
    console.log("[seed] Data directory already initialized, skipping seed");
    return;
  }

  console.log(`[seed] Initializing data directory from ${SEED_DIR}`);

  // Create data directory
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(path.join(DATA_DIR, "blog", "posts"), { recursive: true });

  // Copy site-data.json
  const seedSiteData = path.join(SEED_DIR, "site-data.json");
  if (await fileExists(seedSiteData)) {
    await copyFile(seedSiteData, siteDataPath);
    console.log("[seed] Copied site-data.json");
  }

  // Copy blog-data.json
  const seedBlogData = path.join(SEED_DIR, "blog-data.json");
  if (await fileExists(seedBlogData)) {
    await copyFile(seedBlogData, blogDataPath);
    console.log("[seed] Copied blog-data.json");
  }

  // Copy blog posts
  const seedBlogPosts = path.join(SEED_DIR, "blog", "posts");
  if (await fileExists(seedBlogPosts)) {
    await copyDir(seedBlogPosts, path.join(DATA_DIR, "blog", "posts"));
    console.log("[seed] Copied blog posts");
  }

  console.log("[seed] Data directory initialized successfully");
}
