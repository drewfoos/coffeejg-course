"use client";

import { useState } from "react";
import { HeartButton } from "./heart-button";
import { AssetDetailModal } from "./asset-detail-modal";
import { SourceIcon } from "./source-icon";
import type { AssetWithId } from "@/lib/firestore/assets";

const MAX_VISIBLE_TAGS = 2;

interface AssetCardProps {
  asset: AssetWithId;
  isFavorited: boolean;
}

export function AssetCard({ asset, isFavorited }: AssetCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const visibleTags = asset.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = asset.tags.slice(MAX_VISIBLE_TAGS);

  return (
    <>
      <div
        className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-border hover:shadow-lg"
        onClick={() => setModalOpen(true)}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.imageUrl}
            alt={asset.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          {/* Free badge */}
          {asset.free && (
            <div className="absolute left-2 top-2">
              <span className="rounded-md bg-emerald-500/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                Free
              </span>
            </div>
          )}
          {/* Heart button */}
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <HeartButton assetId={asset.id} isFavorited={isFavorited} />
          </div>
          {/* Source badge */}
          <div className="absolute bottom-2 left-2">
            <span className="flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              <SourceIcon source={asset.source} className="h-3 w-3" />
              {asset.source}
            </span>
          </div>
        </div>

        {/* Info — fixed heights ensure alignment across cards */}
        <div className="flex flex-1 flex-col p-3.5">
          {/* Title: always 1 line */}
          <h3 className="line-clamp-1 text-sm font-semibold">{asset.title}</h3>
          {/* Artist: always 1 line */}
          <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">
            {asset.artistName}
          </p>
          {/* Description: fixed 2-line height */}
          <p className="mt-1.5 line-clamp-2 h-[calc(2*1.625*12px)] text-[12px] leading-relaxed text-muted-foreground/80">
            {asset.description || "\u00A0"}
          </p>

          {/* Tags + button pushed to bottom */}
          <div className="mt-auto pt-2.5">
            {/* Tags — single row */}
            <div className="flex items-center gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 truncate rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {hiddenTags.length > 0 && (
                <span
                  className="relative shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground [&:hover>span]:visible"
                >
                  +{hiddenTags.length}
                  <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-[11px] font-medium text-popover-foreground shadow-lg">
                    {hiddenTags.join(", ")}
                  </span>
                </span>
              )}
            </div>

            {/* Visit Creator */}
            <a
              href={asset.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 text-[12px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Visit Creator
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <AssetDetailModal
        asset={asset}
        isFavorited={isFavorited}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
