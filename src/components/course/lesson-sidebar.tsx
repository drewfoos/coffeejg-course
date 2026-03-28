"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LessonWithId } from "@/lib/firestore/lessons";

interface LessonSidebarProps {
  lessons: LessonWithId[];
  courseId: string;
  currentLessonId: string;
  progress: Record<string, boolean>;
  isEnrolled: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

export function LessonSidebar({
  lessons,
  courseId,
  currentLessonId,
  progress,
  isEnrolled,
}: LessonSidebarProps) {
  const completedCount = Object.values(progress).filter(Boolean).length;

  return (
    <nav className="space-y-1">
      {isEnrolled && (
        <p className="mb-4 text-sm text-muted-foreground">
          {completedCount} of {lessons.length} complete
        </p>
      )}
      {lessons.map((lesson) => {
        const isCurrent = lesson.id === currentLessonId;
        const isCompleted = progress[lesson.id] ?? false;
        const isAccessible = lesson.isFree || isEnrolled;

        return (
          <Link
            key={lesson.id}
            href={
              isAccessible
                ? `/courses/${courseId}/lessons/${lesson.id}`
                : `/courses/${courseId}`
            }
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isCurrent
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent/50",
              !isAccessible && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs">
              {isCompleted ? (
                <svg className="h-3.5 w-3.5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : !isAccessible ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                lesson.order
              )}
            </span>
            <span className="line-clamp-1 flex-1">{lesson.title}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDuration(lesson.durationSeconds)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
