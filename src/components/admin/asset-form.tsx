"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RESOURCE_TAGS, RESOURCE_SOURCES } from "@/lib/resource-taxonomy";
import { createAssetAction } from "@/lib/actions/admin-resources";
import { normalizeResourceUrl } from "@/lib/resource-url";
import { cn } from "@/lib/utils";

const EXTERNAL_HOSTS_LABEL =
  "Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io";

function validateImageUrlShape(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Not a valid URL.";
  }
  if (parsed.protocol !== "https:") {
    return "Must be an https link.";
  }
  return null;
}

interface AssetFormProps {
  suggestionId?: string;
  defaults?: {
    title?: string;
    artistName?: string;
    description?: string;
    imageUrl?: string;
    externalUrl?: string;
    source?: string;
    tags?: string[];
  };
}

export function AssetForm({ suggestionId, defaults }: AssetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(defaults?.title ?? "");
  const [artistName, setArtistName] = useState(defaults?.artistName ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [imageUrl, setImageUrl] = useState(defaults?.imageUrl ?? "");
  const [externalUrl, setExternalUrl] = useState(defaults?.externalUrl ?? "");
  const [source, setSource] = useState<string>(
    defaults?.source ?? RESOURCE_SOURCES[0]
  );
  const [free, setFree] = useState(true);
  const [tags, setTags] = useState<string[]>(defaults?.tags ?? []);

  const trimmedExternal = externalUrl.trim();
  const normalizedExternal = useMemo(
    () => (trimmedExternal ? normalizeResourceUrl(trimmedExternal) : null),
    [trimmedExternal]
  );
  const externalIsInvalid =
    trimmedExternal.length > 0 && normalizedExternal === null;
  const imageUrlError = useMemo(
    () => validateImageUrlShape(imageUrl),
    [imageUrl]
  );

  const canSubmit =
    !isPending &&
    title.trim().length > 0 &&
    artistName.trim().length > 0 &&
    description.trim().length > 0 &&
    !!normalizedExternal &&
    imageUrl.trim().length > 0 &&
    !imageUrlError &&
    tags.length > 0;

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
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl"
      aria-busy={isPending}
    >
      <fieldset
        disabled={isPending}
        className="space-y-5 border-0 p-0 m-0 min-w-0 disabled:opacity-70"
      >
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
        <label className="text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          maxLength={2000}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        {suggestionId && defaults?.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            Prefilled from the user&apos;s suggestion.
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
          aria-invalid={!!imageUrlError || undefined}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none aria-invalid:border-red-500/60"
        />
        {imageUrlError ? (
          <p className="mt-1 text-xs text-red-500">{imageUrlError}</p>
        ) : suggestionId && defaults?.imageUrl ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Prefilled from the user&apos;s suggestion.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Must be a valid http(s) link. Host must be in{" "}
            <code className="rounded bg-muted px-1">next.config.ts</code> for{" "}
            <code className="rounded bg-muted px-1">next/image</code> to load
            it.
          </p>
        )}
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
          aria-invalid={externalIsInvalid || undefined}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none aria-invalid:border-red-500/60"
        />
        {normalizedExternal ? (
          <p className="mt-1 text-xs text-primary">
            {normalizedExternal.source} link looks good
          </p>
        ) : externalIsInvalid ? (
          <p className="mt-1 text-xs text-red-500">
            Must be a link on {EXTERNAL_HOSTS_LABEL}.
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            Must be on an allowed platform ({EXTERNAL_HOSTS_LABEL}).
          </p>
        )}
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
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500"
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0-10.5a9 9 0 100 18 9 9 0 000-18zm0 14.25h.008v.008H12v-.008z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {isPending
            ? "Saving..."
            : suggestionId
              ? "Create asset & mark imported"
              : "Create asset"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border/50 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      </fieldset>
    </form>
  );
}
