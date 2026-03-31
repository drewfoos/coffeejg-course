"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive to-pink-500 text-white shadow-lg shadow-destructive/20">
        <Coffee className="h-10 w-10" />
      </div>
      <h1 className="mt-8 text-4xl font-bold tracking-tight">
        Aw, snap!
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        Something went wrong. Don&apos;t worry, it&apos;s not your fault &mdash;
        our VTuber tripped over a cable.
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="lg" onClick={() => reset()}>
          Try Again
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => (window.location.href = "/")}
        >
          Go Home
        </Button>
      </div>
    </main>
  );
}
