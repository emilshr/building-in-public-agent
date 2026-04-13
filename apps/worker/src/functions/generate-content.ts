import { randomUUID } from "node:crypto";
import {
  apiKey,
  content,
  db,
  notification,
  repo,
  userPreferences,
} from "@repo/db";
import { and, desc, eq } from "drizzle-orm";
import { env } from "../env.js";
import { inngest } from "../inngest.js";

export const generateContent = inngest.createFunction(
  { id: "generate-content" },
  { event: "content.generate" },
  async ({ event }) => {
    const userId = event.data.userId as string;
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    });
    const repoRecord = await db.query.repo.findFirst({
      where: eq(repo.userId, userId),
      orderBy: [desc(repo.lastAnalyzedAt)],
    });
    if (!preferences || !repoRecord?.productSummary) {
      return { ok: false, skipped: true };
    }

    const userApiKey = await db.query.apiKey.findFirst({
      where: and(eq(apiKey.userId, userId), eq(apiKey.isValid, true)),
      columns: { provider: true },
    });
    if (!userApiKey) {
      await db.insert(notification).values({
        id: randomUUID(),
        userId,
        type: "byok_missing",
        title: "BYOK key missing",
        body: "Add a valid API key to continue generation.",
      });
      return { ok: false, skipped: true };
    }

    const response = await fetch(`${env.AGENT_URL}/generate-content`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId,
        repoId: repoRecord.id,
        productSummary: repoRecord.productSummary,
        contentTypes: preferences.contentTypes
          ? JSON.parse(preferences.contentTypes)
          : ["tweet"],
        tone: preferences.tone ?? repoRecord.inferredTone ?? "casual",
      }),
    });
    if (!response.ok) {
      throw new Error("Agent content generation failed");
    }
    const result = (await response.json()) as {
      items: Array<{
        type: string;
        body: string;
        suggestedScheduledTime?: string;
      }>;
    };

    for (const item of result.items) {
      await db.insert(content).values({
        id: randomUUID(),
        userId,
        repoId: repoRecord.id,
        type: item.type,
        body: item.body,
        status: "draft",
        summaryVersion: repoRecord.summaryVersion,
        idempotencyKey: `${userId}-${new Date().toISOString().slice(0, 10)}-${item.type}`,
        scheduledFor: item.suggestedScheduledTime
          ? new Date(item.suggestedScheduledTime)
          : null,
      });
    }
    return { ok: true, generated: result.items.length };
  },
);
