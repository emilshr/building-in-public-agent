import "dotenv/config";
import { Mastra } from "@mastra/core";
import express from "express";
import { runContentGenerationAgent } from "./agents/content-generation";
import { runRepoAnalysisAgent } from "./agents/repo-analysis";
import { env } from "./env";

const mastra = new Mastra({
  agents: {},
});

export { mastra };

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/analyze-repo", async (req, res) => {
  try {
    const result = await runRepoAnalysisAgent(req.body);
    res.json(result);
  } catch (error) {
    console.error("Repo analysis failed", error);
    res.status(500).json({ ok: false, error: "Failed to analyze repository" });
  }
});

app.post("/generate-content", async (req, res) => {
  try {
    const result = await runContentGenerationAgent(req.body);
    res.json(result);
  } catch (error) {
    console.error("Content generation failed", error);
    res.status(500).json({ ok: false, error: "Failed to generate content" });
  }
});

app.listen(env.PORT, () => {
  console.log(`Mastra agent service initialized on ${env.PORT}`);
});
