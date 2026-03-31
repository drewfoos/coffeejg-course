"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction } from "@/lib/actions/admin-users";

export function DeleteUserButton({
  uid,
  displayName,
}: {
  uid: string;
  displayName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-red-500">
          Are you sure you want to permanently delete{" "}
          <strong>{displayName}</strong>? This cannot be undone.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await deleteUserAction(uid);
                  router.push("/admin/users");
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Failed to delete user."
                  );
                  setConfirming(false);
                }
              });
            }}
            disabled={isPending}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {isPending ? "Deleting..." : "Yes, delete account"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded-md border border-border/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
    >
      Delete Account
    </button>
  );
}
