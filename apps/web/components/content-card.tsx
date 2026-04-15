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
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{item.type}</Badge>
        <Badge variant="outline">{item.status}</Badge>
        <span className="ml-auto text-xs text-muted-foreground">
          {item.body.length}/{maxTweetLength}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
        {item.body}
      </p>

      {canPostOnX && isOverXLimit ? (
        <p className="mt-2 text-xs text-destructive">
          Trim to 280 characters before posting on X.
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => onApprove(item.id)}>
          Approve
        </Button>
        {canPostOnX ? (
          isOverXLimit ? (
            <Button size="sm" variant="outline" disabled>
              Post on X
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                variant: "outline",
              })}
              href={composerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Post on X
            </Link>
          )
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => onDiscard(item.id)}>
          Discard
        </Button>
      </div>
    </div>
  );
}
