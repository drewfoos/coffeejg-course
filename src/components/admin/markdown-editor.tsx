"use client";

import { useState } from "react";
import { LessonMarkdown } from "@/components/course/lesson-markdown";

export function MarkdownEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Lesson Article (Markdown)
        </label>
        <div className="flex rounded-md border border-border/50 text-xs">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`px-3 py-1 transition-colors ${
              tab === "write"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`px-3 py-1 border-l border-border/50 transition-colors ${
              tab === "preview"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {tab === "write" ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={16}
          placeholder={`Write your lesson content using Markdown...

## Getting Started

Explain the concept here. You can use:

- **Bold text** for emphasis
- \`code\` for inline code
- Lists, headings, links, and more

## Step-by-Step Guide

1. First step
2. Second step
3. Third step

> Tip: Use headings (## ) to create sections. They automatically appear in the Table of Contents.`}
          className="mt-1.5 block w-full rounded-md border border-border/50 bg-background px-4 py-3 font-mono text-sm leading-relaxed focus:border-primary focus:outline-none"
        />
      ) : (
        <div className="mt-1.5 min-h-[400px] rounded-md border border-border/50 bg-card p-6">
          {value ? (
            <LessonMarkdown content={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Nothing to preview. Switch to Write and add some content.
            </p>
          )}
        </div>
      )}

      <p className="mt-1 text-xs text-muted-foreground">
        Use Markdown formatting. Headings (## ) automatically create a Table of Contents with clickable links.
      </p>
    </div>
  );
}
