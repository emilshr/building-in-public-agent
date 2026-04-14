import { db, githubInstallation, repo } from "@repo/db";
import { and, desc, eq } from "drizzle-orm";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstallUrl } from "@/lib/github";
import { getCurrentUserId } from "@/lib/session";

const editorialDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-editorial-display",
  weight: ["600", "700"],
});

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
  const appStatus = hasInstallation ? "Installed" : "Not installed";
  const reposLabel =
    connectedRepos.length === 1
      ? "1 repository connected"
      : `${connectedRepos.length} repositories connected`;

  return (
    <main className="min-h-screen bg-[#0a0d14] text-zinc-100">
      <div className="mx-auto max-w-6xl p-6 md:p-10">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-7 shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:p-10">
          <div className="pointer-events-none absolute -left-8 top-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="relative flex flex-col gap-7">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Repository Control Center
                </p>
                <h1
                  className={`${editorialDisplay.className} text-4xl leading-tight text-zinc-50 md:text-5xl`}
                >
                  Your installation dashboard
                </h1>
                <p className="max-w-2xl text-sm text-zinc-300 md:text-base">
                  Connect the GitHub App, track which repositories are
                  installed, and keep your source of truth in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href={getInstallUrl()}>
                  <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
                    Install GitHub App
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-900"
                  >
                    Open content dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {feedback ? (
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  feedback.tone === "success"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                    : "border-rose-400/30 bg-rose-400/10 text-rose-100"
                }`}
              >
                <p className="font-semibold">{feedback.title}</p>
                <p className="mt-1 opacity-90">{feedback.description}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-zinc-800/80 bg-zinc-900/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">
                    App status
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-zinc-50">
                    {appStatus}
                  </p>
                  <Badge
                    className={
                      hasInstallation
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-zinc-700/60 text-zinc-200"
                    }
                  >
                    {hasInstallation ? "Active" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-zinc-800/80 bg-zinc-900/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">
                    Repository coverage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-zinc-50">
                    {reposLabel}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Installed repositories sync to this dashboard after
                    callback.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-zinc-800/80 bg-zinc-900/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300">
                    Installation owner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-zinc-50">
                    {installation?.accountLogin ?? "Not connected"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Shows the account linked to your latest app installation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <Card className="border-zinc-800/90 bg-zinc-950/65">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-zinc-100">
                Installed repositories
                <Badge className="bg-zinc-800 text-zinc-200">
                  {connectedRepos.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectedRepos.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-700/90 bg-zinc-900/40 p-6">
                  <p className="text-sm font-medium text-zinc-100">
                    No repositories installed yet.
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Install the GitHub App, choose repositories, and return here
                    to see installation status.
                  </p>
                </div>
              ) : (
                connectedRepos.map((connectedRepo) => (
                  <div
                    key={connectedRepo.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/90 bg-zinc-900/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-zinc-100">
                        {connectedRepo.fullName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Default branch: {connectedRepo.defaultBranch}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-200">
                      Installed
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
