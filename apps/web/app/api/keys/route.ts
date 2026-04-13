import { randomUUID } from "node:crypto";
import { apiKey, db, decryptApiKey, encryptApiKey } from "@repo/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/session";

const createSchema = z.object({
  provider: z.enum(["openai", "anthropic", "openrouter"]),
  key: z.string().min(16),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = await db.query.apiKey.findMany({
    where: eq(apiKey.userId, userId),
    columns: {
      id: true,
      provider: true,
      encryptedKey: true,
      isValid: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    keys: keys.map((keyRecord) => {
      const plaintext = decryptApiKey(keyRecord.encryptedKey, userId);
      return {
        id: keyRecord.id,
        provider: keyRecord.provider,
        maskedKey: `••••${plaintext.slice(-4)}`,
        isValid: keyRecord.isValid,
        updatedAt: keyRecord.updatedAt,
      };
    }),
  });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = createSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.query.apiKey.findFirst({
    where: and(
      eq(apiKey.userId, userId),
      eq(apiKey.provider, payload.data.provider),
    ),
    columns: { id: true, keyVersion: true },
  });

  const encrypted = encryptApiKey(payload.data.key, userId);

  if (existing) {
    await db
      .update(apiKey)
      .set({
        encryptedKey: encrypted,
        isValid: true,
        keyVersion: existing.keyVersion + 1,
        updatedAt: new Date(),
      })
      .where(eq(apiKey.id, existing.id));
    return NextResponse.json({ ok: true, rotated: true });
  }

  await db.insert(apiKey).values({
    id: randomUUID(),
    userId,
    provider: payload.data.provider,
    encryptedKey: encrypted,
    isValid: true,
  });
  return NextResponse.json({ ok: true, created: true });
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (!provider)
    return NextResponse.json({ error: "provider required" }, { status: 400 });

  await db
    .delete(apiKey)
    .where(and(eq(apiKey.userId, userId), eq(apiKey.provider, provider)));
  return NextResponse.json({ ok: true });
}
