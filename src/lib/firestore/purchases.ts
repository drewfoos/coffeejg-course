import { adminDb } from "@/lib/firebase/admin";
import type { Purchase } from "@/lib/types";

export async function getPurchase(
  sessionId: string
): Promise<Purchase | null> {
  const doc = await adminDb.collection("purchases").doc(sessionId).get();
  if (!doc.exists) return null;
  return doc.data() as Purchase;
}
