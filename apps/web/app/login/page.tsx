"use client";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Building in Public Agent
      </h1>
      <p style={{ color: "#666", maxWidth: "400px", textAlign: "center" }}>
        Auto-generate marketing content from your codebase. Sign in with GitHub
        to get started.
      </p>
      <button
        onClick={async () => {
          await authClient.signIn.social({
            provider: "github",
            callbackURL: "/dashboard",
          });
        }}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          fontWeight: 500,
          backgroundColor: "#24292e",
          color: "#fff",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
        }}
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
