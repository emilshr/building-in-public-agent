import { randomUUID } from "node:crypto";
import { db, repo, repoOnboardingPreferences } from "@repo/db";
import { and, eq } from "drizzle-orm";
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

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repoId = new URL(request.url).searchParams.get("repoId");
  if (!repoId) {
    return NextResponse.json({ error: "repoId is required" }, { status: 400 });
  }

  const repoRecord = await db.query.repo.findFirst({
    where: eq(repo.id, repoId),
    columns: { id: true, userId: true },
  });
  if (!repoRecord) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 },
    );
  }
  if (repoRecord.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const prefs = await db.query.repoOnboardingPreferences.findFirst({
    where: eq(repoOnboardingPreferences.repoId, repoId),
  });

  return NextResponse.json({
    preferences: prefs ?? null,
    isOwner: repoRecord.userId === userId,
  });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = onboardingPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const repoRecord = await db.query.repo.findFirst({
    where: eq(repo.id, parsed.data.repoId),
    columns: { id: true, userId: true },
  });
  if (!repoRecord) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 },
    );
  }
  if (repoRecord.userId !== userId) {
    return NextResponse.json(
      { error: "Only repository owner can update onboarding" },
      { status: 403 },
    );
  }

  const existing = await db.query.repoOnboardingPreferences.findFirst({
    where: eq(repoOnboardingPreferences.repoId, parsed.data.repoId),
    columns: { id: true },
  });

  const update = {
    productName: parsed.data.productName,
    productDescription: parsed.data.productDescription,
    targetAudience: parsed.data.targetAudience,
    onboardingStep: parsed.data.step,
    tone: parsed.data.tone,
    apiProvider: parsed.data.apiProvider,
    generationFrequency: parsed.data.generationFrequency,
    timezone: parsed.data.timezone,
    contentTypes: parsed.data.contentTypes
      ? JSON.stringify(parsed.data.contentTypes)
      : undefined,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(repoOnboardingPreferences)
      .set(update)
      .where(eq(repoOnboardingPreferences.id, existing.id));
  } else {
    await db.insert(repoOnboardingPreferences).values({
      id: randomUUID(),
      repoId: parsed.data.repoId,
      ownerUserId: repoRecord.userId,
      productName: parsed.data.productName ?? null,
      productDescription: parsed.data.productDescription ?? null,
      targetAudience: parsed.data.targetAudience ?? null,
      onboardingStep: parsed.data.step,
      tone: parsed.data.tone ?? null,
      apiProvider: parsed.data.apiProvider ?? null,
      generationFrequency: parsed.data.generationFrequency ?? "weekly",
      timezone: parsed.data.timezone ?? "UTC",
      contentTypes: parsed.data.contentTypes
        ? JSON.stringify(parsed.data.contentTypes)
        : null,
    });
  }

  if (parsed.data.step === 6) {
    await db
      .update(repoOnboardingPreferences)
      .set({
        onboardingComplete: true,
        onboardingStep: 6,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(repoOnboardingPreferences.repoId, parsed.data.repoId),
          eq(repoOnboardingPreferences.ownerUserId, userId),
        ),
      );

    if (inngest) {
      await inngest.send({
        name: "user.onboarded",
        data: { userId, repoId: parsed.data.repoId },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
