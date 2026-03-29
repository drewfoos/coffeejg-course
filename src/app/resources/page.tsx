import { Suspense } from "react";
import { getAssets } from "@/lib/firestore/assets";
import { getFavoriteIds } from "@/lib/firestore/favorites";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AssetCard } from "@/components/resources/asset-card";
import { FilterBar } from "@/components/resources/filter-bar";
import { PaginationControls } from "@/components/resources/pagination-controls";
import { SearchBar } from "@/components/resources/search-bar";
import Link from "next/link";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; source?: string; cursor?: string; q?: string }>;
}) {
  const { tag, source, cursor, q } = await searchParams;
  const { assets, nextCursor } = await getAssets({ tag, source, cursor, q });

  const user = await getCurrentUser();
  const favoriteIds = user
    ? await getFavoriteIds(
        user.uid,
        assets.map((a) => a.id)
      )
    : new Set<string>();

  const hasFilters = !!(tag || source || q);

  return (
    <main>
      {/* Hero header */}
      <div className="border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                Resource Hub
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Free assets, tools, and references to level up your VTubing setup.
              </p>
            </div>
            {user && (
              <Link
                href="/resources/favorites"
                className="hidden shrink-0 items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
              >
                <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                My Favorites
              </Link>
            )}
          </div>

          {/* Search bar */}
          <div className="mt-6">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Filters + Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <Suspense>
          <FilterBar />
        </Suspense>

        {/* Results info */}
        <div className="mt-6 mb-1 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {assets.length === 0
              ? "No resources found"
              : `${assets.length} resource${assets.length !== 1 ? "s" : ""}`}
          </p>
          {hasFilters && (
            <Link
              href="/resources"
              className="text-sm text-primary transition-colors hover:text-primary/80"
            >
              Clear all filters
            </Link>
          )}
        </div>

        {/* Grid */}
        {assets.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isFavorited={favoriteIds.has(asset.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center">
            <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No resources found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        <Suspense>
          <PaginationControls nextCursor={nextCursor} />
        </Suspense>
      </div>
    </main>
  );
}
