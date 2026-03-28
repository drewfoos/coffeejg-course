import { getAssets } from "@/lib/firestore/assets";
import { getFavoriteIds } from "@/lib/firestore/favorites";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { FilterBar } from "@/components/resources/filter-bar";
import { AssetCard } from "@/components/resources/asset-card";
import { PaginationControls } from "@/components/resources/pagination-controls";

interface ResourcesPageProps {
  searchParams: Promise<{
    tag?: string;
    source?: string;
    cursor?: string;
  }>;
}

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const params = await searchParams;
  const { tag, source, cursor } = params;

  const [{ assets, nextCursor }, user] = await Promise.all([
    getAssets({ tag, source, cursor }),
    getCurrentUser(),
  ]);

  const assetIds = assets.map((a) => a.id);
  const favoriteIds = user
    ? await getFavoriteIds(user.uid, assetIds)
    : new Set<string>();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Resource Hub
        </h1>
        <p className="mt-1 text-muted-foreground">
          Browse free assets, tools, and references for VTubing.
        </p>
      </div>

      <FilterBar activeTag={tag} activeSource={source} />

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium">No resources found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isFavorited={favoriteIds.has(asset.id)}
              />
            ))}
          </div>

          <PaginationControls
            nextCursor={nextCursor}
            tag={tag}
            source={source}
          />
        </>
      )}
    </main>
  );
}
