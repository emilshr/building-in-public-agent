import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";

export default async function TwitterSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          X Posting
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Posting uses a manual-assist flow. Create drafts in your dashboard,
          then click{" "}
          <span className="font-medium text-foreground">Post on X</span> to open
          the X composer with your content prefilled.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-muted/30 px-5 py-4">
        <p className="text-sm font-medium">Current setup</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No OAuth connection or paid X API access is required.
        </p>
      </section>
    </div>
  );
}
