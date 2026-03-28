"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeartButton } from "./heart-button";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{asset.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset.imageUrl}
              alt={asset.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              by {asset.artistName}
            </p>
            <div className="flex items-center gap-2">
              <HeartButton
                assetId={asset.id}
                isFavorited={isFavorited}
                size="md"
              />
              <Badge variant="secondary">{asset.source}</Badge>
            </div>
          </div>
          <p className="text-sm">{asset.description}</p>
          <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <Button asChild className="w-full">
            <a href={asset.externalUrl} target="_blank" rel="noopener noreferrer">
              View Original Source
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
