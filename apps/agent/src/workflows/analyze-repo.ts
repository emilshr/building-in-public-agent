import { rm } from "node:fs/promises";
import { db, repo } from "@repo/db";
import { eq } from "drizzle-orm";
import { cloneRepo } from "../tools/clone-repo";
import { parseStructure } from "../tools/parse-structure";
import { readProjectFiles } from "../tools/read-files";

export type AnalyzeRepoInput = {
  repoId: string;
  fullName: string;
  cloneUrl: string;
};

function inferTone(readme = "") {
  const lower = readme.toLowerCase();
  if (lower.includes("lol") || lower.includes("fun")) return "casual";
  if (lower.includes("architecture") || lower.includes("infrastructure")) {
    return "technical";
  }
  return "professional";
}

export async function analyzeRepoWorkflow(input: AnalyzeRepoInput) {
  const { path } = await cloneRepo(input.fullName, input.cloneUrl);

  try {
    const structure = await parseStructure(path);
    const files = await readProjectFiles(path);

    const summary = {
      fullName: input.fullName,
      inferredStack: Object.keys(files).filter((file) =>
        ["package.json", "pyproject.toml", "Cargo.toml", "go.mod"].includes(
          file,
        ),
      ),
      keyFiles: Object.keys(files),
      topLevelStructure: structure.slice(0, 80),
      overview: files["README.md"]?.slice(0, 1200) ?? "No README found.",
    };

    await db
      .update(repo)
      .set({
        productSummary: JSON.stringify(summary),
        inferredTone: inferTone(files["README.md"]),
        summaryVersion: 1,
        lastAnalyzedAt: new Date(),
      })
      .where(eq(repo.id, input.repoId));
  } finally {
    await rm(path, { recursive: true, force: true });
  }
}
