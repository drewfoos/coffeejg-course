"use client";

import { useState, useTransition } from "react";
import {
  cancelSubscriptionAction,
  resumeSubscriptionAction,
} from "@/lib/actions/billing";

export function CancelSubscriptionSection({
  isCancelling,
}: {
  isCancelling: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isCancelling) {
    return (
      <button
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await resumeSubscriptionAction();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Failed to resume."
              );
            }
          });
        }}
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Resuming..." : "Resume Subscription"}
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 space-y-3">
        <p className="text-sm font-medium text-red-500">
          Are you sure you want to cancel?
        </p>
        <p className="text-sm text-muted-foreground">
          You&apos;ll keep access until the end of your current billing period.
          You can resume anytime before then.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await cancelSubscriptionAction();
                  setConfirming(false);
                } catch (err) {
                  setError(
                    err instanceof Error ? err.message : "Failed to cancel."
                  );
                }
              });
            }}
            disabled={isPending}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? "Cancelling..." : "Yes, cancel subscription"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-md border border-border/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Keep subscription
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setConfirming(true)}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-red-500"
      >
        Cancel subscription
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
