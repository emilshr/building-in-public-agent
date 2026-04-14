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
    <div className="max-w-4xl space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
          Content inspection
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Content detail
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {record.type} · {record.status}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {record.body.length}/280 characters
        </p>
        {isPostable ? (
          isOverXLimit ? (
            <p className="mt-3 text-xs text-red-300">
              Trim this draft to 280 characters before posting on X.
            </p>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                className:
                  "mt-3 w-fit bg-zinc-100 text-zinc-950 hover:bg-zinc-200 border border-zinc-100",
              })}
              href={composerUrl}
              target="_blank"
            >
              Post on X
            </Link>
          )
        ) : null}
      </section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 text-sm text-zinc-100">
          {record.body}
        </pre>
      </section>
    </div>
  );
}
