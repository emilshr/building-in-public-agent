"use client";

type CalendarItem = {
  id: string;
  body: string;
  status: string;
  scheduledFor: string | null;
};

export function ContentCalendar({ items }: { items: CalendarItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded border p-3">
          <p className="text-xs text-muted-foreground">
            {item.scheduledFor
              ? new Date(item.scheduledFor).toLocaleString()
              : "Unscheduled"}{" "}
            · {item.status}
          </p>
          <p className="text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
