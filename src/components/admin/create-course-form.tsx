"use client";

import { useState, useTransition } from "react";
import { createCourseAction } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

export function CreateCourseForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isFree, setIsFree] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await createCourseAction({
          title: (fd.get("title") as string) ?? "",
          description: (fd.get("description") as string) ?? "",
          stripePriceId: (fd.get("stripePriceId") as string) ?? "",
          isFree,
          thumbnailUrl: (fd.get("thumbnailUrl") as string) ?? "",
        });
        router.push(`/admin/courses/${result.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-5 max-w-xl">
      <div>
        <label className="text-sm font-medium">
          Course Title <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          required
          maxLength={100}
          placeholder="e.g. VTubing 101: Getting Started"
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This is what students see. A URL-friendly ID will be created automatically.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="What will students learn in this course?"
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Thumbnail URL
        </label>
        <input
          name="thumbnailUrl"
          type="url"
          placeholder="https://example.com/course-thumbnail.jpg"
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Cover image shown on the course page. Use a direct image link.
        </p>
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
          <div>
            <label className="text-sm font-medium">
              Stripe Price ID <span className="text-red-500">*</span>
            </label>
            <input
              name="stripePriceId"
              required={!isFree}
              placeholder="price_1ABC..."
              className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Find this in your{" "}
              <a
                href="https://dashboard.stripe.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Stripe Dashboard
              </a>{" "}
              → Products → select product → copy the Price ID (starts with &quot;price_&quot;).
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Creating Course..." : "Create Course"}
      </button>
    </form>
  );
}
