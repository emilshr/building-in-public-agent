import { randomUUID } from "node:crypto";
import { db, githubInstallation, repo } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAppOctokit, getInstallationOctokit } from "@/lib/github";
import { getCurrentUserId } from "@/lib/session";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = new URL(request.url);
  const installationIdParam = url.searchParams.get("installation_id");

  if (!installationIdParam) {
    return NextResponse.redirect(
      new URL("/dashboard/repos?error=missing-installation-id", request.url),
    );
  }

  const installationId = Number.parseInt(installationIdParam, 10);
  if (!Number.isInteger(installationId)) {
    return NextResponse.redirect(
      new URL("/dashboard/repos?error=invalid-installation-id", request.url),
    );
  }

  const appOctokit = getAppOctokit();
  const installationResponse = await appOctokit.request(
    "GET /app/installations/{installation_id}",
    {
      installation_id: installationId,
    },
  );
  const installationOctokit = await getInstallationOctokit(installationId);
  const reposResponse = await installationOctokit.request(
    "GET /installation/repositories",
    {
      per_page: 100,
    },
  );
  const installationAccount = installationResponse.data.account;
  const accountLogin =
    installationAccount && "login" in installationAccount
      ? installationAccount.login
      : installationAccount && "slug" in installationAccount
        ? installationAccount.slug
        : "unknown";

  const installationRecordId = randomUUID();
  const existingInstallation = await db.query.githubInstallation.findFirst({
    where: eq(githubInstallation.installationId, installationId),
    columns: { id: true },
  });

  const githubInstallationId = existingInstallation?.id ?? installationRecordId;
  if (existingInstallation) {
    await db
      .update(githubInstallation)
      .set({
        userId,
        accountLogin,
      })
      .where(eq(githubInstallation.id, existingInstallation.id));
  } else {
    await db.insert(githubInstallation).values({
      id: installationRecordId,
      userId,
      installationId,
      accountLogin,
    });
  }

  await Promise.all(
    reposResponse.data.repositories.map(async (repository) => {
      const existingRepo = await db.query.repo.findFirst({
        where: and(
          eq(repo.userId, userId),
          eq(repo.fullName, repository.full_name),
        ),
        columns: { id: true },
      });

      if (existingRepo) {
        return db
          .update(repo)
          .set({
            userId,
            githubInstallationId,
            defaultBranch: repository.default_branch ?? "main",
            cloneUrl: repository.clone_url,
          })
          .where(eq(repo.id, existingRepo.id));
      }

      return db.insert(repo).values({
        id: randomUUID(),
        userId,
        githubInstallationId,
        fullName: repository.full_name,
        defaultBranch: repository.default_branch ?? "main",
        cloneUrl: repository.clone_url,
      });
    }),
  );

  return NextResponse.redirect(
    new URL("/dashboard/repos?connected=1", request.url),
  );
}
