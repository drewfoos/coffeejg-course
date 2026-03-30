"use client";

import { useState, useTransition } from "react";
import { toggleLessonCompleteAction } from "@/lib/actions/progress";
import { cn } from "@/lib/utils";

interface MarkCompleteButtonProps {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
}

export function MarkCompleteButton({
  courseId,
  lessonId,
  initialCompleted,
}: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    setCompleted(!completed);
    startTransition(async () => {
      try {
        const result = await toggleLessonCompleteAction(courseId, lessonId);
        setCompleted(result);
      } catch {
        setCompleted(completed);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
        completed
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Checkbox */}
      <span
        className={cn(
          "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          completed
            ? "border-primary bg-primary"
            : "border-muted-foreground/40"
        )}
      >
        {completed && (
          <svg
            className="h-3 w-3 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        )}
      </span>
      <span className="text-[13px] font-medium">
        {completed ? "Completed" : "Mark Complete"}
      </span>
    </button>
  );
}
