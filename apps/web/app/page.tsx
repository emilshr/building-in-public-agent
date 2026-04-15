import { db, githubInstallation, repo } from "@repo/db";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInstallUrl } from "@/lib/github";
import { getCurrentUserId } from "@/lib/session";

type HomeProps = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

function getInstallFeedback(params: { connected?: string; error?: string }) {
  if (params.connected === "1") {
    return {
      tone: "success" as const,
      title: "GitHub App connected",
      description:
        "Your repositories were synced. Installed repositories are now tracked in this dashboard.",
    };
  }

  if (params.error) {
    return {
      tone: "error" as const,
      title: "Installation failed",
      description: decodeURIComponent(params.error),
    };
  }

  return null;
}

export default async function Home({ searchParams }: HomeProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const feedback = getInstallFeedback(params);

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

  const hasInstallation = Boolean(installation);
  const reposLabel =
    connectedRepos.length === 1
      ? "1 repository"
      : `${connectedRepos.length} repositories`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
        {/* Header */}
        <section className="mb-12">
          <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
            Your workspace
          </h1>
          <p className="mt-3 max-w-xl text-base text-muted-foreground leading-relaxed">
            Connect the GitHub App, sync your repositories, then head to the
            content dashboard to start generating.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={getInstallUrl()}>
              <Button>Install GitHub App</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Open content dashboard</Button>
            </Link>
          </div>
        </section>

        {/* Feedback banner */}
        {feedback ? (
          <div
            className={`mb-8 rounded-lg border px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border-primary/20 bg-primary/5 text-foreground"
                : "border-destructive/20 bg-destructive/5 text-foreground"
            }`}
          >
            <p className="font-semibold">{feedback.title}</p>
            <p className="mt-0.5 text-muted-foreground">
              {feedback.description}
            </p>
          </div>
        ) : null}

        {/* Status row */}
        <section className="mb-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
          <div className="bg-card px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              App status
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-heading text-lg font-bold">
                {hasInstallation ? "Installed" : "Not installed"}
              </p>
              <Badge variant={hasInstallation ? "default" : "secondary"}>
                {hasInstallation ? "Active" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="bg-card px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Repositories
            </p>
            <p className="mt-1 font-heading text-lg font-bold">{reposLabel}</p>
          </div>

          <div className="bg-card px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Owner
            </p>
            <p className="mt-1 font-heading text-lg font-bold">
              {installation?.accountLogin ?? "Not connected"}
            </p>
          </div>
        </section>

        {/* Repo list */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              Installed repositories
            </h2>
            <span className="text-sm text-muted-foreground">
              {connectedRepos.length}
            </span>
          </div>

          {connectedRepos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No repositories installed yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Install the GitHub App, choose repositories, and return here to
                see them.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-xl border border-border">
              {connectedRepos.map((connectedRepo) => (
                <div
                  key={connectedRepo.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {connectedRepo.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {connectedRepo.defaultBranch}
                    </p>
                  </div>
                  <Badge variant="secondary">Installed</Badge>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
