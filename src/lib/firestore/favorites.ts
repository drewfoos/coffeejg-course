import { adminDb } from "@/lib/firebase/admin";
import { makeFavoriteId } from "@/lib/constants";
import { FieldValue } from "firebase-admin/firestore";

export async function getFavoriteIds(
  uid: string,
  assetIds: string[]
): Promise<Set<string>> {
  if (assetIds.length === 0) return new Set();

  const refs = assetIds.map((assetId) =>
    adminDb.collection("favorites").doc(makeFavoriteId(uid, assetId))
  );
  const snapshots = await adminDb.getAll(...refs);

  const favoritedIds = new Set<string>();
  for (let i = 0; i < snapshots.length; i++) {
    if (snapshots[i].exists) {
      favoritedIds.add(assetIds[i]);
    }
  }

  return favoritedIds;
}

export async function toggleFavorite(
  uid: string,
  assetId: string
): Promise<boolean> {
  const docId = makeFavoriteId(uid, assetId);
  const ref = adminDb.collection("favorites").doc(docId);
  const doc = await ref.get();

  if (doc.exists) {
    await ref.delete();
    return false;
  }

  await ref.set({
    userId: uid,
    assetId,
    favoritedAt: FieldValue.serverTimestamp(),
  });
  return true;
}
