import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAssetsByIds } from "@/lib/firestore/assets";
import { AssetCard } from "@/components/resources/asset-card";
import type { Favorite } from "@/lib/types";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Favorites query depends on user.uid, so it runs after auth
  const favoritesSnapshot = await adminDb
    .collection("favorites")
    .where("userId", "==", user.uid)
    .orderBy("favoritedAt", "desc")
    .limit(100)
    .get();

  const favorites = favoritesSnapshot.docs.map(
    (doc) => doc.data() as Favorite
  );
  const assetIds = favorites.map((f) => f.assetId);
  const assets = await getAssetsByIds(assetIds);

  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const orderedAssets = assetIds
    .map((id) => assetMap.get(id))
    .filter(Boolean);

  return (
    <main>
      {/* Hero — warm heart-themed header matching Resource Hub style */}
      <div className="relative overflow-hidden pb-16">
        {/* Gradient — red/pink warmth instead of purple */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-pink-500/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.06] via-transparent to-pink-500/[0.06]" />

        {/* Glow orbs — warm red/pink */}
        <div className="absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute -left-20 top-1/3 h-52 w-52 rounded-full bg-rose-500/[0.08] blur-[90px]" />
        <div className="absolute -right-20 top-1/4 h-52 w-52 rounded-full bg-pink-500/[0.07] blur-[90px]" />

        {/* Floating hearts — CSS-only ambient decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[12%] top-[18%] text-2xl text-red-500/[0.12] animate-pulse" style={{ animationDelay: "0s", animationDuration: "3s" }}>&#x2764;</div>
          <div className="absolute left-[78%] top-[25%] text-lg text-pink-500/[0.10] animate-pulse" style={{ animationDelay: "1.2s", animationDuration: "4s" }}>&#x2764;</div>
          <div className="absolute left-[45%] top-[12%] text-xl text-rose-500/[0.08] animate-pulse" style={{ animationDelay: "0.6s", animationDuration: "3.5s" }}>&#x2764;</div>
          <div className="absolute left-[88%] top-[40%] text-sm text-red-400/[0.10] animate-pulse" style={{ animationDelay: "2s", animationDuration: "4.5s" }}>&#x2764;</div>
          <div className="absolute left-[5%] top-[45%] text-base text-pink-400/[0.09] animate-pulse" style={{ animationDelay: "1.8s", animationDuration: "3.2s" }}>&#x2764;</div>
          <div className="absolute left-[65%] top-[8%] text-sm text-rose-400/[0.11] animate-pulse" style={{ animationDelay: "0.3s", animationDuration: "3.8s" }}>&#x2764;</div>
          <div className="absolute left-[30%] top-[38%] text-lg text-red-500/[0.07] animate-pulse" style={{ animationDelay: "2.5s", animationDuration: "4.2s" }}>&#x2764;</div>
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="pt-14 text-center lg:pt-16">
            {/* Heart icon */}
            <div className="mb-4 inline-flex items-center justify-center rounded-2xl bg-red-500/10 p-3">
              <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>

            <h1 className="font-[family-name:var(--font-fredoka)] text-4xl font-semibold tracking-tight text-red-500 lg:text-5xl">
              My Favorites
            </h1>
            <p className="mx-auto mt-3 max-w-md font-[family-name:var(--font-quicksand)] text-base font-medium leading-relaxed text-muted-foreground">
              Your personally curated collection of VTuber assets.
            </p>

            {/* Back to resources */}
            <div className="mt-6">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-card hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Browse Resources
              </Link>
            </div>
          </div>
        </div>

        {/* Layered waves — matching Resource Hub but warmer */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg className="block w-full text-red-500/[0.08]" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" style={{ height: "70px" }}>
            <path d="M0,80 C180,120 360,40 540,70 C720,100 900,30 1080,60 C1200,80 1320,50 1440,70 L1440,120 L0,120 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 block w-full text-pink-500/[0.05]" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none" style={{ height: "55px" }}>
            <path d="M0,50 C200,90 440,20 660,55 C880,90 1100,25 1320,50 C1380,58 1420,45 1440,50 L1440,100 L0,100 Z" fill="currentColor" />
          </svg>
          <svg className="absolute bottom-0 left-0 block w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ height: "45px" }}>
            <path d="M0,40 C240,70 480,15 720,40 C960,65 1200,20 1440,45 L1440,80 L0,80 Z" fill="var(--background)" />
          </svg>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {orderedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/[0.02] py-24 text-center">
            <div className="rounded-2xl bg-red-500/[0.06] p-5">
              <svg className="h-14 w-14 text-red-500/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <p className="mt-6 font-[family-name:var(--font-fredoka)] text-xl font-medium">
              No favorites yet
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Explore the Resource Hub and tap the heart on any asset to save it here for quick access.
            </p>
            <Link
              href="/resources"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20"
            >
              Explore Resources
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between pb-5">
              <p className="text-sm text-muted-foreground">
                {orderedAssets.length} saved resource{orderedAssets.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {orderedAssets.map((asset, i) =>
                asset ? (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isFavorited={true}
                    priority={i < 4}
                  />
                ) : null
              )}
            </div>
          </>
        )}

        <div className="pb-10" />
      </div>
    </main>
  );
}
