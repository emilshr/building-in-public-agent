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

  const approvedCount = items.filter(
    (item) => item.status === "approved",
  ).length;
  const draftCount = items.filter((item) => item.status === "draft").length;

  return (
    <div className="space-y-10">
      {/* Hero section */}
      <section>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Content pipeline
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Generate drafts from your codebase, approve the good ones, and
              publish without context-switching.
            </p>
            {session ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Signed in as {session.user.name ?? session.user.email}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isGenerating}
              onClick={async () => {
                setIsGenerating(true);
                await fetch("/api/content/generate", { method: "POST" });
                await loadContent();
                setIsGenerating(false);
              }}
            >
              {isGenerating ? "Generating..." : "Generate content"}
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <div className="bg-card px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total items
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">{items.length}</p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Approved
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-primary">
            {approvedCount}
          </p>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Drafts pending
          </p>
          <p className="mt-1 font-heading text-2xl font-bold">{draftCount}</p>
        </div>
      </section>

      {/* Main content area */}
      <section className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar shortcuts */}
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Quick links
          </p>
          <nav className="space-y-1">
            {[
              { href: "/dashboard/repos", label: "Manage repositories" },
              { href: "/dashboard/settings/keys", label: "API keys" },
              {
                href: "/dashboard/settings/twitter",
                label: "X posting settings",
              },
              { href: "/dashboard/repos", label: "Continue onboarding" },
            ].map((link) => (
              <Link
                key={link.label}
                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Review queue */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Review queue
            </h3>
            <ContentFilters status={status} setStatus={setStatus} />
          </div>
          <div className="space-y-3">
            {isPending ? (
              <p className="text-sm text-muted-foreground">Loading queue...</p>
            ) : null}
            {!isPending && items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No content yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hit "Generate content" to fill your review pipeline.
                </p>
              </div>
            ) : null}
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
      </section>
    </div>
  );
}
