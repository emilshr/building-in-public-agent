"use client";

import { authClient } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p>Loading...</p>;
  }

  if (!session) {
    return <p>Not authenticated</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Dashboard</h1>
      <p style={{ marginTop: "1rem" }}>
        Welcome, {session.user.name ?? session.user.email}!
      </p>
      <button
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/login";
        }}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#eee",
          border: "1px solid #ccc",
          borderRadius: "0.375rem",
          cursor: "pointer",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
