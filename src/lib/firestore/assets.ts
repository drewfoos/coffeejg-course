import { adminDb } from "@/lib/firebase/admin";
import { PAGE_SIZE } from "@/lib/constants";
import type { Asset } from "@/lib/types";
import { serializeDoc } from "@/lib/types";
import { Timestamp } from "firebase-admin/firestore";

export interface AssetWithId extends Asset {
  id: string;
}

interface GetAssetsOptions {
  tag?: string;
  source?: string;
  cursor?: string;
  q?: string;
}

interface GetAssetsResult {
  assets: AssetWithId[];
  nextCursor: string | null;
}

export async function getAssets(
  options: GetAssetsOptions
): Promise<GetAssetsResult> {
  const { tag, source, cursor, q } = options;

  let query: FirebaseFirestore.Query = adminDb.collection("assets");

  if (tag) {
    query = query.where("tags", "array-contains", tag);
  }

  if (source) {
    query = query.where("source", "==", source);
  }

  query = query.orderBy("createdAt", "desc");

  if (cursor) {
    const cursorMs = Number(cursor);
    if (!Number.isFinite(cursorMs) || cursorMs < 0) {
      return { assets: [], nextCursor: null };
    }
    const cursorTimestamp = Timestamp.fromMillis(cursorMs);
    query = query.startAfter(cursorTimestamp);
  }

  // Fetch one extra to detect if there's a next page
  const snapshot = await query.limit(PAGE_SIZE + 1).get();

  const docs = snapshot.docs;
  const hasNextPage = docs.length > PAGE_SIZE;
  const pageDocs = hasNextPage ? docs.slice(0, PAGE_SIZE) : docs;

  let assets: AssetWithId[] = pageDocs.map((doc) =>
    serializeDoc({ id: doc.id, ...(doc.data() as Asset) })
  );

  // Client-side search filter (MVP — use Algolia/Typesense for production)
  if (q) {
    const lower = q.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.artistName.toLowerCase().includes(lower) ||
        a.description.toLowerCase().includes(lower) ||
        a.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  const nextCursor = hasNextPage
    ? pageDocs[pageDocs.length - 1].data().createdAt.toMillis().toString()
    : null;

  return { assets, nextCursor };
}

export async function getAssetsByIds(ids: string[]): Promise<AssetWithId[]> {
  if (ids.length === 0) return [];

  // Firestore getAll supports up to 500 docs at a time — batch if needed
  const BATCH_SIZE = 500;
  const results: AssetWithId[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const refs = batch.map((id) => adminDb.collection("assets").doc(id));
    const snapshots = await adminDb.getAll(...refs);

    for (const snap of snapshots) {
      if (snap.exists) {
        results.push(serializeDoc({ id: snap.id, ...(snap.data() as Asset) }));
      }
    }
  }

  return results;
}
