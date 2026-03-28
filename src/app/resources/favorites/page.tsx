import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAssetsByIds } from "@/lib/firestore/assets";
import { AssetCard } from "@/components/resources/asset-card";
import type { Favorite } from "@/lib/types";

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

  // Preserve the order from favorites query
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const orderedAssets = assetIds
    .map((id) => assetMap.get(id))
    .filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          My Favorites
        </h1>
        <p className="mt-1 text-muted-foreground">
          Resources you have saved for later.
        </p>
      </div>

      {orderedAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-medium">No favorites yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse the{" "}
            <a href="/resources" className="underline underline-offset-4">
              Resource Hub
            </a>{" "}
            and heart the ones you like.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {orderedAssets.map((asset) =>
            asset ? (
              <AssetCard key={asset.id} asset={asset} isFavorited={true} />
            ) : null
          )}
        </div>
      )}
    </main>
  );
}
