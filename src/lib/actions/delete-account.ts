"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { stripe, stripeLiveMode } from "@/lib/stripe";
import { cookies } from "next/headers";
import { deleteAccountLimiter } from "@/lib/rate-limit";

const CONFIRM_PHRASE = "delete my account";

/**
 * Self-service account deletion — hardened.
 *
 * Security:
 * - Session cookie verified with revocation check (via getCurrentUser)
 * - Fresh Firebase ID token required and verified (re-authentication)
 * - ID token UID must match session UID (prevents cross-account attacks)
 * - Confirmation phrase required server-side (not just client gating)
 * - Rate limited: 2 attempts per 10 minutes per user
 * - All sessions revoked before deletion
 *
 * Steps:
 * 1. Verify identity (session + fresh ID token)
 * 2. Cancel all active Stripe subscriptions
 * 3. Delete all Firestore data
 * 4. Revoke all Firebase sessions
 * 5. Delete Firebase Auth account
 * 6. Clear session cookie
 */
export async function deleteAccountAction(
  freshIdToken: string,
  confirmPhrase: string
): Promise<void> {
  // 1. Verify session cookie (with revocation check)
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");

  // Rate limit by user ID
  const { success: withinLimit } = deleteAccountLimiter.limit(user.uid);
  if (!withinLimit) {
    throw new Error("Too many attempts. Please try again later.");
  }

  // Verify confirmation phrase server-side
  if (confirmPhrase.toLowerCase().trim() !== CONFIRM_PHRASE) {
    throw new Error("Confirmation phrase does not match.");
  }

  // Verify fresh ID token — this proves the user actively re-authenticated
  // (not just replaying an old session cookie)
  let tokenUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(freshIdToken, true);
    tokenUid = decoded.uid;
  } catch {
    throw new Error("Re-authentication failed. Please sign in again and retry.");
  }

  // ID token UID must match session UID — prevents a user from
  // deleting someone else's account by swapping tokens
  if (tokenUid !== user.uid) {
    throw new Error("Authentication mismatch. Please sign in again.");
  }

  const uid = user.uid;

  // 2. Cancel any active Stripe subscriptions
  const enrollmentSnap = await adminDb
    .collection("enrollments")
    .where("userId", "==", uid)
    .where("status", "==", "active")
    .where("planType", "==", "monthly")
    .where("livemode", "==", stripeLiveMode)
    .get();

  for (const doc of enrollmentSnap.docs) {
    const subId = doc.data()?.stripeSubscriptionId;
    if (subId) {
      try {
        await stripe.subscriptions.cancel(subId);
      } catch {
        // Subscription may already be cancelled
      }
    }
  }

  // Also cancel via stripeCustomerId (catches subs not tracked in enrollments)
  const userDoc = await adminDb.collection("users").doc(uid).get();
  const stripeCustomerId = userDoc.data()?.stripeCustomerId;
  if (stripeCustomerId) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
      });
      for (const sub of subs.data) {
        try {
          await stripe.subscriptions.cancel(sub.id);
        } catch {
          // Best effort
        }
      }
    } catch {
      // Customer may not exist in Stripe
    }
  }

  // 3. Delete all Firestore data (chunked to stay within 500-op batch limit)
  const [enrollments, progress, favorites, purchases] = await Promise.all([
    adminDb.collection("enrollments").where("userId", "==", uid).get(),
    adminDb.collection("progress").where("userId", "==", uid).get(),
    adminDb.collection("favorites").where("userId", "==", uid).get(),
    adminDb.collection("purchases").where("userId", "==", uid).get(),
  ]);

  const allRefs = [
    ...enrollments.docs.map((d) => d.ref),
    ...progress.docs.map((d) => d.ref),
    ...favorites.docs.map((d) => d.ref),
    ...purchases.docs.map((d) => d.ref),
    adminDb.collection("users").doc(uid),
  ];

  // Firestore batches are limited to 500 operations
  const BATCH_LIMIT = 499;
  for (let i = 0; i < allRefs.length; i += BATCH_LIMIT) {
    const batch = adminDb.batch();
    allRefs.slice(i, i + BATCH_LIMIT).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  // 4. Revoke all Firebase sessions (invalidates any other active session cookies)
  try {
    await adminAuth.revokeRefreshTokens(uid);
  } catch {
    // Best effort — account is about to be deleted anyway
  }

  // 5. Delete Firebase Auth account
  try {
    await adminAuth.deleteUser(uid);
  } catch {
    // User may already be deleted from Auth
  }

  // 6. Clear session cookie
  const cookieStore = await cookies();
  cookieStore.delete("__session");
}
