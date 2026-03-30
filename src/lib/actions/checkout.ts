"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe";
import { validateId } from "@/lib/validation";

export async function createCheckoutSession(
  courseId: string,
  planType: "lifetime" | "subscription" = "lifetime"
): Promise<string> {
  validateId(courseId, "course ID");
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to purchase a course.");
  }

  // Check if already enrolled
  const existing = await getEnrollment(user.uid, courseId);
  if (existing?.status === "active") {
    throw new Error("You already have access to this course.");
  }

  // Always resolve price server-side from the course document — never trust client
  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) {
    throw new Error("Course not found.");
  }
  const courseData = courseDoc.data() as {
    stripePriceId: string;
    stripeSubPriceId?: string;
  };

  const isSubscription = planType === "subscription";
  const priceId = isSubscription
    ? courseData.stripeSubPriceId
    : courseData.stripePriceId;

  if (!priceId) {
    throw new Error("This plan is not available for purchase.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { firebaseUid: user.uid, courseId, planType },
    client_reference_id: user.uid,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${courseId}`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session.");
  }

  return session.url;
}
