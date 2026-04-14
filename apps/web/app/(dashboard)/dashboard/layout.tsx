import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
    <main className="min-h-screen bg-[#090c14] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <header className="mb-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.4)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">
                Building in Public Agent
              </p>
              <h1 className="mt-1 text-lg font-semibold text-zinc-100">
                Growth Operations Dashboard
              </h1>
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-200">
              Workspace active
            </Badge>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
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
