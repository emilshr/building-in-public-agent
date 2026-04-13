import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const validateSchema = z.object({
  provider: z.enum(["openai", "anthropic", "openrouter"]),
  key: z.string().min(16),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`keys-validate:${ip}`, 20, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: "Rate limited" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = validateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const prefixes: Record<string, string[]> = {
    openai: ["sk-"],
    anthropic: ["sk-ant-"],
    openrouter: ["sk-or-v1-", "sk-"],
  };
  const expected = prefixes[parsed.data.provider] ?? [];
  const matchesPrefix = expected.some((prefix) =>
    parsed.data.key.startsWith(prefix),
  );

  if (!matchesPrefix) {
    return NextResponse.json(
      { ok: false, error: "Key format does not match provider" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, isValid: true });
}
