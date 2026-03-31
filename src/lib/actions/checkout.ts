"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe";
import { validateId } from "@/lib/validation";
import { checkoutLimiter } from "@/lib/rate-limit";

export async function createCheckoutSession(
  courseId: string
): Promise<string> {
  validateId(courseId, "course ID");
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to purchase a course.");
  }

  const { success } = checkoutLimiter.limit(user.uid);
  if (!success) {
    throw new Error("Too many requests. Please try again later.");
  }

  // Check if already enrolled
  const existing = await getEnrollment(user.uid, courseId);
  if (existing?.status === "active") {
    throw new Error("You already have access to this course.");
  }

  // Verify the course exists
  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) {
    throw new Error("Course not found.");
  }

  // Single global price for all courses — set in environment variable
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("Payment is not configured.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { firebaseUid: user.uid, courseId, planType: "lifetime" },
    client_reference_id: user.uid,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${courseId}`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session.");
  }

  return session.url;
}
