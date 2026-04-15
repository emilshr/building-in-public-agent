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
      <div className="rounded-xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-foreground">
          No approved content yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve drafts from the review queue to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => (
        <div key={item.id} className="px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "Recently updated"}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
