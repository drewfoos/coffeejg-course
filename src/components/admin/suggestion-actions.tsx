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
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={`/admin/assets/new?suggestion=${suggestionId}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.25}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Import
        </Link>
        <button
          onClick={() => {
            startTransition(async () => {
              await rejectSuggestionAction(suggestionId);
            });
          }}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
          ) : (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.25}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          Reject
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await reopenSuggestionAction(suggestionId);
        });
      }}
      disabled={isPending}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      ) : (
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.25}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      )}
      Reopen
    </button>
  );
}
