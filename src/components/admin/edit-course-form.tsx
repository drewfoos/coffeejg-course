"use client";

import { useState, useTransition } from "react";
import { updateCourseAction } from "@/lib/actions/admin";
import type { CourseWithId } from "@/lib/firestore/courses";

export function EditCourseForm({ course }: { course: CourseWithId }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(course.isFree);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateCourseAction(course.id, {
          title: (fd.get("title") as string) ?? "",
          description: (fd.get("description") as string) ?? "",
          isFree,
          thumbnailUrl: (fd.get("thumbnailUrl") as string) ?? "",
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5 max-w-xl">
      {/* Read-only ID */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          Course ID
        </label>
        <div className="mt-1.5 rounded-md border border-border/30 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {course.id}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          This is used in the URL and cannot be changed.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          defaultValue={course.title}
          required
          maxLength={100}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={course.description}
          rows={3}
          maxLength={1000}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Thumbnail URL</label>
        <input
          name="thumbnailUrl"
          defaultValue={course.thumbnailUrl}
          type="url"
          placeholder="https://..."
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="rounded-md border border-border/50 p-4 space-y-4">
        <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="rounded border-border h-4 w-4"
          />
          This is a free course
        </label>

        {!isFree && (
          <p className="text-xs text-muted-foreground">
            Paid courses use the Stripe prices configured in environment variables.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        {saved && (
          <span className="rounded-md bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-500">
            Changes saved successfully
          </span>
        )}
      </div>
    </form>
  );
}
