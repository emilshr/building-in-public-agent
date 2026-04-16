"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Building in Public
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Auto-generate marketing content from your codebase. Sign in to get
            started.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            className="w-full"
            disabled={isSigningIn}
            onClick={handleGithubSignIn}
          >
            {isSigningIn ? "Redirecting..." : "Sign in with GitHub"}
          </Button>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <p className="mt-12 text-xs text-muted-foreground">
          By signing in you agree to let this app access your public GitHub
          repositories.
        </p>
      </div>
    </div>
  );
}
