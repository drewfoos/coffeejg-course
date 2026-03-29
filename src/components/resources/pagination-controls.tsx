"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  nextCursor: string | null;
}

export function PaginationControls({ nextCursor }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCursor = searchParams.has("cursor");

  const goNext = () => {
    if (!nextCursor) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("cursor", nextCursor);
    router.push(`/resources?${params.toString()}`);
  };

  const goPrevious = () => {
    router.back();
  };

  if (!hasCursor && !nextCursor) return null;

  return (
    <div className="flex justify-center gap-3 pt-10 pb-4">
      {hasCursor && (
        <button
          onClick={goPrevious}
          className="flex items-center gap-2 rounded-lg border border-border/50 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Previous
        </button>
      )}
      {nextCursor && (
        <button
          onClick={goNext}
          className="flex items-center gap-2 rounded-lg border border-border/50 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Next
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
