"use client";

import { useState, useTransition } from "react";
import { toggleLessonCompleteAction } from "@/lib/actions/progress";
import { Button } from "@/components/ui/button";
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
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={completed ? "default" : "outline"}
      className={cn(completed && "bg-green-600 hover:bg-green-700")}
    >
      {completed ? (
        <>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Completed
        </>
      ) : (
        "Mark as Complete"
      )}
    </Button>
  );
}
