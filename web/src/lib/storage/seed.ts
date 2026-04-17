import fs from "node:fs/promises";
import path from "node:path";

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

function resolveSeedDir() {
  const configuredDir = process.env.SEED_DIR?.trim();

  if (configuredDir) {
    return path.resolve(configuredDir);
  }

  if (process.env.NODE_ENV === "production") {
    return "/app/seed";
  }

  return process.cwd();
}

const DATA_DIR = resolveDataDir();
const SEED_DIR = resolveSeedDir();

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
  const blogPostsDir = path.join(DATA_DIR, "blog", "posts");

  const hasSiteData = await fileExists(siteDataPath);
  const hasBlogData = await fileExists(blogDataPath);

  if (hasSiteData && hasBlogData) {
    console.log("[seed] Data directory already initialized, skipping seed");
    return;
  }

  console.log(`[seed] Seeding missing data from ${SEED_DIR}`);

  // Ensure directories exist
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(blogPostsDir, { recursive: true });

  // Copy site-data.json if missing
  if (!hasSiteData) {
    const seedSiteData = path.join(SEED_DIR, "site-data.json");
    if (await fileExists(seedSiteData)) {
      await copyFile(seedSiteData, siteDataPath);
      console.log("[seed] Copied site-data.json");
    }
  }

  // Copy blog-data.json if missing
  if (!hasBlogData) {
    const seedBlogData = path.join(SEED_DIR, "blog-data.json");
    if (await fileExists(seedBlogData)) {
      await copyFile(seedBlogData, blogDataPath);
      console.log("[seed] Copied blog-data.json");
    }
  }

  // Copy blog posts (always sync — cheap if already present)
  const seedBlogPosts = path.join(SEED_DIR, "blog", "posts");
  if (await fileExists(seedBlogPosts)) {
    await copyDir(seedBlogPosts, blogPostsDir);
    console.log("[seed] Synced blog posts");
  }

  console.log("[seed] Data directory initialized successfully");
}
