import { readFile } from "node:fs/promises";
import path from "node:path";

const CANDIDATE_FILES = [
  "README.md",
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
];

const SECRET_PATTERNS = [/api[_-]?key/i, /token/i, /secret/i, /password/i];

function hasSecretPattern(content: string) {
  return SECRET_PATTERNS.some((pattern) => pattern.test(content));
}

export async function readProjectFiles(rootDir: string) {
  const files: Record<string, string> = {};

  await Promise.all(
    CANDIDATE_FILES.map(async (filePath) => {
      try {
        const absolutePath = path.join(rootDir, filePath);
        const content = await readFile(absolutePath, "utf8");
        if (hasSecretPattern(content)) return;
        files[filePath] = content.slice(0, 6000);
      } catch {
        // Optional files are expected to be missing often.
      }
    }),
  );

  return files;
}
