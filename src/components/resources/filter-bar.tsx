"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SourceIcon } from "./source-icon";

const TAGS = [
  "2D",
  "Emotes/Stickers/Badges",
  "Clothing/Accessories",
  "Props",
  "Panels & Banners",
  "Backgrounds",
  "Assets",
  "Holiday",
  "Easter",
  "Twitch",
];

const SOURCES = ["Ko-fi", "Booth", "Gumroad", "Free", "itch.io", "GitHub", "Other"];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") ?? "";
  const activeSource = searchParams.get("source") ?? "";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("cursor");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Tags */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="All"
            active={activeTag === ""}
            onClick={() => updateFilters("tag", "")}
          />
          {TAGS.map((tag) => (
            <FilterPill
              key={tag}
              label={tag}
              active={activeTag === tag}
              onClick={() =>
                updateFilters("tag", activeTag === tag ? "" : tag)
              }
            />
          ))}
        </div>
      </div>

      {/* Sources */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Source
        </p>
        <div className="flex flex-wrap gap-2">
          <FilterPill
            label="All"
            active={activeSource === ""}
            onClick={() => updateFilters("source", "")}
          />
          {SOURCES.map((source) => (
            <FilterPill
              key={source}
              label={source}
              icon={<SourceIcon source={source} className="h-3.5 w-3.5" />}
              active={activeSource === source}
              onClick={() =>
                updateFilters(
                  "source",
                  activeSource === source ? "" : source
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
