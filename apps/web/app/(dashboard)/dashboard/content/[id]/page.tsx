import { content, db } from "@repo/db";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Content detail
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{record.type}</Badge>
          <Badge variant="outline">{record.status}</Badge>
          <span className="text-xs text-muted-foreground">
            {record.body.length}/280 characters
          </span>
        </div>

        {isPostable ? (
          isOverXLimit ? (
            <p className="mt-3 text-sm text-destructive">
              Trim to 280 characters before posting on X.
            </p>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "mt-3 w-fit",
              })}
              href={composerUrl}
              target="_blank"
            >
              Post on X
            </Link>
          )
        ) : null}
      </section>

      <section className="rounded-xl border border-border bg-muted/30 p-5">
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed">
          {record.body}
        </pre>
      </section>
    </div>
  );
}
