import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Suggestion } from "@/lib/types";

/**
 * Deterministic doc id derived from the normalized URL. Lets us use
 * `ref.create()` as an atomic "insert if not present" — no pre-read required,
 * which makes the suggestion write race-free and idempotent.
 */
function suggestionIdForUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}

export async function assetExistsWithUrl(url: string): Promise<boolean> {
  const snap = await adminDb
    .collection("assets")
    .where("externalUrl", "==", url)
    .limit(1)
    .get();
  return !snap.empty;
}

/**
 * Counts suggestions created by a user in the last 24 hours.
 * Used for the per-user daily cap.
 */
export async function countUserSuggestionsLast24h(
  uid: string
): Promise<number> {
  const since = Timestamp.fromMillis(Date.now() - 24 * 60 * 60 * 1000);
  const snap = await adminDb
    .collection("suggestions")
    .where("userId", "==", uid)
    .where("createdAt", ">=", since)
    .count()
    .get();
  return snap.data().count;
}

export interface CreateSuggestionResult {
  created: boolean;
  /** When `created` is false, the uid of the user who already submitted this URL. */
  existingUserId?: string;
  /** When `created` is false, the status of the existing suggestion. */
  existingStatus?: Suggestion["status"];
}

/**
 * Idempotent create. Uses a URL-derived doc id + Firestore `create()`
 * (fails with ALREADY_EXISTS if the doc is present). Safe against
 * double-clicks and concurrent submissions of the same URL.
 */
export async function createSuggestion(
  input: Omit<Suggestion, "createdAt" | "status"> & {
    status?: Suggestion["status"];
  }
): Promise<CreateSuggestionResult> {
  const docId = suggestionIdForUrl(input.externalUrl);
  const ref = adminDb.collection("suggestions").doc(docId);

  try {
    const doc: Record<string, unknown> = {
      userId: input.userId,
      userEmail: input.userEmail,
      title: input.title,
      artistName: input.artistName,
      description: input.description,
      imageUrl: input.imageUrl,
      externalUrl: input.externalUrl,
      source: input.source,
      status: input.status ?? "new",
      createdAt: FieldValue.serverTimestamp(),
    };
    if (input.tags && input.tags.length > 0) doc.tags = input.tags;
    await ref.create(doc);
    return { created: true };
  } catch (err) {
    // Firestore GRPC code 6 = ALREADY_EXISTS
    const code = (err as { code?: number | string }).code;
    if (code === 6 || code === "already-exists") {
      const existing = await ref.get();
      const data = existing.data() as Suggestion | undefined;
      return {
        created: false,
        existingUserId: data?.userId,
        existingStatus: data?.status,
      };
    }
    throw err;
  }
}
