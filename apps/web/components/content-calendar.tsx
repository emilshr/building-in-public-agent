"use client";

type CalendarItem = {
  id: string;
  body: string;
  status: string;
  updatedAt: string | null;
};

export function ContentCalendar({ items }: { items: CalendarItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded border p-3">
          <p className="text-xs text-muted-foreground">
            {item.updatedAt
              ? `Updated ${new Date(item.updatedAt).toLocaleString()}`
              : "Recently updated"}{" "}
            · {item.status}
          </p>
          <p className="text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
