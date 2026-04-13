import { db, twitterConnection } from "@repo/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/session";

export default async function TwitterSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  const connection = await db.query.twitterConnection.findFirst({
    where: eq(twitterConnection.userId, userId),
    columns: { twitterUsername: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-xl font-semibold">Twitter/X</h1>
      {connection ? (
        <p className="text-sm text-muted-foreground">
          Connected as @{connection.twitterUsername}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Connect your account to enable scheduled posting.
        </p>
      )}
      <Link href="/api/twitter/auth">
        <Button>{connection ? "Reconnect Twitter" : "Connect Twitter"}</Button>
      </Link>
    </div>
  );
}
