"use client";

import { useState, useTransition } from "react";
import { deleteAssetAction } from "@/lib/actions/admin-resources";

export function DeleteAssetButton({
  assetId,
  title,
}: {
  assetId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Delete &quot;{title}&quot;?</span>
        <button
          onClick={() => {
            startTransition(async () => {
              await deleteAssetAction(assetId);
              setConfirming(false);
            });
          }}
          disabled={isPending}
          className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
    >
      Delete
    </button>
  );
}
