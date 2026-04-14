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
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/65 p-4">
      <div className="flex items-center justify-between">
        <Badge className="bg-zinc-700/70 text-zinc-100">{item.type}</Badge>
        <Badge className="bg-zinc-800 text-zinc-200">{item.status}</Badge>
      </div>
      <p className="text-sm whitespace-pre-wrap text-zinc-300">{item.body}</p>
      <p className="text-xs text-zinc-500">
        {item.body.length}/{maxTweetLength} characters
      </p>
      {canPostOnX && isOverXLimit ? (
        <p className="text-xs text-red-300">
          Trim this draft to 280 characters before posting on X.
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          onClick={() => onApprove(item.id)}
        >
          Approve
        </Button>
        {canPostOnX ? (
          isOverXLimit ? (
            <Button size="sm" disabled>
              Post on X
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                className:
                  "border border-zinc-700 bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
              })}
              href={composerUrl}
              target="_blank"
              rel="noreferrer"
            >
              Post on X
            </Link>
          )
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 bg-transparent text-zinc-200 hover:bg-zinc-800"
          onClick={() => onDiscard(item.id)}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
