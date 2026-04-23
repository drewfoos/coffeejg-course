"use client";

import { useState } from "react";
import Image from "next/image";
import { HeartButton } from "./heart-button";
import { AssetDetailModal } from "./asset-detail-modal";
import { SourceIcon } from "./source-icon";
import type { AssetWithId } from "@/lib/firestore/assets";

const MAX_VISIBLE_TAGS = 2;

interface AssetCardProps {
  asset: AssetWithId;
  isFavorited: boolean;
  priority?: boolean;
}

export function AssetCard({ asset, isFavorited, priority = false }: AssetCardProps) {
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
          {asset.imageUrl ? (
            <Image
              src={asset.imageUrl}
              alt={asset.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/[0.08] via-muted to-primary/[0.04]">
              <svg className="h-8 w-8 text-primary/25" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="max-w-[80%] truncate text-xs font-medium text-muted-foreground/40">{asset.source}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          {/* Free badge */}
          {asset.free && (
            <div className="absolute left-2 top-2">
              <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-foreground backdrop-blur-sm">
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
            <span className="flex items-center gap-1.5 rounded-md bg-background/70 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur-sm">
              <SourceIcon source={asset.source} className="h-3 w-3" />
              {asset.source}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col p-4">
          {/* Title */}
          <h3 className="line-clamp-1 text-sm font-semibold">{asset.title}</h3>
          {/* Artist */}
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {asset.artistName}
          </p>
          {/* Description */}
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {asset.description || "\u00A0"}
          </p>

          {/* Bottom section — always at card bottom */}
          <div className="mt-auto flex flex-col gap-3 pt-3">
            {/* Tags */}
            <div className="-ml-0.5 flex items-center gap-1.5">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {hiddenTags.length > 0 && (
                <span
                  className="relative shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground [&:hover>span]:visible"
                >
                  +{hiddenTags.length}
                  <span className="invisible absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-2 text-xs font-medium text-popover-foreground shadow-lg">
                    {hiddenTags.join(", ")}
                  </span>
                </span>
              )}
            </div>

            {/* View on source */}
            <a
              href={asset.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              View on {asset.source}
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
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
