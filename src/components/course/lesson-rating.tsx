"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function LessonRating() {
  const [rating, setRating] = useState<number>(0);
  const [hovered, setHovered] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleClick = (star: number) => {
    setRating(star);
    setSubmitted(true);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Rate this lesson</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= (hovered || rating);
          return (
            <button
              key={star}
              onClick={() => handleClick(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="cursor-pointer p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <svg
                className={cn(
                  "h-5 w-5 transition-colors",
                  filled ? "text-yellow-400" : "text-muted-foreground/30"
                )}
                viewBox="0 0 24 24"
                fill={filled ? "currentColor" : "none"}
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                />
              </svg>
            </button>
          );
        })}
      </div>
      {submitted && (
        <span className="text-xs text-muted-foreground">Thanks!</span>
      )}
    </div>
  );
}
