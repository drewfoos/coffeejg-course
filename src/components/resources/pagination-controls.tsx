"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

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
    <div className="flex justify-center gap-4 py-8">
      {hasCursor && (
        <Button variant="outline" onClick={goPrevious}>
          Previous
        </Button>
      )}
      {nextCursor && (
        <Button variant="outline" onClick={goNext}>
          Next
        </Button>
      )}
    </div>
  );
}
