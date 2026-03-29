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

  return (
    <>
      {/* Sidebar — fixed position, own scroll */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-20 hidden border-r border-border/50 bg-muted/30 transition-all duration-200 lg:block ${
          open ? "w-80" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-full w-80 flex-col">
          {/* Course header */}
          <div className="border-b border-border/50 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[13px] font-bold leading-tight">{courseTitle}</h2>
              <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
            {isEnrolled && totalCount > 0 && (
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-border/50">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                  }}
                />
              </div>
            )}
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

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-1/2 z-30 hidden -translate-y-1/2 cursor-pointer lg:block"
        style={{ left: open ? "318px" : "0px" }}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        <div className="flex h-8 w-5 items-center justify-center rounded-r-md border border-l-0 bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <svg
            className={`h-3 w-3 transition-transform ${open ? "" : "rotate-180"}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Spacer to offset main content */}
      {open && <div className="hidden w-80 shrink-0 lg:block" />}
    </>
  );
}
