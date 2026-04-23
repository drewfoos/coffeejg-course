import { adminDb } from "@/lib/firebase/admin";
import type { Asset } from "@/lib/types";
import { serializeDoc } from "@/lib/types";

export interface AssetWithId extends Asset {
  id: string;
}

export interface AssetInput {
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags: string[];
  source: string;
  externalUrl: string;
  free: boolean;
}

/** Admin listing — returns up to `limit` most recently created assets. */
export async function listAssets(limit = 100): Promise<AssetWithId[]> {
  const snap = await adminDb
    .collection("assets")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...(doc.data() as Asset) })
  );
}

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "asset"
  );
}

/**
 * Creates a new asset with a stable slug-ish doc id (title-slug + short random
 * suffix). Returns the created id.
 */
export async function createAsset(input: AssetInput): Promise<string> {
  const slug = slugifyTitle(input.title);
  const suffix = Math.random().toString(36).slice(2, 8);
  const id = `${slug}-${suffix}`;
  const now = new Date().toISOString();

  await adminDb.collection("assets").doc(id).set({
    title: input.title,
    artistName: input.artistName,
    description: input.description,
    imageUrl: input.imageUrl,
    tags: input.tags,
    source: input.source,
    externalUrl: input.externalUrl,
    free: input.free,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function deleteAsset(id: string): Promise<void> {
  await adminDb.collection("assets").doc(id).delete();
}
