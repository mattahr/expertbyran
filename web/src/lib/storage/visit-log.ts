import fs from "node:fs/promises";
import path from "node:path";

export interface VisitEntry {
  timestamp: string;
  path: string;
  method: string;
  userAgent: string;
  ip: string;
  referer: string;
  lang: string;
}

function resolveDataDir() {
  const configuredDir = process.env.DATA_DIR?.trim();
  if (configuredDir) return path.resolve(configuredDir);
  if (process.env.NODE_ENV === "production") return "/app/data";
  return path.resolve(process.cwd(), "data");
}

const VISITS_DIR = path.join(resolveDataDir(), "visits");

function todayFile(): string {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(VISITS_DIR, `visits-${date}.jsonl`);
}

async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

export async function appendVisit(entry: VisitEntry): Promise<void> {
  await ensureDir(VISITS_DIR);
  const line = JSON.stringify(entry) + "\n";
  await fs.appendFile(todayFile(), line, "utf-8");
}

function parseJsonl(content: string): VisitEntry[] {
  const entries: VisitEntry[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed));
    } catch {
      // Hoppa över korrupta rader
    }
  }
  return entries;
}

export async function readAllVisits(days?: number): Promise<VisitEntry[]> {
  try {
    await ensureDir(VISITS_DIR);
    const files = await fs.readdir(VISITS_DIR);
    const logFiles = files
      .filter((f) => f.startsWith("visits-") && f.endsWith(".jsonl"))
      .sort()
      .reverse();

    const filesToRead = days ? logFiles.slice(0, days) : logFiles;
    const allEntries: VisitEntry[] = [];

    for (const file of filesToRead) {
      try {
        const content = await fs.readFile(path.join(VISITS_DIR, file), "utf-8");
        allEntries.push(...parseJsonl(content));
      } catch {
        // Ignorera oläsbara filer
      }
    }

    return allEntries;
  } catch {
    return [];
  }
}
