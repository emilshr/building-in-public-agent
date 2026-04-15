import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/repos", label: "Repositories" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/settings/keys", label: "API Keys" },
  { href: "/dashboard/settings/twitter", label: "X Settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold tracking-tight">
                Building in Public
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Content operations dashboard
              </p>
            </div>
          </div>
          <nav className="mt-5 flex gap-1 border-b border-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
