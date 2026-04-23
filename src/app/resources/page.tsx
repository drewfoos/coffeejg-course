import { Suspense } from "react";
import { getAssets } from "@/lib/firestore/assets";
import { getFavoriteIds } from "@/lib/firestore/favorites";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AssetCard } from "@/components/resources/asset-card";
import { FilterBar } from "@/components/resources/filter-bar";
import { PaginationControls } from "@/components/resources/pagination-controls";
import { SearchBar } from "@/components/resources/search-bar";
import { HeroParticles } from "@/components/resources/hero-particles";
import { SuggestResourceDialog } from "@/components/resources/suggest-dialog";
import Link from "next/link";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; sources?: string; page?: string; q?: string }>;
}) {
  const { tags: tagsParam, sources: sourcesParam, page: pageStr, q } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);
  const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  const sources = sourcesParam ? sourcesParam.split(",").filter(Boolean) : [];

  // Parallelize independent data fetches
  const [assetsResult, user] = await Promise.all([
    getAssets({
      tags: tags.length > 0 ? tags : undefined,
      sources: sources.length > 0 ? sources : undefined,
      page,
      q,
    }),
    getCurrentUser(),
  ]);
  const { assets, totalCount, totalPages } = assetsResult;

  const favoriteIds = user
    ? await getFavoriteIds(
        user.uid,
        assets.map((a) => a.id)
      )
    : new Set<string>();

  const hasFilters = !!(tags.length || sources.length || q);

  return (
    <main>
      {/* Hero — title, search, particles, waves */}
      <div className="relative overflow-hidden pb-20">
        {/* Gradient — uses primary hue so it works in both modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/12 via-primary/6 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/[0.05] via-transparent to-fuchsia-500/[0.05]" />

        {/* Glow orbs — purple + pink to match character */}
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-pink-500/[0.08] blur-[100px]" />
        <div className="absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-fuchsia-500/[0.07] blur-[100px]" />

        {/* Interactive particles */}
        <div className="absolute inset-0">
          <HeroParticles />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          {/* Title */}
          <div className="pt-14 text-center lg:pt-16">
            <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-semibold tracking-tight text-primary lg:text-5xl">
              Resource Hub
            </h1>
            <p className="mx-auto mt-3 max-w-xl font-[family-name:var(--font-quicksand)] text-base font-medium leading-relaxed text-muted-foreground">
              Curated assets, overlays, emotes, and tools from creators across the VTubing community.
            </p>
          </div>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-xl">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {/* Secondary actions — Favorites + Suggest under the search bar */}
          <div className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-2 pb-6">
            <Link
              href={user ? "/resources/favorites" : "/login?next=/resources/favorites"}
              className="flex h-10 items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-4 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground"
            >
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Favorites
            </Link>
            <SuggestResourceDialog isAuthenticated={!!user} />
          </div>
        </div>

        {/* Layered waves — theme-aware fills */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="block w-full text-primary/[0.12]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style={{ height: "80px" }}>
            <path d="M0,80 C180,120 360,40 540,70 C720,100 900,30 1080,60 C1200,80 1320,50 1440,70 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 block w-full text-primary/[0.07]" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style={{ height: "65px" }}>
            <path d="M0,50 C200,90 440,20 660,55 C880,90 1100,25 1320,50 C1380,58 1420,45 1440,50 L1440,100 L0,100 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 block w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ height: "50px" }}>
            <path d="M0,40 C240,70 480,15 720,40 C960,65 1200,20 1440,45 L1440,80 L0,80 Z" fill="var(--background)" />
          </svg>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Toolbar — filter button + active pills + count */}
        <div className="flex flex-wrap items-center gap-3 pb-5">
          <Suspense>
            <FilterBar />
          </Suspense>
          <span className="ml-auto text-sm text-muted-foreground">
            {totalCount === 0
              ? "No resources found"
              : `${totalCount} resource${totalCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Grid */}
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {assets.map((asset, i) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isFavorited={favoriteIds.has(asset.id)}
                priority={i < 4}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center">
            <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No resources found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}

        <div className="pb-10">
          <Suspense>
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
