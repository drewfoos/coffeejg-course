"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SidebarLesson {
  id: string;
  title: string;
  order: number;
  durationSeconds: number;
  isFree: boolean;
  section?: string;
}

interface LessonSidebarProps {
  lessons: SidebarLesson[];
  courseId: string;
  currentLessonId: string;
  progress: Record<string, boolean>;
  isEnrolled: boolean;
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

interface Section {
  name: string;
  lessons: SidebarLesson[];
}

function groupBySection(lessons: SidebarLesson[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const lesson of lessons) {
    const sectionName = lesson.section || "Lessons";
    if (!current || current.name !== sectionName) {
      current = { name: sectionName, lessons: [] };
      sections.push(current);
    }
    current.lessons.push(lesson);
  }

  return sections;
}

export function LessonSidebar({
  lessons,
  courseId,
  currentLessonId,
  progress,
  isEnrolled,
}: LessonSidebarProps) {
  const sections = groupBySection(lessons);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleSection = (name: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <div>
      {sections.map((section) => {
        const isOpen = !collapsed.has(section.name);

        return (
          <div key={section.name}>
            {/* Section header — NeetCode style */}
            <button
              onClick={() => toggleSection(section.name)}
              className="flex w-full cursor-pointer select-none items-center justify-between border-b border-border/30 bg-muted/40 px-4 py-2.5 text-left transition-colors hover:bg-muted/70"
            >
              <span className="text-[12px] font-semibold text-muted-foreground">
                {section.name}
              </span>
              <svg
                className={cn(
                  "h-3 w-3 shrink-0 text-muted-foreground/60 transition-transform duration-150",
                  !isOpen && "-rotate-90"
                )}
                fill="currentColor"
                viewBox="0 0 512 512"
              >
                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
              </svg>
            </button>

            {/* Section lessons */}
            {isOpen && (
              <div>
                {section.lessons.map((lesson) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = progress[lesson.id] ?? false;
                  const isAccessible = lesson.isFree || isEnrolled;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${courseId}/lessons/${lesson.id}`}
                      className={cn(
                        "flex select-none items-center justify-between border-b border-border/20 px-4 py-2.5 transition-colors",
                        isCurrent
                          ? "bg-accent"
                          : "hover:bg-accent/40"
                      )}
                    >
                      {/* Left: number + title */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "shrink-0 text-[13px] tabular-nums",
                            isCompleted
                              ? "font-bold text-primary"
                              : "text-muted-foreground/60"
                          )}
                        >
                          {isCompleted ? (
                            <svg
                              className="h-4 w-4 text-primary"
                              viewBox="0 0 24 24"
                              fill="none"
                              strokeWidth={2.5}
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                          ) : (
                            lesson.order
                          )}
                        </span>
                        <span className="shrink-0 text-border">|</span>
                        <span
                          className={cn(
                            "truncate text-[13px] font-semibold",
                            isCurrent
                              ? "text-foreground"
                              : "text-foreground/80"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </div>

                      {/* Right: duration badge + FREE badge / lock */}
                      <div className="flex shrink-0 items-center gap-[5px] ml-3">
                        <span className="rounded border border-muted-foreground/40 px-1 text-[11px] text-muted-foreground/60 whitespace-nowrap">
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                        {lesson.isFree && (
                          <span className="rounded border border-primary px-1 text-[11px] font-semibold text-primary whitespace-nowrap">
                            FREE
                          </span>
                        )}
                        {!isAccessible && !lesson.isFree && (
                          <svg
                            className="h-3 w-3 text-muted-foreground/40"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                            />
                          </svg>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
