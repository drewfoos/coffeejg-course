"use client";

import { useTransition } from "react";
import { createBillingPortalSession } from "@/lib/actions/billing";

export function ManageSubscriptionButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => createBillingPortalSession())}
      disabled={isPending}
      className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
    >
      {isPending ? "Redirecting..." : "Manage Billing"}
    </button>
  );
}
