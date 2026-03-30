"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";

export async function createBillingPortalSession() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Check user doc first, then fall back to purchases
  const userDoc = await adminDb.collection("users").doc(user.uid).get();
  let stripeCustomerId = userDoc.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    const purchaseSnap = await adminDb
      .collection("purchases")
      .where("userId", "==", user.uid)
      .limit(1)
      .get();

    stripeCustomerId = purchaseSnap.docs[0]?.data()?.stripeCustomerId;
  }

  if (!stripeCustomerId) {
    throw new Error("No billing account found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
  });

  redirect(session.url);
}
