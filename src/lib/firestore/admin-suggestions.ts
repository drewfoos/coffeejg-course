import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import type { Suggestion } from "@/lib/types";
import { serializeDoc } from "@/lib/types";

export interface SuggestionWithId extends Suggestion {
  id: string;
}

/**
 * Admin listing — optionally filter by status. Default sort is newest first.
 * Suggestion `createdAt` is a Firestore Timestamp (written via serverTimestamp).
 */
export async function listSuggestions(options: {
  status?: Suggestion["status"];
  limit?: number;
}): Promise<SuggestionWithId[]> {
  const { status, limit = 100 } = options;
  let query: FirebaseFirestore.Query = adminDb.collection("suggestions");
  if (status) {
    query = query.where("status", "==", status);
  }
  const snap = await query.orderBy("createdAt", "desc").limit(limit).get();
  return snap.docs.map((doc) =>
    serializeDoc({ id: doc.id, ...(doc.data() as Suggestion) })
  );
}

/**
 * Lightweight count using Firestore's aggregation query. Cheaper than
 * reading docs — good fit for populating tab badges.
 */
export async function countSuggestions(
  status?: Suggestion["status"]
): Promise<number> {
  let query: FirebaseFirestore.Query = adminDb.collection("suggestions");
  if (status) {
    query = query.where("status", "==", status);
  }
  const snap = await query.count().get();
  return snap.data().count;
}

export async function getSuggestion(
  id: string
): Promise<SuggestionWithId | null> {
  const doc = await adminDb.collection("suggestions").doc(id).get();
  if (!doc.exists) return null;
  return serializeDoc({ id: doc.id, ...(doc.data() as Suggestion) });
}

export async function updateSuggestionStatus(
  id: string,
  status: Suggestion["status"],
  reviewerUid: string
): Promise<void> {
  await adminDb.collection("suggestions").doc(id).update({
    status,
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: reviewerUid,
  });
}
