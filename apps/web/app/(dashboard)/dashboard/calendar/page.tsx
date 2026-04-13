import { content, db } from "@repo/db";
import { and, desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ContentCalendar } from "@/components/content-calendar";
import { getCurrentUserId } from "@/lib/session";

export default async function CalendarPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const items = await db.query.content.findMany({
    where: and(eq(content.userId, userId), eq(content.status, "scheduled")),
    orderBy: [desc(content.scheduledFor)],
    columns: { id: true, body: true, status: true, scheduledFor: true },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Calendar</h1>
      <ContentCalendar
        items={items.map((item) => ({
          ...item,
          scheduledFor: item.scheduledFor?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
