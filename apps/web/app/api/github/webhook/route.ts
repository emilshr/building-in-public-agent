import { db, githubInstallation, repo } from "@repo/db";
import { eq } from "drizzle-orm";
import { Inngest } from "inngest";
import { NextResponse } from "next/server";
import { verifyGitHubWebhookSignature } from "@/lib/github";
import { env } from "@/src/env";

const inngest = env.INNGEST_EVENT_KEY
  ? new Inngest({
      id: "building-in-public-agent-web",
      eventKey: env.INNGEST_EVENT_KEY,
    })
  : null;

type GitHubPushPayload = {
  ref: string;
  repository: { full_name: string; default_branch: string };
  installation?: { id: number };
};

type GitHubInstallationPayload = {
  action?: string;
  installation: { id: number };
};

export async function POST(request: Request) {
  const event = request.headers.get("x-github-event");
  const signature = request.headers.get("x-hub-signature-256");
  const body = await request.text();

  if (!verifyGitHubWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event === "installation" || event === "installation_repositories") {
    const payload = JSON.parse(body) as GitHubInstallationPayload;

    if (payload.action === "deleted") {
      const installation = await db.query.githubInstallation.findFirst({
        where: eq(githubInstallation.installationId, payload.installation.id),
        columns: { id: true },
      });

      if (installation) {
        await db
          .delete(repo)
          .where(eq(repo.githubInstallationId, installation.id));
        await db
          .delete(githubInstallation)
          .where(eq(githubInstallation.id, installation.id));
      }
    }

    return NextResponse.json({ ok: true });
  }

  if (event === "push") {
    const payload = JSON.parse(body) as GitHubPushPayload;
    const defaultBranchRef = `refs/heads/${payload.repository.default_branch}`;

    if (payload.ref !== defaultBranchRef || !payload.installation?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const installation = await db.query.githubInstallation.findFirst({
      where: eq(githubInstallation.installationId, payload.installation.id),
      columns: { userId: true },
    });

    if (installation && inngest) {
      await inngest.send({
        name: "repo.push",
        data: {
          userId: installation.userId,
          fullName: payload.repository.full_name,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
