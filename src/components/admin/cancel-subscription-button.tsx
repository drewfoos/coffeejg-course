"use client";

import { useState, useTransition } from "react";
import {
  cancelSubscriptionAtPeriodEndAction,
  cancelSubscriptionImmediateAction,
} from "@/lib/actions/admin-users";

export function CancelSubscriptionButton({
  uid,
  stripeCustomerId,
}: {
  uid: string;
  stripeCustomerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            startTransition(async () => {
              await cancelSubscriptionAtPeriodEndAction(uid, stripeCustomerId);
              setConfirming(false);
            });
          }}
          disabled={isPending}
          className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          title="User keeps access until their billing period ends"
        >
          {isPending ? "..." : "End of period"}
        </button>
        <button
          onClick={() => {
            startTransition(async () => {
              await cancelSubscriptionImmediateAction(uid, stripeCustomerId);
              setConfirming(false);
            });
          }}
          disabled={isPending}
          className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          title="User loses access immediately"
        >
          {isPending ? "..." : "Immediate"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-border/50 px-2 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-orange-500/30 px-3 py-1.5 text-xs font-medium text-orange-500 transition-colors hover:bg-orange-500/10"
    >
      Cancel Sub
    </button>
  );
}
