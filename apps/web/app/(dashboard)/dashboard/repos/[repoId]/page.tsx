import { db, repo } from "@repo/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getCurrentUserId } from "@/lib/session";

export default async function RepoDetailPage({
  params,
}: {
  params: { repoId: string };
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const repoRecord = await db.query.repo.findFirst({
    where: eq(repo.id, params.repoId),
  });

  if (!repoRecord || repoRecord.userId !== userId) {
    redirect("/dashboard/repos");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {repoRecord.fullName}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Repository dashboard
          </p>
        </div>
        <Badge variant="secondary">{repoRecord.defaultBranch}</Badge>
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm text-muted-foreground">
          Repository onboarding is complete. You can now generate content from
          this repository in the main dashboard.
        </p>
      </div>
    </div>
  );
}
