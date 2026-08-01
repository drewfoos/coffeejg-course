import { unstable_cache } from "next/cache";
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

export const ASSETS_CACHE_TAG = "assets";

/**
 * The entire assets collection (~500 small docs, well under cache size
 * limits), fetched at most once per revalidate window. Every public listing,
 * search, and filter request is served from this cached list instead of
 * hitting Firestore — without this, filtered requests re-read the whole
 * collection and free-tier read quota gets exhausted by crawler traffic.
 * Admin asset mutations call revalidateTag(ASSETS_CACHE_TAG) for freshness.
 */
const getAllAssets = unstable_cache(
  async (): Promise<AssetWithId[]> => {
    const snapshot = await adminDb
      .collection("assets")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) =>
      serializeDoc({ id: doc.id, ...(doc.data() as Asset) })
    );
  },
  ["all-assets"],
  { revalidate: 300, tags: [ASSETS_CACHE_TAG] }
);

export async function getAssets(
  options: GetAssetsOptions
): Promise<GetAssetsResult> {
  const { tags, sources, q, page = 1 } = options;

  let assets = await getAllAssets();

  // Tag/source filters are OR within each facet, matching the previous
  // Firestore semantics (array-contains / "in").
  if (tags && tags.length > 0) {
    assets = assets.filter((a) => tags.some((t) => a.tags.includes(t)));
  }

  if (sources && sources.length > 0) {
    assets = assets.filter((a) => sources.includes(a.source));
  }

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

  const totalCount = assets.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const offset = (safePage - 1) * PAGE_SIZE;

  return {
    assets: assets.slice(offset, offset + PAGE_SIZE),
    totalCount,
    page: safePage,
    totalPages,
  };
}

/** Lightweight query that only returns image URLs (for marquee backgrounds, etc.) */
export async function getAssetImageUrls(limit: number = 50): Promise<string[]> {
  const assets = await getAllAssets();
  return assets
    .slice(0, limit)
    .map((a) => a.imageUrl)
    .filter((url): url is string => !!url);
}

export async function getAssetsByIds(ids: string[]): Promise<AssetWithId[]> {
  if (ids.length === 0) return [];

  const assets = await getAllAssets();
  const byId = new Map(assets.map((a) => [a.id, a]));
  return ids
    .map((id) => byId.get(id))
    .filter((a): a is AssetWithId => a !== undefined);
}
