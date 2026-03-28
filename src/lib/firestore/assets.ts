import { adminDb } from "@/lib/firebase/admin";
import { PAGE_SIZE } from "@/lib/constants";
import type { Asset } from "@/lib/types";
import { Timestamp } from "firebase-admin/firestore";

export interface AssetWithId extends Asset {
  id: string;
}

interface GetAssetsOptions {
  tag?: string;
  source?: string;
  cursor?: string;
}

interface GetAssetsResult {
  assets: AssetWithId[];
  nextCursor: string | null;
}

export async function getAssets(
  options: GetAssetsOptions
): Promise<GetAssetsResult> {
  const { tag, source, cursor } = options;

  let query: FirebaseFirestore.Query = adminDb.collection("assets");

  if (tag) {
    query = query.where("tags", "array-contains", tag);
  }

  if (source) {
    query = query.where("source", "==", source);
  }

  query = query.orderBy("createdAt", "desc");

  if (cursor) {
    const cursorTimestamp = Timestamp.fromMillis(Number(cursor));
    query = query.startAfter(cursorTimestamp);
  }

  // Fetch one extra to detect if there's a next page
  const snapshot = await query.limit(PAGE_SIZE + 1).get();

  const docs = snapshot.docs;
  const hasNextPage = docs.length > PAGE_SIZE;
  const pageDocs = hasNextPage ? docs.slice(0, PAGE_SIZE) : docs;

  const assets: AssetWithId[] = pageDocs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Asset),
  }));

  const nextCursor = hasNextPage
    ? pageDocs[pageDocs.length - 1].data().createdAt.toMillis().toString()
    : null;

  return { assets, nextCursor };
}

export async function getAssetsByIds(ids: string[]): Promise<AssetWithId[]> {
  if (ids.length === 0) return [];

  // Firestore getAll supports up to 500 docs at a time
  const refs = ids.map((id) => adminDb.collection("assets").doc(id));
  const snapshots = await adminDb.getAll(...refs);

  return snapshots
    .filter((snap) => snap.exists)
    .map((snap) => ({
      id: snap.id,
      ...(snap.data() as Asset),
    }));
}
