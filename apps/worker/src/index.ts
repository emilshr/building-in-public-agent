import express from "express";
import { serve } from "inngest/express";
import { env } from "./env.js";
import { generateContent } from "./functions/generate-content.js";
import { publishContent } from "./functions/publish-content.js";
import { reanalyzeRepoOnPush } from "./functions/reanalyze-repo.js";
import { setupScheduleOnOnboarding } from "./functions/setup-schedule.js";
import { inngest } from "./inngest.js";

const app = express();

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Inngest endpoint — functions will be registered here as they're built
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [
      reanalyzeRepoOnPush,
      setupScheduleOnOnboarding,
      generateContent,
      publishContent,
    ],
  }),
);

app.listen(env.PORT, () => {
  console.log(`Worker listening on port ${env.PORT}`);
});
