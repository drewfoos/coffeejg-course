"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { deleteAccountAction } from "@/lib/actions/delete-account";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user: firebaseUser } = useAuth();

  const CONFIRM_PHRASE = "delete my account";
  const isConfirmed = confirmText.toLowerCase().trim() === CONFIRM_PHRASE;

  const handleDelete = () => {
    if (!firebaseUser) {
      setError("You must be signed in. Please refresh the page and try again.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        // Get a fresh ID token — forces re-validation with Firebase Auth.
        // The server verifies this token matches the session cookie UID.
        const freshToken = await firebaseUser.getIdToken(true);

        await deleteAccountAction(freshToken, confirmText);
        router.push("/");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete account."
        );
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-red-500"
      >
        Delete my account
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!isPending) setOpen(v); }}>
        <DialogContent className="sm:max-w-lg border-red-500/30">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-500">
              Delete Your Account
            </DialogTitle>
            <DialogDescription className="text-center">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4 space-y-2">
              <p className="text-sm font-semibold text-red-500">This will permanently delete:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {[
                  "Your account and all personal data",
                  "All course progress and completion history",
                  "All saved favorites",
                  "Active subscriptions will be cancelled immediately",
                  "Enrollment and purchase records",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500/60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type <span className="font-mono text-red-500">{CONFIRM_PHRASE}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                disabled={isPending}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isPending}
                className="w-full rounded-lg bg-red-500 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "Deleting everything..." : "Permanently Delete My Account"}
              </button>
              <button
                onClick={() => { setOpen(false); setConfirmText(""); setError(null); }}
                disabled={isPending}
                className="w-full rounded-lg border border-border py-3 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
