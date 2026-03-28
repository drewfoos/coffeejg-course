"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { toggleFavoriteAction } from "@/lib/actions/favorites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeartButtonProps {
  assetId: string;
  isFavorited: boolean;
  size?: "sm" | "md";
}

export function HeartButton({
  assetId,
  isFavorited,
  size = "sm",
}: HeartButtonProps) {
  const { user } = useAuth();
  const [optimistic, setOptimistic] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      alert("Please sign in to favorite assets.");
      return;
    }

    setOptimistic(!optimistic);
    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(assetId);
        setOptimistic(result);
      } catch {
        setOptimistic(optimistic);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        optimistic && "text-red-500 hover:text-red-600"
      )}
    >
      <svg
        className={cn(size === "sm" ? "h-4 w-4" : "h-5 w-5")}
        fill={optimistic ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </Button>
  );
}
