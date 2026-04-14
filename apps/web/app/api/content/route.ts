import { randomUUID } from "node:crypto";
import { content, db, notification, repo } from "@repo/db";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/session";

const createSchema = z.object({
  type: z.string().min(1),
  body: z.string().min(1),
  repoId: z.string().min(1),
});

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const status = url.searchParams.get("status");

  // Legacy cleanup from API-based publishing: keep actionable drafts in approved.
  await db
    .update(content)
    .set({
      status: "approved",
      scheduledFor: null,
      errorMessage: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(content.userId, userId),
        inArray(content.status, ["scheduled", "failed", "posted"]),
      ),
    );

  const records = await db.query.content.findMany({
    where:
      status && status.length > 0
        ? and(eq(content.userId, userId), eq(content.status, status))
        : eq(content.userId, userId),
    orderBy: [desc(content.createdAt)],
  });
  return NextResponse.json({ content: records });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = createSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repoRecord = await db.query.repo.findFirst({
    where: and(eq(repo.id, payload.data.repoId), eq(repo.userId, userId)),
    columns: { summaryVersion: true },
  });
  if (!repoRecord) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 },
    );
  }

  await db.insert(content).values({
    id: randomUUID(),
    userId,
    repoId: payload.data.repoId,
    type: payload.data.type,
    body: payload.data.body,
    status: "draft",
    scheduledFor: null,
    summaryVersion: repoRecord.summaryVersion,
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    id: string;
    action: "approve" | "discard";
  };

  const record = await db.query.content.findFirst({
    where: and(eq(content.id, body.id), eq(content.userId, userId)),
    columns: { id: true },
  });
  if (!record)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.action === "approve") {
    await db
      .update(content)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(content.id, body.id));
  } else {
    await db
      .update(content)
      .set({ status: "discarded", updatedAt: new Date() })
      .where(eq(content.id, body.id));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db
    .delete(content)
    .where(and(eq(content.id, id), eq(content.userId, userId)));
  await db.insert(notification).values({
    id: randomUUID(),
    userId,
    type: "content_discarded",
    title: "Content discarded",
    body: "A draft was removed from your queue.",
  });
  return NextResponse.json({ ok: true });
}
