"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


const TAGS = [
  "VTuber Model",
  "Texture",
  "Tool",
  "Reference",
  "Animation",
  "Accessory",
  "Background",
  "Audio",
  "3D",
  "2D",
  "VRM",
  "Live2D",
];

const SOURCES = ["Booth", "Gumroad", "Free", "itch.io", "GitHub", "Other"];

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
    // Reset pagination when filters change
    params.delete("cursor");
    router.push(`/resources?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">Tags</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={activeTag === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => updateFilters("tag", "")}
          >
            All
          </Badge>
          {TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                updateFilters("tag", activeTag === tag ? "" : tag)
              }
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">
          Source
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSource === "" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilters("source", "")}
          >
            All
          </Button>
          {SOURCES.map((source) => (
            <Button
              key={source}
              variant={activeSource === source ? "default" : "outline"}
              size="sm"
              onClick={() =>
                updateFilters(
                  "source",
                  activeSource === source ? "" : source
                )
              }
            >
              {source}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
