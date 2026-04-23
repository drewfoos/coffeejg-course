"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
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

const ALLOWED_HOSTS_LABEL = "Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io";

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
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const reset = () => {
    setUrl("");
    setNote("");
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
      const result = await suggestResourceAction(url, note, turnstileToken);
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

      <DialogContent className="sm:max-w-md">
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
                Drop a link and we&apos;ll review it for the hub.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Must be a link on {ALLOWED_HOSTS_LABEL}.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="suggest-note">
                  Note <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="suggest-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything we should know?"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-right text-xs text-muted-foreground">
                  {note.length}/500
                </p>
              </div>

              <Turnstile
                onVerify={handleVerify}
                onExpire={() => setTurnstileToken("")}
              />

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-10 w-full text-sm font-medium"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit suggestion"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
