import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/session";
import { storeTwitterConnection } from "@/lib/twitter";
import { env } from "@/src/env";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

export async function GET(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.redirect(new URL("/login", request.url));
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("twitter_oauth_state")?.value;
  const codeVerifier = cookieStore.get("twitter_code_verifier")?.value;

  if (!code || !state || state !== expectedState || !codeVerifier) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/twitter?error=oauth", request.url),
    );
  }
  if (
    !env.TWITTER_CLIENT_ID ||
    !env.TWITTER_CLIENT_SECRET ||
    !env.TWITTER_REDIRECT_URI
  ) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/twitter?error=config", request.url),
    );
  }

  const tokenResp = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.TWITTER_REDIRECT_URI,
      client_id: env.TWITTER_CLIENT_ID,
      code_verifier: codeVerifier,
    }),
  });
  if (!tokenResp.ok) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/twitter?error=token", request.url),
    );
  }

  const tokenData = (await tokenResp.json()) as TokenResponse;
  const meResp = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!meResp.ok) {
    return NextResponse.redirect(
      new URL("/dashboard/settings/twitter?error=profile", request.url),
    );
  }
  const meData = (await meResp.json()) as {
    data: { id: string; username: string };
  };

  await storeTwitterConnection({
    userId,
    twitterUserId: meData.data.id,
    twitterUsername: meData.data.username,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    tokenExpiresAt: tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000)
      : null,
  });
  return NextResponse.redirect(
    new URL("/dashboard/settings/twitter?connected=1", request.url),
  );
}
