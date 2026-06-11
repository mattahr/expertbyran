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

async function copyFileIfMissing(src: string, dest: string): Promise<boolean> {
  if (!(await fileExists(src))) return false;
  if (await fileExists(dest)) return false;
  await copyFile(src, dest);
  return true;
}

// Synkar en seed-katalog men skriver aldrig över filer som redan finns
// (t.ex. innehåll som skapats eller redigerats via API:et).
async function syncDirMissingOnly(src: string, dest: string) {
  if (!(await fileExists(src))) return;

  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await syncDirMissingOnly(srcPath, destPath);
    } else {
      await copyFileIfMissing(srcPath, destPath);
    }
  }
}

// Spårade seed-katalogfiler på repo-roten.
const SEED_CATALOG_FILES = [
  "site-data.json",
  "blog-data.json",
  "foresight-data.json",
  "radar-data.json",
];

// Innehållskataloger med markdown/json per slug.
const SEED_CONTENT_DIRS = [["blog", "posts"], ["foresight"], ["radar"]];

export default async function seedData() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const seeded: string[] = [];

  for (const file of SEED_CATALOG_FILES) {
    const copied = await copyFileIfMissing(
      path.join(SEED_DIR, file),
      path.join(DATA_DIR, file),
    );
    if (copied) seeded.push(file);
  }

  for (const segments of SEED_CONTENT_DIRS) {
    await syncDirMissingOnly(
      path.join(SEED_DIR, ...segments),
      path.join(DATA_DIR, ...segments),
    );
  }

  if (seeded.length > 0) {
    console.log(`[seed] Seeded from ${SEED_DIR}: ${seeded.join(", ")}`);
  } else {
    console.log("[seed] Data directory already initialized, skipping seed");
  }
}
