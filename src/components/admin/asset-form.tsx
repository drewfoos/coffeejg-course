"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RESOURCE_TAGS, RESOURCE_SOURCES } from "@/lib/resource-taxonomy";
import { createAssetAction } from "@/lib/actions/admin-resources";
import { cn } from "@/lib/utils";

interface AssetFormProps {
  suggestionId?: string;
  defaults?: {
    externalUrl?: string;
    source?: string;
    note?: string;
  };
}

export function AssetForm({ suggestionId, defaults }: AssetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [description, setDescription] = useState(defaults?.note ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState(defaults?.externalUrl ?? "");
  const [source, setSource] = useState<string>(
    defaults?.source ?? RESOURCE_SOURCES[0]
  );
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await createAssetAction(
          {
            title,
            artistName,
            description,
            imageUrl,
            tags,
            source,
            externalUrl,
            free,
          },
          suggestionId
        );
        router.push(suggestionId ? "/admin/suggestions" : "/admin/assets");
        router.refresh();
        void result;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div>
        <label className="text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          Artist name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          required
          maxLength={200}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={2000}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {suggestionId && defaults?.note && (
          <p className="mt-1 text-xs text-muted-foreground">
            Prefilled from the user&apos;s suggestion note.
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">
          Image URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          maxLength={1000}
          placeholder="https://..."
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium">
          External URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          required
          maxLength={500}
          placeholder="https://ko-fi.com/..."
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Must be on an allowed platform (Ko-fi, Booth, VGen, Gumroad, Twitter/X, itch.io).
        </p>
      </div>

      <div>
        <label className="text-sm font-medium">
          Source <span className="text-red-500">*</span>
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          {RESOURCE_SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">
          Tags <span className="text-red-500">*</span>
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {RESOURCE_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Select at least one. These control which filters match this resource.
        </p>
      </div>

      <div className="rounded-md border border-border/50 p-4">
        <label className="flex items-center gap-2.5 text-sm font-medium cursor-pointer">
          <input
            type="checkbox"
            checked={free}
            onChange={(e) => setFree(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          This resource is free
        </label>
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
          {isPending
            ? "Saving..."
            : suggestionId
              ? "Create asset & mark imported"
              : "Create asset"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
