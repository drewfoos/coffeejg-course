"use client";

import { useState, useTransition } from "react";
import { createLessonAction } from "@/lib/actions/admin";
import Link from "next/link";

const inputClass =
  "block w-full rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-sm transition-all duration-150 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40";

const labelClass = "text-[13px] font-semibold text-foreground/80";

export function CreateLessonForm({
  courseId,
  nextOrder,
  existingSections = [],
  isFreeCourse = false,
}: {
  courseId: string;
  nextOrder: number;
  existingSections?: string[];
  isFreeCourse?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdLessonId, setCreatedLessonId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setCreatedLessonId(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

    startTransition(async () => {
      try {
        const result = await createLessonAction(courseId, {
          title: (fd.get("title") as string) ?? "",
          vimeoVideoId: (fd.get("vimeoVideoId") as string) ?? "",
          isFree: isFreeCourse || fd.get("isFree") === "on",
          order: nextOrder,
          durationMinutes: parseFloat(fd.get("durationMinutes") as string) || 0,
          section: (fd.get("section") as string) ?? "",
          description: (fd.get("description") as string) ?? "",
          topics: (fd.get("topics") as string) ?? "",
          content: "",
          blocks: (fd.get("blocks") as string) ?? "[]",
        });
        setCreatedLessonId(result.lessonId);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  };

  // Success state — full takeover
  if (createdLessonId) {
    return (
      <div className="mt-6 max-w-lg">
        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold">Lesson Created</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add rich content with the visual editor
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href={`/admin/courses/${courseId}/lessons/${createdLessonId}/content`}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
            >
              Open Content Editor
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setCreatedLessonId(null)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Add another lesson instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
      {/* ── Card: Basic Info ── */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Lesson Details
        </div>

        <div>
          <label className={labelClass}>
            Title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Setting Up OBS for VTubing"
            className={`mt-1.5 ${inputClass}`}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground/50">
            URL slug generated automatically from the title
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={2}
            maxLength={2000}
            placeholder="What will students learn in this lesson?"
            className={`mt-1.5 ${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Section <span className="text-red-400">*</span>
            </label>
            <input
              name="section"
              required
              list="section-suggestions-create"
              placeholder="e.g. Getting Started"
              className={`mt-1.5 ${inputClass}`}
            />
            {existingSections.length > 0 && (
              <datalist id="section-suggestions-create">
                {existingSections.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
            <p className="mt-1.5 text-[11px] text-muted-foreground/50">
              Groups lessons in sidebar
              {existingSections.length > 0 && " — type to search"}
            </p>
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
                placeholder="12.5"
                className={`${inputClass} pr-14`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40">
                min
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Topics Covered <span className="text-red-400">*</span>
          </label>
          <textarea
            name="topics"
            required
            rows={3}
            placeholder={"OBS setup and configuration\nScene and source management\nAudio mixing basics"}
            className={`mt-1.5 ${inputClass} resize-y font-mono text-[13px]`}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground/50">
            One per line — displayed as Table of Contents
          </p>
        </div>
      </div>

      {/* ── Card: Video & Access ── */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Video &amp; Access
        </div>

        <div>
          <label className={labelClass}>Vimeo Video ID</label>
          <input
            name="vimeoVideoId"
            placeholder="123456789 or paste full Vimeo URL"
            className={`mt-1.5 ${inputClass}`}
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground/50">
            Accepts a numeric ID or full vimeo.com link
          </p>
        </div>

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
                <p className="text-[11px] text-muted-foreground">This course is marked as free, so every lesson is accessible to everyone</p>
              </div>
            </div>
          </>
        ) : (
          <label className="group flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3 cursor-pointer transition-all hover:bg-accent/30 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
            <div className="relative">
              <input
                type="checkbox"
                name="isFree"
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Free preview</p>
              <p className="text-[11px] text-muted-foreground">Anyone can watch this lesson without purchasing</p>
            </div>
          </label>
        )}
      </div>

      {/* ── Card: Content ── */}
      <div className="rounded-2xl border border-border/40 bg-card/50 p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          Content
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-border/40 bg-muted/10 px-5 py-4">
          <svg className="h-5 w-5 shrink-0 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          <div>
            <p className="text-sm text-muted-foreground">
              Rich content can be added after creating the lesson
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">
              Use the full-page editor to add text, code, images, videos, columns, and more
            </p>
          </div>
        </div>
        <input type="hidden" name="blocks" value="[]" />
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-50 active:scale-[0.98]"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating...
            </span>
          ) : (
            "Create Lesson"
          )}
        </button>
        <p className="text-[11px] text-muted-foreground/40">
          Will be added as lesson #{nextOrder}
        </p>
      </div>
    </form>
  );
}
