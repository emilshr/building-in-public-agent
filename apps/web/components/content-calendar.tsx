"use client";

type CalendarItem = {
  id: string;
  body: string;
  status: string;
  updatedAt: string | null;
};

export function ContentCalendar({ items }: { items: CalendarItem[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        No approved content yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/65 p-3"
        >
          <p className="text-xs text-zinc-500">
            {item.updatedAt
              ? `Updated ${new Date(item.updatedAt).toLocaleString()}`
              : "Recently updated"}{" "}
            · {item.status}
          </p>
          <p className="text-sm text-zinc-200">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
