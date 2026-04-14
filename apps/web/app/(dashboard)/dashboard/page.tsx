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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] md:p-8">
        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
              Content pipeline
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-zinc-50">
              Revenue content command center
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Manage your content queue, approve high-quality drafts, and
              publish faster from one professional workspace.
            </p>
            {session ? (
              <p className="mt-4 text-xs text-zinc-400">
                Signed in as {session.user.name ?? session.user.email}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isGenerating}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
              onClick={async () => {
                setIsGenerating(true);
                await fetch("/api/content/generate", { method: "POST" });
                await loadContent();
                setIsGenerating(false);
              }}
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Total items
          </p>
          <p className="mt-2 text-3xl font-semibold text-zinc-50">
            {items.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Approved
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-300">
            {approvedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Drafts pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-amber-300">
            {draftCount}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_2fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            Workspace shortcuts
          </p>
          <div className="mt-4 space-y-2">
            <Link
              className="block rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:text-zinc-100"
              href="/dashboard/repos"
            >
              Manage repositories
            </Link>
            <Link
              className="block rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:text-zinc-100"
              href="/dashboard/settings/keys"
            >
              Manage API keys
            </Link>
            <Link
              className="block rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:text-zinc-100"
              href="/dashboard/settings/twitter"
            >
              X posting settings
            </Link>
            <Link
              className="block rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-700 hover:text-zinc-100"
              href="/step/1"
            >
              Continue onboarding
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Review queue
            </h3>
            <ContentFilters status={status} setStatus={setStatus} />
          </div>
          <div className="space-y-3">
            {isPending ? (
              <p className="text-sm text-zinc-400">Loading queue...</p>
            ) : null}
            {!isPending && items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400">
                No content in this filter yet. Generate content to fill your
                review pipeline.
              </p>
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
