import { db, repo } from "@repo/db";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInstallUrl } from "@/lib/github";
import { getCurrentUserId } from "@/lib/session";

export default async function ReposPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const connectedRepos = await db.query.repo.findMany({
    where: eq(repo.userId, userId),
    orderBy: [desc(repo.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
            Source management
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
            Repositories
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            Install the GitHub App and sync repositories for analysis.
          </p>
        </div>
        <Link href={getInstallUrl()}>
          <Button className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200">
            Install GitHub App
          </Button>
        </Link>
      </div>

      <Card className="border-zinc-800 bg-zinc-950/70">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            Connected repositories
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Repositories available for repo analysis and push-triggered updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedRepos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-4 text-sm text-zinc-400">
              No repositories connected yet.
            </p>
          ) : (
            connectedRepos.map((connectedRepo) => (
              <div
                key={connectedRepo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4"
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
                  Connected
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
