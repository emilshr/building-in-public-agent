"use client";

import { Input } from "@/components/ui/input";

export function ContentFilters({
  status,
  setStatus,
}: {
  status: string;
  setStatus: (next: string) => void;
}) {
  return (
    <div className="w-full md:w-52">
      <Input
        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        placeholder="Filter by status"
      />
    </div>
  );
}
