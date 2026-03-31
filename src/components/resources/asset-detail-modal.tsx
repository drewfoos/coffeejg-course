"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HeartButton } from "./heart-button";
import { SourceIcon } from "./source-icon";
import type { AssetWithId } from "@/lib/firestore/assets";

interface AssetDetailModalProps {
  asset: AssetWithId;
  isFavorited: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetDetailModal({
  asset,
  isFavorited,
  open,
  onOpenChange,
}: AssetDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        {/* Image */}
        <div className="relative aspect-[16/10] w-full bg-muted">
          {asset.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={asset.imageUrl}
              alt={asset.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/[0.08] via-muted to-primary/[0.04]">
              <svg className="h-12 w-12 text-primary/25" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground/40">{asset.source}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="text-xl">{asset.title}</DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {asset.artistName}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HeartButton
                  assetId={asset.id}
                  isFavorited={isFavorited}
                  size="md"
                />
                <span className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <SourceIcon source={asset.source} className="h-3.5 w-3.5" />
                  {asset.source}
                </span>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {asset.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={asset.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            View Original Source
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
