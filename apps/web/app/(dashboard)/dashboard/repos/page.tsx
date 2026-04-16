import {
  db,
  githubInstallation,
  repo,
  repoOnboardingPreferences,
} from "@repo/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInstallationSettingsUrl, getInstallUrl } from "@/lib/github";
import { getRepoDestination } from "@/lib/repo-onboarding";
import { getCurrentUserId } from "@/lib/session";

export default async function ReposPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const [installation, connectedRepos] = await Promise.all([
    db.query.githubInstallation.findFirst({
      where: and(eq(githubInstallation.userId, userId)),
      orderBy: [desc(githubInstallation.createdAt)],
    }),
    db.query.repo.findMany({
      where: eq(repo.userId, userId),
      orderBy: [desc(repo.createdAt)],
    }),
  ]);

  const onboardingStates =
    connectedRepos.length > 0
      ? await db.query.repoOnboardingPreferences.findMany({
          where: inArray(
            repoOnboardingPreferences.repoId,
            connectedRepos.map((connectedRepo) => connectedRepo.id),
          ),
          columns: {
            repoId: true,
            onboardingComplete: true,
            ownerUserId: true,
          },
        })
      : [];
  const onboardingByRepoId = new Map(
    onboardingStates.map((state) => [state.repoId, state]),
  );

  const appHref = installation
    ? getInstallationSettingsUrl(installation.installationId)
    : getInstallUrl();

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Repositories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Install the GitHub App and sync repositories for content generation.
          </p>
        </div>
        <Link href={appHref} target="_blank" rel="noopener noreferrer">
          <Button>
            {installation ? "Manage GitHub App" : "Install GitHub App"}
          </Button>
        </Link>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Connected repositories
          </h3>
          <span className="text-sm text-muted-foreground">
            {connectedRepos.length}
          </span>
        </div>

        {connectedRepos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No repositories connected yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Install the GitHub App to start syncing repositories.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {connectedRepos.map((connectedRepo) => (
              <Link
                key={connectedRepo.id}
                href={getRepoDestination({
                  repoRecord: connectedRepo,
                  onboardingState: onboardingByRepoId.get(connectedRepo.id),
                  currentUserId: userId,
                })}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="text-sm font-medium">
                    {connectedRepo.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {connectedRepo.defaultBranch}
                  </p>
                </div>
                <Badge variant="secondary">
                  {onboardingByRepoId.get(connectedRepo.id)?.onboardingComplete
                    ? "Ready"
                    : "Onboarding required"}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
