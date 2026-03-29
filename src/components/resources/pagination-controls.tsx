"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  nextCursor: string | null;
}

export function PaginationControls({ nextCursor }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasCursor = searchParams.has("cursor");
  const currentPage = Number(searchParams.get("page") ?? "1");

  const navigate = (cursor: string | null, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cursor) {
      params.set("cursor", cursor);
    } else {
      params.delete("cursor");
    }
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    router.push(`/resources?${params.toString()}`);
  };

  if (!hasCursor && !nextCursor) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-10 pb-4">
      {/* Previous */}
      <button
        onClick={() => router.back()}
        disabled={!hasCursor}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors",
          hasCursor
            ? "border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            : "pointer-events-none border-border/30 text-muted-foreground/30"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Prev
      </button>

      {/* Page number */}
      <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground">
        {currentPage}
      </span>

      {/* Next page indicator */}
      {nextCursor && (
        <button
          onClick={() => navigate(nextCursor, currentPage + 1)}
          className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-border/50 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {currentPage + 1}
        </button>
      )}

      {/* Next */}
      <button
        onClick={() => nextCursor && navigate(nextCursor, currentPage + 1)}
        disabled={!nextCursor}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors",
          nextCursor
            ? "border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            : "pointer-events-none border-border/30 text-muted-foreground/30"
        )}
      >
        Next
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
