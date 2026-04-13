import { content, db } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
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

  return (
    <div className="mx-auto max-w-3xl space-y-3 p-8">
      <h1 className="text-xl font-semibold">Content detail</h1>
      <p className="text-sm text-muted-foreground">
        {record.type} · {record.status}
      </p>
      <pre className="rounded border p-4 whitespace-pre-wrap">
        {record.body}
      </pre>
    </div>
  );
}
