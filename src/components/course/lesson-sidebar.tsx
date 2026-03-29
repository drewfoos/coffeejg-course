"use client";

import { useState } from "react";
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
  return `${minutes} min`;
}

interface Section {
  name: string;
  lessons: LessonWithId[];
}

function groupBySection(lessons: LessonWithId[]): Section[] {
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
        const sectionCompleted = section.lessons.filter(
          (l) => progress[l.id]
        ).length;

        return (
          <div key={section.name}>
            {/* Section header */}
            <button
              onClick={() => toggleSection(section.name)}
              className="flex w-full cursor-pointer items-center gap-2.5 border-b border-border/50 bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted"
            >
              <svg
                className={cn(
                  "h-2.5 w-2.5 shrink-0 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-90"
                )}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="flex-1 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.name}
              </span>
              <span className="text-[11px] text-muted-foreground/70">
                {sectionCompleted} / {section.lessons.length}
              </span>
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
                        "group flex items-center gap-3 border-b border-border/30 px-4 py-2.5 text-[13px] transition-colors",
                        isCurrent
                          ? "bg-accent/80"
                          : "hover:bg-accent/40"
                      )}
                    >
                      {/* Status icon */}
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {isCompleted ? (
                          <svg
                            className="h-[18px] w-[18px] text-green-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            strokeWidth={2.5}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : !isAccessible ? (
                          <svg
                            className="h-3.5 w-3.5 text-muted-foreground/60"
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
                        ) : (
                          <span
                            className={cn(
                              "flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px]",
                              isCurrent
                                ? "bg-primary text-white font-bold"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {lesson.order}
                          </span>
                        )}
                      </span>

                      {/* Title + duration */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "line-clamp-1 block",
                            isCurrent
                              ? "font-medium text-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {lesson.title}
                        </span>
                      </div>

                      {/* Right side: duration + free badge */}
                      <div className="flex shrink-0 items-center gap-2">
                        {lesson.isFree && (
                          <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-500">
                            FREE
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground/60">
                          {formatDuration(lesson.durationSeconds)}
                        </span>
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
