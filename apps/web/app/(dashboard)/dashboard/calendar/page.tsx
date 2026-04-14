import { content, db } from "@repo/db";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ContentCalendar } from "@/components/content-calendar";
import { getCurrentUserId } from "@/lib/session";

export default async function CalendarPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const items = await db.query.content.findMany({
    where: and(eq(content.userId, userId), eq(content.status, "approved")),
    orderBy: [desc(content.updatedAt)],
    columns: { id: true, body: true, status: true, updatedAt: true },
  });

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
          Publishing
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
          Ready to post
        </h2>
        <p className="mt-2 text-sm text-zinc-300">
          Approved content appears here so you can plan distribution and publish
          without context switching.
        </p>
      </section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <ContentCalendar
          items={items.map((item) => ({
            ...item,
            updatedAt: item.updatedAt?.toISOString() ?? null,
          }))}
        />
      </section>
    </div>
  );
}
