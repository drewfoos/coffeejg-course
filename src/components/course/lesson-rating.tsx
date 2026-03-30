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
      <p className="text-sm text-muted-foreground">How was this lesson?</p>
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
                viewBox="0 0 576 512"
                fill="currentColor"
              >
                <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
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
