import { z } from "zod";
import { analyzeRepoWorkflow } from "../workflows/analyze-repo.js";

export const repoAnalysisInputSchema = z.object({
  repoId: z.string().min(1),
  fullName: z.string().min(1),
  cloneUrl: z.string().url(),
});

export async function runRepoAnalysisAgent(input: unknown) {
  const parsed = repoAnalysisInputSchema.parse(input);
  await analyzeRepoWorkflow(parsed);
  return {
    ok: true,
    repoId: parsed.repoId,
  };
}
