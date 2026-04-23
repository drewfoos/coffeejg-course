"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  rejectSuggestionAction,
  reopenSuggestionAction,
} from "@/lib/actions/admin-resources";
import type { Suggestion } from "@/lib/types";

export function SuggestionActions({
  suggestionId,
  status,
}: {
  suggestionId: string;
  status: Suggestion["status"];
}) {
  const [isPending, startTransition] = useTransition();

  if (status === "new") {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/assets/new?suggestion=${suggestionId}`}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Import
        </Link>
        <button
          onClick={() => {
            startTransition(async () => {
              await rejectSuggestionAction(suggestionId);
            });
          }}
          disabled={isPending}
          className="rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
        >
          {isPending ? "…" : "Reject"}
        </button>
      </div>
    );
  }

  // For rejected / imported — allow reopening
  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await reopenSuggestionAction(suggestionId);
        });
      }}
      disabled={isPending}
      className="rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
    >
      {isPending ? "…" : "Reopen"}
    </button>
  );
}
