"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

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
  const maxTweetLength = 280;
  const isOverXLimit = item.body.length > maxTweetLength;
  const composerUrl = `https://x.com/intent/post?text=${encodeURIComponent(item.body)}`;
  const canPostOnX = item.status === "draft" || item.status === "approved";

  return (
    <div className="space-y-3 rounded border p-4">
      <div className="flex items-center justify-between">
        <Badge>{item.type}</Badge>
        <Badge variant="secondary">{item.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {item.body}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.body.length}/{maxTweetLength} characters
      </p>
      {canPostOnX && isOverXLimit ? (
        <p className="text-xs text-destructive">
          Trim this draft to 280 characters before posting on X.
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onApprove(item.id)}>
          Approve
        </Button>
        {canPostOnX ? (
          isOverXLimit ? (
            <Button size="sm" disabled>
              Post on X
            </Button>
          ) : (
            <Link
              className={buttonVariants({ size: "sm" })}
              href={composerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Post on X
            </Link>
          )
        ) : null}
        <Button size="sm" variant="outline" onClick={() => onDiscard(item.id)}>
          Discard
        </Button>
      </div>
    </div>
  );
}
