import express from "express";
import { serve } from "inngest/express";
import { env } from "./env.js";
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
  serve({ client: inngest, functions: [] }),
);

app.listen(env.PORT, () => {
  console.log(`Worker listening on port ${env.PORT}`);
});
