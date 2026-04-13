import { randomUUID } from "node:crypto";
import { db, userPreferences } from "@repo/db";
import { eq } from "drizzle-orm";
import { Inngest } from "inngest";
import { NextResponse } from "next/server";
import { onboardingPayloadSchema } from "@/lib/onboarding";
import { getCurrentUserId } from "@/lib/session";
import { env } from "@/src/env";

const inngest = env.INNGEST_EVENT_KEY
  ? new Inngest({
      id: "building-in-public-agent-web",
      eventKey: env.INNGEST_EVENT_KEY,
    })
  : null;

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
  });
  return NextResponse.json({ preferences: prefs ?? null });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = onboardingPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, userId),
    columns: { id: true },
  });

  const update = {
    onboardingStep: parsed.data.step,
    tone: parsed.data.tone,
    generationFrequency: parsed.data.generationFrequency,
    timezone: parsed.data.timezone,
    contentTypes: parsed.data.contentTypes
      ? JSON.stringify(parsed.data.contentTypes)
      : undefined,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(userPreferences)
      .set(update)
      .where(eq(userPreferences.id, existing.id));
  } else {
    await db.insert(userPreferences).values({
      id: randomUUID(),
      userId,
      onboardingStep: parsed.data.step,
      tone: parsed.data.tone ?? null,
      generationFrequency: parsed.data.generationFrequency ?? "weekly",
      timezone: parsed.data.timezone ?? "UTC",
      contentTypes: parsed.data.contentTypes
        ? JSON.stringify(parsed.data.contentTypes)
        : null,
    });
  }

  if (parsed.data.step === 6) {
    await db
      .update(userPreferences)
      .set({
        onboardingComplete: true,
        onboardingStep: 6,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));

    if (inngest) {
      await inngest.send({ name: "user.onboarded", data: { userId } });
    }
  }

  return NextResponse.json({ ok: true });
}
