import { randomUUID } from "node:crypto";
import { db, decryptApiKey, encryptApiKey, twitterConnection } from "@repo/db";
import { eq } from "drizzle-orm";

export async function storeTwitterConnection(input: {
  userId: string;
  twitterUserId: string;
  twitterUsername: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date | null;
}) {
  const encryptedAccessToken = encryptApiKey(input.accessToken, input.userId);
  const encryptedRefreshToken = input.refreshToken
    ? encryptApiKey(input.refreshToken, input.userId)
    : null;

  const existing = await db.query.twitterConnection.findFirst({
    where: eq(twitterConnection.userId, input.userId),
    columns: { id: true },
  });

  if (existing) {
    await db
      .update(twitterConnection)
      .set({
        twitterUserId: input.twitterUserId,
        twitterUsername: input.twitterUsername,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: input.tokenExpiresAt ?? null,
      })
      .where(eq(twitterConnection.id, existing.id));
    return;
  }

  await db.insert(twitterConnection).values({
    id: randomUUID(),
    userId: input.userId,
    twitterUserId: input.twitterUserId,
    twitterUsername: input.twitterUsername,
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt: input.tokenExpiresAt ?? null,
  });
}

export function decryptTwitterAccessToken(
  encryptedAccessToken: string,
  userId: string,
) {
  return decryptApiKey(encryptedAccessToken, userId);
}
