"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function createUserDocIfNotExists(
  uid: string,
  email: string,
  displayName: string,
  authProvider: "email" | "google"
) {
  const userRef = adminDb.collection("users").doc(uid);
  const doc = await userRef.get();

  if (doc.exists) return;

  await userRef.set({
    displayName,
    email,
    authProvider,
    stripeCustomerId: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
