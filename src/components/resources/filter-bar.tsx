"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SourceIcon } from "./source-icon";

const TAGS = [
  "2D",
  "3D",
  "Overlays & Alerts",
  "Emotes/Stickers/Badges",
  "Character Assets",
  "Backgrounds",
  "Panels & Banners",
  "Clothing/Accessories",
  "Props",
  "Live2D/3D/PNGtuber Models",
  "Transition Screens",
  "Debut Assets",
  "Streaming",
  "Twitch",
  "Holiday",
  "VRoid",
  "VRM",
  "VRChat",
];

const SOURCES = ["Ko-fi", "Booth", "VGen", "Gumroad"];

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
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Categories — horizontal scroll on mobile, wrap on desktop */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:flex-wrap md:justify-center md:overflow-x-visible md:pb-0">
          <FilterPill
            label="All Categories"
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

      {/* Sources — narrower row beneath */}
      <div className="flex flex-wrap justify-center gap-2">
        <FilterPill
          label="All Sources"
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
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-card/60 text-muted-foreground backdrop-blur-sm hover:bg-card hover:text-foreground border border-border/40"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
