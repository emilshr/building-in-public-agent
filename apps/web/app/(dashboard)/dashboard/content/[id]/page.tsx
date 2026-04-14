import { content, db } from "@repo/db";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/session";

export default async function ContentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const record = await db.query.content.findFirst({
    where: and(eq(content.id, params.id), eq(content.userId, userId)),
  });
  if (!record) notFound();
  const isPostable = record.status === "draft" || record.status === "approved";
  const isOverXLimit = record.body.length > 280;
  const composerUrl = `https://x.com/intent/post?text=${encodeURIComponent(record.body)}`;

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-8">
      <h1 className="text-xl font-semibold">Content detail</h1>
      <p className="text-sm text-muted-foreground">
        {record.type} · {record.status}
      </p>
      <p className="text-xs text-muted-foreground">
        {record.body.length}/280 characters
      </p>
      {isPostable ? (
        isOverXLimit ? (
          <p className="text-xs text-destructive">
            Trim this draft to 280 characters before posting on X.
          </p>
        ) : (
          <Link
            className={buttonVariants({ size: "sm", className: "w-fit" })}
            href={composerUrl}
            target="_blank"
          >
            Post on X
          </Link>
        )
      ) : null}
      <pre className="rounded border p-4 whitespace-pre-wrap">
        {record.body}
      </pre>
    </div>
  );
}
