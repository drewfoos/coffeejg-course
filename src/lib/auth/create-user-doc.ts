"use server";

import { adminDb } from "@/lib/firebase/admin";
import { adminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Creates a user document in Firestore if one doesn't already exist.
 * Verifies the ID token server-side rather than trusting client-supplied UID.
 */
export async function createUserDocIfNotExists(
  idToken: string,
  authProvider: "email" | "google"
) {
  // Verify the token server-side to get trusted user claims
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  const userRef = adminDb.collection("users").doc(uid);
  const doc = await userRef.get();

  if (doc.exists) return;

  await userRef.set({
    displayName: decoded.name ?? "",
    email: decoded.email ?? "",
    authProvider,
    stripeCustomerId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
