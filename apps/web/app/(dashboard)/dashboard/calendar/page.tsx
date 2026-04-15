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
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Ready to post
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Approved content appears here so you can plan distribution and publish
          without context-switching.
        </p>
      </section>

      <section>
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
