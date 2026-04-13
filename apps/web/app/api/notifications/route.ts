import { db, notification } from "@repo/db";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.query.notification.findMany({
    where: eq(notification.userId, userId),
    orderBy: [desc(notification.createdAt)],
    limit: 30,
  });
  const unreadItems = await db.query.notification.findMany({
    where: and(eq(notification.userId, userId), isNull(notification.readAt)),
    columns: { id: true },
  });
  return NextResponse.json({
    notifications: items,
    unreadCount: unreadItems.length,
  });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { id: string };
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(and(eq(notification.id, body.id), eq(notification.userId, userId)));
  return NextResponse.json({ ok: true });
}
