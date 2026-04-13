"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ContentRecord = {
  id: string;
  type: string;
  body: string;
  status: string;
};

export function ContentCard({
  item,
  onApprove,
  onDiscard,
}: {
  item: ContentRecord;
  onApprove: (id: string) => void;
  onDiscard: (id: string) => void;
}) {
  return (
    <div className="space-y-3 rounded border p-4">
      <div className="flex items-center justify-between">
        <Badge>{item.type}</Badge>
        <Badge variant="secondary">{item.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {item.body}
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onApprove(item.id)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDiscard(item.id)}>
          Discard
        </Button>
      </div>
    </div>
  );
}
