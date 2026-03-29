import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAssetsByIds } from "@/lib/firestore/assets";
import { AssetCard } from "@/components/resources/asset-card";
import type { Favorite } from "@/lib/types";
import Link from "next/link";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const favoritesSnapshot = await adminDb
    .collection("favorites")
    .where("userId", "==", user.uid)
    .orderBy("favoritedAt", "desc")
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
      {/* Header */}
      <div className="border-b border-border/50 bg-gradient-to-br from-red-500/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <svg className="h-7 w-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                  My Favorites
                </h1>
              </div>
              <p className="mt-2 text-lg text-muted-foreground">
                Resources you&apos;ve saved for later.
              </p>
            </div>
            <Link
              href="/resources"
              className="hidden shrink-0 items-center gap-2 rounded-lg border border-border/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:flex"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Resources
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        {orderedAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center">
            <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <p className="mt-4 text-lg font-medium">No favorites yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse the{" "}
              <Link href="/resources" className="text-primary hover:underline">
                Resource Hub
              </Link>{" "}
              and heart the ones you like.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {orderedAssets.length} saved resource{orderedAssets.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {orderedAssets.map((asset) =>
                asset ? (
                  <AssetCard key={asset.id} asset={asset} isFavorited={true} />
                ) : null
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
