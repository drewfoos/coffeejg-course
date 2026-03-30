"use client";

import { useState, useTransition } from "react";
import {
  updateLessonAction,
  deleteLessonAction,
  reorderLessonsAction,
} from "@/lib/actions/admin";
import type { LessonWithId } from "@/lib/firestore/lessons";
import Link from "next/link";

const inputClass =
  "block w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm transition-all duration-150 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40";

const labelClass = "text-[13px] font-semibold text-foreground/80";

function EditLessonRow({
  courseId,
  lesson,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isReordering,
  existingSections = [],
  isFreeCourse = false,
}: {
  courseId: string;
  lesson: LessonWithId;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
  existingSections?: string[];
  isFreeCourse?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      await deleteLessonAction(courseId, lesson.id);
      setConfirming(false);
    });
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateLessonAction(courseId, lesson.id, {
          title: (fd.get("title") as string) ?? "",
          vimeoVideoId: (fd.get("vimeoVideoId") as string) ?? "",
          isFree: isFreeCourse || fd.get("isFree") === "on",
          durationMinutes: parseFloat(fd.get("durationMinutes") as string) || 0,
          section: (fd.get("section") as string) ?? "",
          description: (fd.get("description") as string) ?? "",
          topics: (fd.get("topics") as string) ?? "",
          content: (fd.get("content") as string) ?? "",
          blocks: (fd.get("blocks") as string) ?? "[]",
        });
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      }
    });
  };

  const hasBlocks = lesson.blocks && lesson.blocks.length > 0;

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="rounded-2xl border-2 border-primary/20 bg-card/80 overflow-hidden"
      >
        {/* Edit header */}
        <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
              {lesson.order}
            </span>
            <span className="text-sm font-medium">Editing Lesson</span>
          </div>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {lesson.id}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Title + Description */}
          <div>
            <label className={labelClass}>
              Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              defaultValue={lesson.title}
              required
              maxLength={120}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label className={labelClass}>
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              defaultValue={lesson.description ?? ""}
              required
              rows={2}
              maxLength={2000}
              className={`mt-1.5 ${inputClass} resize-y`}
            />
          </div>

          {/* Section + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Section <span className="text-red-400">*</span>
              </label>
              <input
                name="section"
                required
                list={`section-suggestions-${lesson.id}`}
                defaultValue={lesson.section ?? ""}
                placeholder="e.g. Getting Started"
                className={`mt-1.5 ${inputClass}`}
              />
              {existingSections.length > 0 && (
                <datalist id={`section-suggestions-${lesson.id}`}>
                  {existingSections.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              )}
            </div>
            <div>
              <label className={labelClass}>
                Duration <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  name="durationMinutes"
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  defaultValue={Math.round((lesson.durationSeconds / 60) * 10) / 10}
                  className={`${inputClass} pr-14`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Vimeo */}
          <div>
            <label className={labelClass}>Vimeo Video ID</label>
            <input
              name="vimeoVideoId"
              defaultValue={lesson.vimeoVideoId}
              placeholder="123456789 or Vimeo URL"
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          {/* Topics */}
          <div>
            <label className={labelClass}>
              Topics Covered <span className="text-red-400">*</span>
            </label>
            <textarea
              name="topics"
              required
              defaultValue={(lesson.topics ?? []).join("\n")}
              rows={3}
              placeholder="One topic per line"
              className={`mt-1.5 ${inputClass} resize-y font-mono text-[13px]`}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground/50">
              One per line — displayed as Table of Contents
            </p>
          </div>

          {/* Content blocks — link to full editor */}
          <div className="flex items-center justify-between rounded-xl border border-border/30 bg-muted/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Content Blocks</p>
                <p className="text-[11px] text-muted-foreground">
                  {hasBlocks
                    ? `${lesson.blocks!.length} block${lesson.blocks!.length !== 1 ? "s" : ""}`
                    : "No content yet"}
                </p>
              </div>
            </div>
            <Link
              href={`/admin/courses/${courseId}/lessons/${lesson.id}/content`}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {hasBlocks ? "Edit" : "Add"}
            </Link>
          </div>

          {/* Hidden fields to preserve blocks/content on save */}
          <input type="hidden" name="content" value={lesson.content ?? ""} />
          <input type="hidden" name="blocks" value={JSON.stringify(lesson.blocks ?? [])} />

          {/* Free preview toggle */}
          {isFreeCourse ? (
            <>
              <input type="hidden" name="isFree" value="on" />
              <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Free course — all lessons are free</p>
                  <p className="text-[11px] text-muted-foreground">Cannot be changed per-lesson on a free course</p>
                </div>
              </div>
            </>
          ) : (
            <label className="group flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3 cursor-pointer transition-all hover:bg-accent/30 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isFree"
                  defaultChecked={lesson.isFree}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Free preview</p>
                <p className="text-[11px] text-muted-foreground">Anyone can watch without purchasing</p>
              </div>
            </label>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setError(null); }}
              className="rounded-xl border border-border/40 px-5 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="group flex items-center justify-between rounded-xl border border-border/40 bg-card/50 px-4 py-3 transition-all hover:border-border/60 hover:bg-card">
      <div className="flex items-center gap-3 min-w-0">
        {/* Reorder buttons */}
        <div className="flex flex-col gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onMoveUp}
            disabled={isFirst || isReordering}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-0"
            aria-label="Move up"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 320 512">
              <path d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast || isReordering}
            className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-0"
            aria-label="Move down"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 320 512">
              <path d="M137.4 374.6c12.5 12.5 32.8 12.5 45.3 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9s-16.6-19.8-29.6-19.8H32c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9l128 128z" />
            </svg>
          </button>
        </div>

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-xs font-bold text-muted-foreground/70">
          {lesson.order}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{lesson.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {lesson.section && (
              <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {lesson.section}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground/50">
              {Math.round(lesson.durationSeconds / 60)}min
            </span>
            {lesson.isFree && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                FREE
              </span>
            )}
            {hasBlocks && (
              <span className="text-[11px] text-muted-foreground/50">
                {lesson.blocks!.length} blocks
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        <Link
          href={`/admin/courses/${courseId}/lessons/${lesson.id}/content`}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Content
        </Link>
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Edit
        </button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {isPending ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export function LessonList({
  courseId,
  lessons: initialLessons,
  existingSections = [],
  isFreeCourse = false,
}: {
  courseId: string;
  lessons: LessonWithId[];
  existingSections?: string[];
  isFreeCourse?: boolean;
}) {
  const [lessons, setLessons] = useState(initialLessons);
  const [isReordering, startReorder] = useTransition();

  const handleMove = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= lessons.length) return;

    const reordered = [...lessons];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    const updated = reordered.map((l, i) => ({ ...l, order: i + 1 }));
    setLessons(updated);

    startReorder(async () => {
      await reorderLessonsAction(
        courseId,
        updated.map((l) => l.id)
      );
    });
  };

  return (
    <div className="mt-4 space-y-2">
      {lessons.map((lesson, index) => (
        <EditLessonRow
          key={lesson.id}
          courseId={courseId}
          lesson={lesson}
          onMoveUp={() => handleMove(index, "up")}
          onMoveDown={() => handleMove(index, "down")}
          isFirst={index === 0}
          isLast={index === lessons.length - 1}
          isReordering={isReordering}
          existingSections={existingSections}
          isFreeCourse={isFreeCourse}
        />
      ))}
      {lessons.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/30 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/40">
            <svg className="h-5 w-5 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="mt-3 text-sm text-muted-foreground/60">
            No lessons yet — add your first one below
          </p>
        </div>
      )}
    </div>
  );
}
