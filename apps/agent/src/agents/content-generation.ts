import { z } from "zod";
import { generateContentWorkflow } from "../workflows/generate-content.js";

const contentGenerationInput = z.object({
  userId: z.string().min(1),
  repoId: z.string().min(1),
  productSummary: z.string().min(1),
  tone: z.string().min(1),
  contentTypes: z.array(z.string()).min(1),
});

export async function runContentGenerationAgent(input: unknown) {
  const parsed = contentGenerationInput.parse(input);
  const result = await generateContentWorkflow(parsed);
  return {
    ok: true,
    userId: parsed.userId,
    repoId: parsed.repoId,
    items: result.items,
  };
}
