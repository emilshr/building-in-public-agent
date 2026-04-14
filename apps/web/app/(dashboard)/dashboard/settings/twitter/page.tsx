import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";

export default async function TwitterSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <div className="max-w-4xl space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
          Distribution
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-50">X Posting</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Posting uses a manual-assist flow. Create drafts in your dashboard,
          then click{" "}
          <span className="font-medium text-zinc-100">Post on X</span> to open
          the X composer with your content prefilled.
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
          Current setup
        </h3>
        <p className="mt-3 text-sm text-zinc-400">
          No OAuth connection or paid X API access is required.
        </p>
      </section>
    </div>
  );
}
