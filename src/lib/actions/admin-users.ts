"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  revokeEnrollment,
  deleteUserAccount,
} from "@/lib/firestore/admin-users";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function revokeEnrollmentAction(
  enrollmentId: string,
  uid: string
) {
  await requireAdmin();
  if (!enrollmentId) throw new Error("Enrollment ID is required.");

  // Read the enrollment to check if it has an active Stripe subscription
  const enrollmentDoc = await adminDb
    .collection("enrollments")
    .doc(enrollmentId)
    .get();
  const subId = enrollmentDoc.data()?.stripeSubscriptionId;

  // Cancel the Stripe subscription so the user isn't billed for revoked access
  if (subId) {
    try {
      await stripe.subscriptions.cancel(subId);
    } catch {
      // Subscription may already be cancelled
    }
  }

  await revokeEnrollment(enrollmentId);
  revalidatePath(`/admin/users/${uid}`);
  revalidatePath("/admin/users");
}

/** Cancel at period end — user keeps access until billing period ends */
export async function cancelSubscriptionAtPeriodEndAction(
  uid: string,
  stripeCustomerId: string
) {
  await requireAdmin();
  if (!stripeCustomerId) throw new Error("No Stripe customer ID found.");

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
  });

  for (const sub of subscriptions.data) {
    await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });
  }

  revalidatePath(`/admin/users/${uid}`);
}

/** Cancel immediately — user loses access now */
export async function cancelSubscriptionImmediateAction(
  uid: string,
  stripeCustomerId: string
) {
  await requireAdmin();
  if (!stripeCustomerId) throw new Error("No Stripe customer ID found.");

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "active",
  });

  // Cancel Stripe subscriptions AND revoke Firestore enrollments directly
  // (don't rely on webhook for immediate cancel — it may be delayed)
  for (const sub of subscriptions.data) {
    await stripe.subscriptions.cancel(sub.id);

    // Find and revoke the enrollment tied to this subscription
    const enrollmentSnap = await adminDb
      .collection("enrollments")
      .where("stripeSubscriptionId", "==", sub.id)
      .limit(1)
      .get();
    if (!enrollmentSnap.empty) {
      await enrollmentSnap.docs[0].ref.update({ status: "revoked" });
    }
  }

  revalidatePath(`/admin/users/${uid}`);
}

export async function deleteUserAction(uid: string) {
  await requireAdmin();
  if (!uid) throw new Error("User ID is required.");

  // Cancel all Stripe subscriptions before deleting the account.
  // Two approaches to catch everything:

  // 1. Cancel via stripeCustomerId (covers all subs for this customer)
  const userDoc = await adminDb.collection("users").doc(uid).get();
  let stripeCustomerId = userDoc.data()?.stripeCustomerId;
  if (!stripeCustomerId) {
    // Fallback: check purchase records
    const purchaseSnap = await adminDb
      .collection("purchases")
      .where("userId", "==", uid)
      .limit(1)
      .get();
    if (!purchaseSnap.empty) {
      stripeCustomerId = purchaseSnap.docs[0].data()?.stripeCustomerId;
    }
  }
  if (stripeCustomerId) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
      });
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    } catch {
      // Continue with deletion even if Stripe fails
    }
  }

  // 2. Cancel via enrollment subscription IDs (safety net if customer ID was missing)
  try {
    const enrollments = await adminDb
      .collection("enrollments")
      .where("userId", "==", uid)
      .get();
    for (const doc of enrollments.docs) {
      const subId = doc.data()?.stripeSubscriptionId;
      if (subId) {
        try {
          await stripe.subscriptions.cancel(subId);
        } catch {
          // Already cancelled or doesn't exist
        }
      }
    }
  } catch {
    // Continue with deletion
  }

  await deleteUserAccount(uid);
  revalidatePath("/admin/users");
}
