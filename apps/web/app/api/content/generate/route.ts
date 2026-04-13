import { Inngest } from "inngest";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCurrentUserId } from "@/lib/session";
import { env } from "@/src/env";

const inngest = env.INNGEST_EVENT_KEY
  ? new Inngest({ id: "building-in-public-agent-web", eventKey: env.INNGEST_EVENT_KEY })
  : null;

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rate = checkRateLimit(`generate:${userId}`, 10, 60_000);
  if (!rate.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  if (!inngest) return NextResponse.json({ error: "Inngest not configured" }, { status: 500 });

  await inngest.send({
    name: "content.generate",
    data: { userId, source: "manual" },
  });
  return NextResponse.json({ ok: true });
}
