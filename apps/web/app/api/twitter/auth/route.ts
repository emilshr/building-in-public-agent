import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { env } from "@/src/env";

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.redirect(new URL("/login", request.url));
  if (!env.TWITTER_CLIENT_ID || !env.TWITTER_REDIRECT_URI) {
    return NextResponse.json({ error: "Twitter OAuth not configured" }, { status: 500 });
  }

  const state = randomBytes(16).toString("hex");
  const codeVerifier = randomBytes(32).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set("twitter_oauth_state", state, { httpOnly: true, sameSite: "lax" });
  cookieStore.set("twitter_code_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
  });

  const search = new URLSearchParams({
    response_type: "code",
    client_id: env.TWITTER_CLIENT_ID,
    redirect_uri: env.TWITTER_REDIRECT_URI,
    scope: "tweet.read tweet.write users.read offline.access",
    state,
    code_challenge: codeVerifier,
    code_challenge_method: "plain",
  });
  return NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?${search.toString()}`,
  );
}
