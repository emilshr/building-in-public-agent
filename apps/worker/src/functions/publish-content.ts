import { randomUUID } from "node:crypto";
import {
  content,
  db,
  decryptApiKey,
  notification,
  twitterConnection,
} from "@repo/db";
import { and, eq } from "drizzle-orm";
import { inngest } from "../inngest.js";
import { postTweet } from "../lib/twitter-client.js";

export const publishContent = inngest.createFunction(
  { id: "publish-content" },
  { event: "content.publish" },
  async ({ event, step }) => {
    const userId = event.data.userId as string;
    const contentId = event.data.contentId as string;
    const contentRecord = await db.query.content.findFirst({
      where: and(
        eq(content.id, contentId),
        eq(content.userId, userId),
        eq(content.status, "scheduled"),
      ),
    });
    if (!contentRecord) return { ok: false, skipped: true };

    const connection = await db.query.twitterConnection.findFirst({
      where: eq(twitterConnection.userId, userId),
    });
    if (!connection) {
      await db
        .update(content)
        .set({ status: "failed", errorMessage: "No Twitter connection" })
        .where(eq(content.id, contentId));
      return { ok: false };
    }

    try {
      const accessToken = decryptApiKey(
        connection.encryptedAccessToken,
        userId,
      );
      const twitterPostId = await postTweet({
        accessToken,
        text: contentRecord.body.slice(0, 280),
      });
      await db
        .update(content)
        .set({
          status: "posted",
          postedAt: new Date(),
          twitterPostId: twitterPostId ?? null,
          errorMessage: null,
        })
        .where(eq(content.id, contentRecord.id));
      return { ok: true };
    } catch (error) {
      await db
        .update(content)
        .set({ status: "failed", errorMessage: (error as Error).message })
        .where(eq(content.id, contentRecord.id));
      await db.insert(notification).values({
        id: randomUUID(),
        userId,
        type: "twitter_publish_failed",
        title: "Twitter publish failed",
        body: "A scheduled post could not be published. Please reconnect Twitter.",
      });
      await step.sleep("retry-backoff", "30s");
      throw error;
    }
  },
);
