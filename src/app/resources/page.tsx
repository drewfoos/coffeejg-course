import { Suspense } from "react";
import { getAssets } from "@/lib/firestore/assets";
import { getFavoriteIds } from "@/lib/firestore/favorites";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AssetCard } from "@/components/resources/asset-card";
import { FilterBar } from "@/components/resources/filter-bar";
import { PaginationControls } from "@/components/resources/pagination-controls";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; source?: string; cursor?: string }>;
}) {
  const { tag, source, cursor } = await searchParams;
  const { assets, nextCursor } = await getAssets({ tag, source, cursor });

  const user = await getCurrentUser();
  const favoriteIds = user
    ? await getFavoriteIds(
        user.uid,
        assets.map((a) => a.id)
      )
    : new Set<string>();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Resource Hub</h1>
      <p className="mb-6 text-muted-foreground">
        Browse free assets, tools, and references for VTubing.
      </p>
      <Suspense>
        <FilterBar />
      </Suspense>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            isFavorited={favoriteIds.has(asset.id)}
          />
        ))}
      </div>
      {assets.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          No assets found. Try adjusting your filters.
        </div>
      )}
      <Suspense>
        <PaginationControls nextCursor={nextCursor} />
      </Suspense>
    </main>
  );
}
