"use client";

import { useState } from "react";
import { LessonSidebar } from "./lesson-sidebar";
import type { SidebarLesson } from "./lesson-sidebar";

interface CourseSidebarWrapperProps {
  courseTitle: string;
  completedCount: number;
  totalCount: number;
  isEnrolled: boolean;
  lessons: SidebarLesson[];
  courseId: string;
  currentLessonId: string;
  progressMap: Record<string, boolean>;
}

export function CourseSidebarWrapper({
  courseTitle,
  completedCount,
  totalCount,
  isEnrolled,
  lessons,
  courseId,
  currentLessonId,
  progressMap,
}: CourseSidebarWrapperProps) {
  const [open, setOpen] = useState(true);

  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const circumference = 2 * Math.PI * 15.5;
  const dashOffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      {/* Sidebar — fixed position, own scroll */}
      <aside
        className={`fixed top-[calc(4rem+14px)] bottom-0 left-0 z-20 hidden rounded bg-card transition-all duration-200 lg:block ${
          open ? "w-80" : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex h-full w-80 flex-col">
          {/* Course header — matches NeetCode sidebar-header */}
          <div className="border-b border-border/50 px-2.5 pt-3 pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Circular progress */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="2.5"
                      className="stroke-border/40"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="2.5"
                      className="stroke-primary transition-all duration-300"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-bold text-muted-foreground">
                    {completedCount}/{totalCount}
                  </span>
                </div>
                <h2 className="text-[17px] font-semibold leading-[1.5]">
                  {courseTitle}
                </h2>
              </div>
              {/* Collapse button */}
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Collapse sidebar"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 320 512"
                >
                  <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lesson list — sidebar has its own scroll */}
          <div className="flex-1 overflow-y-auto">
            <LessonSidebar
              lessons={lessons}
              courseId={courseId}
              currentLessonId={currentLessonId}
              progress={progressMap}
              isEnrolled={isEnrolled}
            />
          </div>
        </div>
      </aside>

      {/* Expand button — only visible when collapsed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 cursor-pointer lg:block"
          aria-label="Open sidebar"
        >
          <div className="flex h-8 w-5 items-center justify-center rounded-r-md border border-l-0 bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <svg
              className="h-3 w-3"
              fill="currentColor"
              viewBox="0 0 320 512"
            >
              <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
            </svg>
          </div>
        </button>
      )}

      {/* Spacer to offset main content */}
      {open && <div className="hidden w-80 shrink-0 lg:block" />}
    </>
  );
}
