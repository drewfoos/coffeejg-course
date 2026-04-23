"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SourceIcon } from "./source-icon";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

const TAGS = [
  "2D",
  "3D",
  "Overlays & Alerts",
  "Emotes/Stickers/Badges",
  "Character Assets",
  "Clothing/Accessories",
  "Live2D/3D/PNGtuber Models",
  "VRoid",
  "VRM",
  "VRChat",
  "Backgrounds",
  "Background Music",
  "Schedules",
  "Panels",
  "Thumbnails",
  "Objects",
  "Hands",
  "Outfits",
  "Badges",
  "Emotes",
  "Guides",
];

const SOURCES = ["Ko-fi", "Booth", "VGen", "Gumroad", "Twitter/X", "itch.io"];

function parseList(param: string | null): string[] {
  if (!param) return [];
  return param.split(",").filter(Boolean);
}

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTags = parseList(searchParams.get("tags"));
  const activeSources = parseList(searchParams.get("sources"));
  const activeCount = activeTags.length + activeSources.length;

  const [pendingTags, setPendingTags] = useState<string[]>(activeTags);
  const [pendingSources, setPendingSources] = useState<string[]>(activeSources);

  const resetPending = () => {
    setPendingTags(parseList(searchParams.get("tags")));
    setPendingSources(parseList(searchParams.get("sources")));
  };

  const toggleTag = (tag: string) =>
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const toggleSource = (source: string) =>
    setPendingSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (pendingTags.length > 0) {
      params.set("tags", pendingTags.join(","));
    } else {
      params.delete("tags");
    }
    if (pendingSources.length > 0) {
      params.set("sources", pendingSources.join(","));
    } else {
      params.delete("sources");
    }
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  const clearFilters = () => {
    setPendingTags([]);
    setPendingSources([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    params.delete("sources");
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  const pendingCount = pendingTags.length + pendingSources.length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Sheet onOpenChange={(open) => open && resetPending()}>
        <SheetTrigger
          className={cn(
            "flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors",
            activeCount > 0
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border/50 bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground backdrop-blur-sm"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>
              Select categories and sources to narrow results.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {/* Sources */}
            <div className="mb-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((source) => {
                  const active = pendingSources.includes(source);
                  return (
                    <button
                      key={source}
                      onClick={() => toggleSource(source)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <SourceIcon source={source} className="h-3.5 w-3.5" />
                      {source}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => {
                  const active = pendingTags.includes(tag);
                  return (
                    <button
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
            </div>
          </div>

          <SheetFooter className="border-t border-border/50 pt-4">
            <div className="flex w-full items-center gap-2">
              {(pendingCount > 0 || activeCount > 0) && (
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    />
                  }
                >
                  Clear all
                </SheetClose>
              )}
              <SheetClose
                render={
                  <Button className="ml-auto" onClick={applyFilters} />
                }
              >
                Apply{pendingCount > 0 ? ` (${pendingCount})` : ""}
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Active filter pills — shown inline next to the button */}
      {activeCount > 0 && (
        <>
          {activeSources.map((source) => (
            <ActivePill
              key={source}
              label={source}
              icon={<SourceIcon source={source} className="h-3 w-3" />}
              onRemove={() => {
                const next = activeSources.filter((s) => s !== source);
                const params = new URLSearchParams(searchParams.toString());
                if (next.length > 0) params.set("sources", next.join(","));
                else params.delete("sources");
                params.delete("page");
                router.push(`/resources?${params.toString()}`);
              }}
            />
          ))}
          {activeTags.map((tag) => (
            <ActivePill
              key={tag}
              label={tag}
              onRemove={() => {
                const next = activeTags.filter((t) => t !== tag);
                const params = new URLSearchParams(searchParams.toString());
                if (next.length > 0) params.set("tags", next.join(","));
                else params.delete("tags");
                params.delete("page");
                router.push(`/resources?${params.toString()}`);
              }}
            />
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-primary transition-colors hover:text-primary/80"
          >
            Clear all
          </button>
        </>
      )}
    </div>
  );
}

function ActivePill({
  label,
  icon,
  onRemove,
}: {
  label: string;
  icon?: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {icon}
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
