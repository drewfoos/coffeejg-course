"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { adminDb } from "@/lib/firebase/admin";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(courseId: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("You must be logged in to purchase a course.");
  }

  const courseDoc = await adminDb.collection("courses").doc(courseId).get();
  if (!courseDoc.exists) {
    throw new Error("Course not found.");
  }

  const courseData = courseDoc.data() as { stripePriceId: string };
  if (!courseData.stripePriceId) {
    throw new Error("This course is not available for purchase.");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: courseData.stripePriceId, quantity: 1 }],
    metadata: { firebaseUid: user.uid, courseId },
    client_reference_id: user.uid,
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/courses/${courseId}`,
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session.");
  }

  return session.url;
}
