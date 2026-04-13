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
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repositories</h1>
          <p className="text-muted-foreground">
            Install the GitHub App and sync repositories for analysis.
          </p>
        </div>
        <Link href={getInstallUrl()}>
          <Button>Install GitHub App</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected repositories</CardTitle>
          <CardDescription>
            Repositories available for repo analysis and push-triggered updates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectedRepos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No repositories connected yet.
            </p>
          ) : (
            connectedRepos.map((connectedRepo) => (
              <div
                key={connectedRepo.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{connectedRepo.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    Default branch: {connectedRepo.defaultBranch}
                  </p>
                </div>
                <Badge>Connected</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
