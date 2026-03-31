"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
}

function buildHref(searchParams: URLSearchParams, page: number) {
  const params = new URLSearchParams(searchParams.toString());
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  return `/resources?${params.toString()}`;
}

/** Returns page numbers to render, with -1 representing ellipsis. */
function getPageNumbers(current: number, total: number): number[] {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [1];

  if (current > 4) {
    pages.push(-1);
  }

  const start = Math.max(2, current - 2);
  const end = Math.min(total - 1, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 3) {
    pages.push(-1);
  }

  pages.push(total);

  return pages;
}

export function PaginationControls({
  currentPage,
  totalPages,
}: PaginationControlsProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 pt-10 pb-4"
    >
      {/* Previous */}
      <Link
        href={buildHref(searchParams, currentPage - 1)}
        aria-label="Previous page"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors",
          hasPrev
            ? "border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            : "pointer-events-none border-border/30 text-muted-foreground/30"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </Link>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === -1 ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground/50"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(searchParams, p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors",
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      <Link
        href={buildHref(searchParams, currentPage + 1)}
        aria-label="Next page"
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors",
          hasNext
            ? "border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground"
            : "pointer-events-none border-border/30 text-muted-foreground/30"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
    </nav>
  );
}
