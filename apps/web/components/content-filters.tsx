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
    <div className="w-full sm:w-48">
      <Input
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        placeholder="Filter by status"
      />
    </div>
  );
}
