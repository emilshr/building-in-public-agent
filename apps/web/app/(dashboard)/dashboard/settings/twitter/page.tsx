import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";

export default async function TwitterSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">X posting</h1>
      <p className="text-sm text-muted-foreground">
        Posting uses a manual-assist flow. Create drafts in your dashboard, then
        click <span className="font-medium">Post on X</span> to open the X
        composer with your content prefilled.
      </p>
      <p className="text-sm text-muted-foreground">
        No OAuth connection or paid X API access is required.
      </p>
    </div>
  );
}
