"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartButton } from "./heart-button";
import { AssetDetailModal } from "./asset-detail-modal";
import type { AssetWithId } from "@/lib/firestore/assets";

interface AssetCardProps {
  asset: AssetWithId;
  isFavorited: boolean;
}

export function AssetCard({ asset, isFavorited }: AssetCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Card
        className="cursor-pointer overflow-hidden transition-colors hover:bg-accent/50"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative aspect-square bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.imageUrl}
            alt={asset.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute right-2 top-2">
            <HeartButton assetId={asset.id} isFavorited={isFavorited} />
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 font-medium">{asset.title}</h3>
          <p className="text-sm text-muted-foreground">{asset.artistName}</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {asset.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {asset.source}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <AssetDetailModal
        asset={asset}
        isFavorited={isFavorited}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
