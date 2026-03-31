"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getStripeCustomerId(uid: string): Promise<string | null> {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  const fromUser = userDoc.data()?.stripeCustomerId;
  if (fromUser) return fromUser;

  // Fallback: look up from the most recent purchase record
  const purchaseSnap = await adminDb
    .collection("purchases")
    .where("userId", "==", uid)
    .limit(1)
    .get();
  if (purchaseSnap.empty) return null;

  const customerId = purchaseSnap.docs[0].data()?.stripeCustomerId ?? null;

  // Backfill the user doc so future lookups are fast
  if (customerId) {
    await adminDb
      .collection("users")
      .doc(uid)
      .set({ stripeCustomerId: customerId }, { merge: true });
  }

  return customerId;
}

/** Find the user's active subscription ID from their enrollment, not by customer query */
async function getActiveSubscriptionId(uid: string): Promise<string | null> {
  const snapshot = await adminDb
    .collection("enrollments")
    .where("userId", "==", uid)
    .where("status", "==", "active")
    .where("planType", "==", "monthly")
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data()?.stripeSubscriptionId ?? null;
}

export async function createBillingPortalSession() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const stripeCustomerId = await getStripeCustomerId(user.uid);
  if (!stripeCustomerId) throw new Error("No billing account found");

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
  });

  redirect(session.url);
}

/** Cancel subscription at the end of the current billing period */
export async function cancelSubscriptionAction(): Promise<{
  cancelAt: string;
}> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Find subscription from enrollment record (not by customer list)
  const subId = await getActiveSubscriptionId(user.uid);
  if (!subId) throw new Error("No active subscription found.");

  // Cancel at period end — user keeps access until then
  await stripe.subscriptions.update(subId, {
    cancel_at_period_end: true,
  });

  // In Stripe SDK v21, period end is on the subscription item
  const updatedSub = await stripe.subscriptions.retrieve(subId, {
    expand: ["items"],
  });
  const periodEnd = updatedSub.items.data[0]?.current_period_end ?? 0;
  const cancelAt = new Date(periodEnd * 1000).toISOString();

  revalidatePath("/settings");
  return { cancelAt };
}

/** Resume a subscription that was set to cancel at period end */
export async function resumeSubscriptionAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const subId = await getActiveSubscriptionId(user.uid);
  if (!subId) throw new Error("No active subscription found.");

  await stripe.subscriptions.update(subId, {
    cancel_at_period_end: false,
  });

  revalidatePath("/settings");
}
