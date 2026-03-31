"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SourceIcon } from "./source-icon";
import { ChevronDown } from "lucide-react";

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
];

const SOURCES = ["Ko-fi", "Booth", "VGen", "Gumroad"];

/** Source pills — displayed in the hero section */
export function SourceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSource = searchParams.get("source") ?? "";

  const updateSource = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("source", value);
    } else {
      params.delete("source");
    }
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <FilterPill
        label="All Sources"
        active={activeSource === ""}
        onClick={() => updateSource("")}
      />
      {SOURCES.map((source) => (
        <FilterPill
          key={source}
          label={source}
          icon={<SourceIcon source={source} className="h-3.5 w-3.5" />}
          active={activeSource === source}
          onClick={() =>
            updateSource(activeSource === source ? "" : source)
          }
        />
      ))}
    </div>
  );
}

/** Category dropdown — displayed above results grid */
export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag") ?? "";

  const updateTag = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("tag", value);
    } else {
      params.delete("tag");
    }
    params.delete("page");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="relative inline-block">
      <select
        value={activeTag}
        onChange={(e) => updateTag(e.target.value)}
        className="appearance-none rounded-lg border border-border/40 bg-card/60 py-2 pl-3 pr-8 text-sm font-medium text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option value="">All Categories</option>
        {TAGS.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
