"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await signOut();
          router.push("/");
          router.refresh();
        });
      }}
      disabled={isPending}
      className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}
