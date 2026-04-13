import {
  db,
  account,
  apiKey,
  content,
  githubInstallation,
  notification,
  repo,
  session,
  twitterConnection,
  user,
  userPreferences,
} from "@repo/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userRecord = await db.query.user.findFirst({ where: eq(user.id, userId) });
  const repos = await db.query.repo.findMany({ where: eq(repo.userId, userId) });
  const keys = await db.query.apiKey.findMany({ where: eq(apiKey.userId, userId) });
  const contentItems = await db.query.content.findMany({
    where: eq(content.userId, userId),
  });
  return NextResponse.json({ user: userRecord, repos, keys, content: contentItems });
}

export async function DELETE() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await db.delete(content).where(eq(content.userId, userId));
  await db.delete(notification).where(eq(notification.userId, userId));
  await db.delete(apiKey).where(eq(apiKey.userId, userId));
  await db.delete(twitterConnection).where(eq(twitterConnection.userId, userId));
  await db.delete(repo).where(eq(repo.userId, userId));
  await db.delete(githubInstallation).where(eq(githubInstallation.userId, userId));
  await db.delete(userPreferences).where(eq(userPreferences.userId, userId));
  await db.delete(session).where(eq(session.userId, userId));
  await db.delete(account).where(eq(account.userId, userId));
  await db.delete(user).where(eq(user.id, userId));
  return NextResponse.json({ ok: true });
}
