"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGithubSignIn() {
    setIsSigningIn(true);
    setErrorMessage("");

    try {
      const result = await authClient.signIn.social({
        provider: "github",
        callbackURL: "/dashboard",
        errorCallbackURL: "/login?error=oauth_init_failed",
        disableRedirect: true,
      });

      const destination =
        (result.data as { url?: string } | null | undefined)?.url ??
        (result as { url?: string } | null | undefined)?.url;

      if (destination) {
        window.location.href = destination;
        return;
      }

      setErrorMessage("Could not start GitHub login. Please try again.");
    } catch {
      setErrorMessage("GitHub login failed to start. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Building in Public Agent
          </CardTitle>
          <CardDescription>
            Auto-generate marketing content from your codebase. Sign in with
            GitHub to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            disabled={isSigningIn}
            onClick={handleGithubSignIn}
          >
            {isSigningIn ? "Redirecting..." : "Sign in with GitHub"}
          </Button>
          {errorMessage ? (
            <p className="mt-3 text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
