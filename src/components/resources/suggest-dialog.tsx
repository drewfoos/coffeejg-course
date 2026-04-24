"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Turnstile } from "@/components/auth/turnstile";
import { suggestResourceAction } from "@/lib/actions/suggest-resource";
import { normalizeResourceUrl } from "@/lib/resource-url";
import { RESOURCE_TAGS } from "@/lib/resource-taxonomy";
import { cn } from "@/lib/utils";

const ALLOWED_HOSTS_LABEL = "Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io";

function validateImageUrlShape(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "Must be an http(s) link.";
    }
    return null;
  } catch {
    return "Not a valid URL.";
  }
}

const SUGGEST_BUTTON_CLASSES =
  "flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground";

function SuggestButtonContent() {
  return (
    <>
      <svg
        className="h-4 w-4 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      Suggest
    </>
  );
}

export function SuggestResourceDialog({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  if (!isAuthenticated) {
    return (
      <Link href="/login?next=/resources" className={SUGGEST_BUTTON_CLASSES}>
        <SuggestButtonContent />
      </Link>
    );
  }

  return <AuthedSuggestDialog />;
}

function AuthedSuggestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const trimmedUrl = url.trim();
  const normalized = useMemo(
    () => (trimmedUrl ? normalizeResourceUrl(trimmedUrl) : null),
    [trimmedUrl]
  );
  const urlIsInvalid = trimmedUrl.length > 0 && normalized === null;
  const imageUrlError = useMemo(() => validateImageUrlShape(imageUrl), [imageUrl]);

  const canSubmit =
    !loading &&
    title.trim().length > 0 &&
    artistName.trim().length > 0 &&
    description.trim().length > 0 &&
    !!normalized &&
    imageUrl.trim().length > 0 &&
    !imageUrlError;

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const reset = () => {
    setTitle("");
    setArtistName("");
    setDescription("");
    setUrl("");
    setImageUrl("");
    setTags([]);
    setError("");
    setSent(false);
    setLoading(false);
    setTurnstileToken("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset after the close animation so we don't flash the form
      setTimeout(reset, 200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const result = await suggestResourceAction({
        url,
        title,
        artistName,
        description,
        imageUrl,
        tags,
        turnstileToken,
      });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button type="button" className={SUGGEST_BUTTON_CLASSES} />
        }
      >
        <SuggestButtonContent />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin pr-5">
        {sent ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <DialogTitle>Thanks for the suggestion!</DialogTitle>
            <DialogDescription className="mt-2">
              We&apos;ll review it and add it to the hub if it&apos;s a good fit.
            </DialogDescription>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => reset()}>
                Suggest another
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Suggest a resource</DialogTitle>
              <DialogDescription>
                Fill in the details and we&apos;ll review it for the hub.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              aria-busy={loading}
            >
              <div className="space-y-1.5">
                <Label htmlFor="suggest-title">Title</Label>
                <Input
                  id="suggest-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon cyberpunk overlay pack"
                  required
                  maxLength={200}
                  autoComplete="off"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="suggest-artist">Artist / creator name</Label>
                <Input
                  id="suggest-artist"
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Who made it?"
                  required
                  maxLength={200}
                  autoComplete="off"
                  disabled={loading}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="suggest-description">Description</Label>
                <Textarea
                  id="suggest-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is it? Why's it worth adding?"
                  required
                  rows={3}
                  maxLength={2000}
                  disabled={loading}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {description.length}/2000
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="suggest-url">Resource URL</Label>
                <Input
                  id="suggest-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ko-fi.com/s/..."
                  required
                  maxLength={500}
                  autoComplete="off"
                  aria-invalid={urlIsInvalid || undefined}
                  disabled={loading}
                  className="h-10"
                />
                {normalized ? (
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {normalized.source} link looks good
                  </p>
                ) : urlIsInvalid ? (
                  <p className="text-xs text-destructive">
                    Must be a link on {ALLOWED_HOSTS_LABEL}.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Must be a link on {ALLOWED_HOSTS_LABEL}.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="suggest-image-url">Image URL</Label>
                <Input
                  id="suggest-image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../preview.png"
                  required
                  maxLength={1000}
                  autoComplete="off"
                  aria-invalid={!!imageUrlError || undefined}
                  disabled={loading}
                  className="h-10"
                />
                {imageUrlError ? (
                  <p className="text-xs text-destructive">{imageUrlError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Direct link to a preview image.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Suggested tags{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {RESOURCE_TAGS.map((tag) => {
                    const active = tags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        disabled={loading}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
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
                <p className="text-xs text-muted-foreground">
                  Pick any that apply — we&apos;ll use them as a starting point.
                </p>
              </div>

              <Turnstile
                onVerify={handleVerify}
                onExpire={() => setTurnstileToken("")}
              />

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
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

              <Button
                type="submit"
                className="h-10 w-full text-sm font-medium"
                disabled={!canSubmit}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  "Submit suggestion"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
