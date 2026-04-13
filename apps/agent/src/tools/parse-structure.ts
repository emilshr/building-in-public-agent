import { readdir } from "node:fs/promises";
import path from "node:path";

const SKIP_DIRS = new Set([".git", "node_modules", ".next", "dist", "build"]);

export async function parseStructure(rootDir: string, maxEntries = 400) {
  const entries: string[] = [];

  async function walk(currentDir: string) {
    if (entries.length >= maxEntries) return;

    const dirents = await readdir(currentDir, { withFileTypes: true });
    for (const dirent of dirents) {
      if (entries.length >= maxEntries) return;
      if (dirent.name.startsWith(".env")) continue;

      const absolute = path.join(currentDir, dirent.name);
      const relative = path.relative(rootDir, absolute);
      entries.push(relative);

      if (dirent.isDirectory() && !SKIP_DIRS.has(dirent.name)) {
        await walk(absolute);
      }
    }
  }

  await walk(rootDir);
  return entries;
}
