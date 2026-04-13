import { db, session } from "@repo/db";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("better-auth.session_token")?.value;

  if (!token) {
    return null;
  }

  const activeSession = await db.query.session.findFirst({
    where: and(eq(session.token, token), gt(session.expiresAt, new Date())),
    columns: { userId: true },
  });

  return activeSession?.userId ?? null;
}
