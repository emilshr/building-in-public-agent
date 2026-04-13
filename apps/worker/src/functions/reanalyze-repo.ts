import { db, repo } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { env } from "../env.js";
import { inngest } from "../inngest.js";

type RepoPushEvent = {
  userId: string;
  fullName: string;
};

export const reanalyzeRepoOnPush = inngest.createFunction(
  { id: "reanalyze-repo-on-push" },
  { event: "repo.push" },
  async ({ event }) => {
    const payload = event.data as RepoPushEvent;

    const repoRecord = await db.query.repo.findFirst({
      where: and(
        eq(repo.userId, payload.userId),
        eq(repo.fullName, payload.fullName),
      ),
      columns: { id: true, fullName: true, cloneUrl: true },
    });

    if (!repoRecord) {
      return { ok: false, skipped: true };
    }

    const response = await fetch(`${env.AGENT_URL}/analyze-repo`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        repoId: repoRecord.id,
        fullName: repoRecord.fullName,
        cloneUrl: repoRecord.cloneUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Repo analysis failed with ${response.status}`);
    }

    return { ok: true, repoId: repoRecord.id };
  },
);
