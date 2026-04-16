import { adminDb } from "@/lib/firebase/admin";
import { PAGE_SIZE } from "@/lib/constants";
import type { Asset } from "@/lib/types";
import { serializeDoc } from "@/lib/types";

export interface AssetWithId extends Asset {
  id: string;
}

interface GetAssetsOptions {
  tags?: string[];
  sources?: string[];
  page?: number;
  q?: string;
}

interface GetAssetsResult {
  assets: AssetWithId[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export async function getAssets(
  options: GetAssetsOptions
): Promise<GetAssetsResult> {
  const { tags, sources, q, page = 1 } = options;

  const needsMemoryFilter = (tags && tags.length > 0) || (sources && sources.length > 1) || q;

  let baseQuery: FirebaseFirestore.Query = adminDb.collection("assets");

  // Firestore can handle one array-contains and one "in" natively.
  // For multiple tags we must filter in memory.
  if (tags && tags.length === 1) {
    baseQuery = baseQuery.where("tags", "array-contains", tags[0]);
  }

  if (sources && sources.length === 1) {
    baseQuery = baseQuery.where("source", "==", sources[0]);
  } else if (sources && sources.length > 1 && sources.length <= 30) {
    baseQuery = baseQuery.where("source", "in", sources);
  }

  if (needsMemoryFilter) {
    const snapshot = await baseQuery.orderBy("createdAt", "desc").get();
    let allAssets = snapshot.docs.map((doc) =>
      serializeDoc({ id: doc.id, ...(doc.data() as Asset) })
    );

    if (tags && tags.length > 1) {
      allAssets = allAssets.filter((a) =>
        tags.some((t) => a.tags.includes(t))
      );
    }

    if (q) {
      const lower = q.toLowerCase();
      allAssets = allAssets.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.artistName.toLowerCase().includes(lower) ||
          a.description.toLowerCase().includes(lower) ||
          a.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    const totalCount = allAssets.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const offset = (safePage - 1) * PAGE_SIZE;
    const assets = allAssets.slice(offset, offset + PAGE_SIZE);

    return { assets, totalCount, page: safePage, totalPages };
  }

  // Simple case — run count and paginated fetch in parallel
  const offset = (page - 1) * PAGE_SIZE;
  const [countSnapshot, snapshot] = await Promise.all([
    baseQuery.count().get(),
    baseQuery.orderBy("createdAt", "desc").offset(offset).limit(PAGE_SIZE).get(),
  ]);

  const totalCount = countSnapshot.data().count;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const assets: AssetWithId[] = snapshot.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...(doc.data() as Asset) })
  );

  return { assets, totalCount, page: safePage, totalPages };
}

/** Lightweight query that only returns image URLs (for marquee backgrounds, etc.) */
export async function getAssetImageUrls(limit: number = 50): Promise<string[]> {
  const snapshot = await adminDb
    .collection("assets")
    .select("imageUrl")
    .limit(limit)
    .get();
  return snapshot.docs
    .map((doc) => (doc.data() as { imageUrl?: string }).imageUrl)
    .filter((url): url is string => !!url);
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
