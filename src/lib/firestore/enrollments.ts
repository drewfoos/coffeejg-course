import { adminDb } from "@/lib/firebase/admin";
import { makeEnrollmentId } from "@/lib/constants";
import type { Enrollment } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";

export async function getEnrollment(
  uid: string,
  courseId: string
): Promise<Enrollment | null> {
  const docId = makeEnrollmentId(uid, courseId);
  const doc = await adminDb.collection("enrollments").doc(docId).get();

  if (!doc.exists) return null;
  return doc.data() as Enrollment;
}

export async function createEnrollmentWithPurchase(
  uid: string,
  courseId: string,
  stripeSessionId: string,
  stripePaymentIntentId: string,
  stripeCustomerId: string,
  amountPaid: number,
  currency: string,
  planType: "lifetime" | "subscription" = "lifetime"
): Promise<boolean> {
  const enrollmentId = makeEnrollmentId(uid, courseId);
  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const purchaseRef = adminDb.collection("purchases").doc(stripeSessionId);

  return adminDb.runTransaction(async (tx) => {
    const enrollmentDoc = await tx.get(enrollmentRef);

    // Idempotent: if enrollment already exists, skip
    if (enrollmentDoc.exists) return false;

    tx.set(enrollmentRef, {
      userId: uid,
      courseId,
      stripeSessionId,
      enrolledAt: FieldValue.serverTimestamp(),
      status: "active",
      source: "purchase",
      planType,
    });

    tx.set(purchaseRef, {
      userId: uid,
      courseId,
      stripeSessionId,
      stripePaymentIntentId,
      stripeCustomerId,
      amountPaid,
      currency,
      purchasedAt: FieldValue.serverTimestamp(),
    });

    // Save stripeCustomerId to the user doc for billing portal access
    const userRef = adminDb.collection("users").doc(uid);
    tx.update(userRef, { stripeCustomerId });

    return true;
  });
}
