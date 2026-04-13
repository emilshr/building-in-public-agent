"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentCard } from "@/components/content-card";
import { ContentFilters } from "@/components/content-filters";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type ContentItem = {
  id: string;
  type: string;
  body: string;
  status: string;
};

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadContent() {
    const response = await fetch(
      status
        ? `/api/content?status=${encodeURIComponent(status)}`
        : "/api/content",
    );
    if (!response.ok) return;
    const data = (await response.json()) as { content: ContentItem[] };
    setItems(data.content);
  }

  useEffect(() => {
    if (!session) return;
    void loadContent();
  }, [session, status]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name ?? session.user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/login";
            }}
          >
            Sign out
          </Button>
          <Button
            disabled={isGenerating}
            onClick={async () => {
              setIsGenerating(true);
              await fetch("/api/content/generate", { method: "POST" });
              await loadContent();
              setIsGenerating(false);
            }}
          >
            Generate Now
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <Link className="text-sm underline" href="/dashboard/repos">
          Manage repositories
        </Link>
        <br />
        <Link className="text-sm underline" href="/dashboard/settings/keys">
          Manage API keys
        </Link>
        <br />
        <Link className="text-sm underline" href="/step/1">
          Continue onboarding
        </Link>
      </div>

      <div className="mb-4">
        <ContentFilters status={status} setStatus={setStatus} />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onApprove={async (id) => {
              await fetch("/api/content", {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id, action: "approve" }),
              });
              await loadContent();
            }}
            onDiscard={async (id) => {
              await fetch(`/api/content?id=${encodeURIComponent(id)}`, {
                method: "DELETE",
              });
              await loadContent();
            }}
          />
        ))}
      </div>
    </div>
  );
}
