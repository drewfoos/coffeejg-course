"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import type { Value } from "platejs";
import { updateLessonBlocksAction } from "@/lib/actions/admin";
import { PlateContentEditor } from "./plate-editor";

export function ContentEditorPage({
  courseId,
  lessonId,
  initialBlocks,
}: {
  courseId: string;
  lessonId: string;
  initialBlocks: Value;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const valueRef = useRef<Value>(initialBlocks);

  const handleChange = useCallback((value: Value) => {
    valueRef.current = value;
  }, []);

  const handleSave = () => {
    setStatus("idle");
    setError(null);
    const blocksJson = JSON.stringify(valueRef.current);

    startTransition(async () => {
      try {
        await updateLessonBlocksAction(courseId, lessonId, blocksJson);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
        setStatus("error");
      }
    });
  };

  return (
    <div>
      {/* Hint */}
      <p className="mb-4 text-xs text-muted-foreground/60">
        Type <kbd className="mx-0.5 rounded border border-border/60 bg-muted/50 px-1 py-0.5 font-mono text-[10px]">/</kbd> for
        commands or use the toolbar above
      </p>

      <PlateContentEditor
        initialValue={initialBlocks}
        onChange={handleChange}
      />

      {/* Sticky save bar */}
      <div className="sticky bottom-0 z-20 mt-4 rounded-lg border border-border/40 bg-card/95 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            {status === "saved" && (
              <span className="flex items-center gap-1.5 text-green-500 animate-in fade-in duration-200">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Saved
              </span>
            )}
            {status === "error" && error && (
              <span className="text-red-500 text-xs">{error}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground/40">Ctrl+S to save</span>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
