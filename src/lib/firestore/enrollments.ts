import { adminDb } from "@/lib/firebase/admin";
import { makeEnrollmentId } from "@/lib/constants";
import type { Enrollment } from "@/lib/types";
import { FieldValue } from "firebase-admin/firestore";
import { stripeLiveMode } from "@/lib/stripe";

export async function getEnrollment(
  uid: string,
  courseId: string
): Promise<Enrollment | null> {
  const docId = makeEnrollmentId(uid, courseId);
  const doc = await adminDb.collection("enrollments").doc(docId).get();

  if (!doc.exists) return null;
  const data = doc.data()!;

  // Reject enrollments that don't match the current Stripe mode.
  // Only enforce on purchase-based enrollments (gift/promo don't go through Stripe).
  // Treat missing livemode as test (false) — safe default since legacy enrollments
  // predate live Stripe setup.
  if (data.source === "purchase") {
    const enrollmentLivemode = data.livemode ?? false;
    if (enrollmentLivemode !== stripeLiveMode) {
      return null;
    }
  }

  return {
    ...data,
    enrolledAt: data.enrolledAt?.toDate?.()?.toISOString?.() ?? "",
    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString?.() ?? data.currentPeriodEnd ?? "",
  } as Enrollment;
}

export async function createEnrollmentWithPurchase(
  uid: string,
  courseId: string,
  stripeSessionId: string,
  stripePaymentIntentId: string,
  stripeCustomerId: string,
  amountPaid: number,
  currency: string,
  planType: "lifetime" | "monthly" = "lifetime",
  stripeSubscriptionId?: string,
  livemode?: boolean
): Promise<boolean> {
  const enrollmentId = makeEnrollmentId(uid, courseId);
  const enrollmentRef = adminDb.collection("enrollments").doc(enrollmentId);
  const purchaseRef = adminDb.collection("purchases").doc(stripeSessionId);

  return adminDb.runTransaction(async (tx) => {
    const enrollmentDoc = await tx.get(enrollmentRef);
    const existingData = enrollmentDoc.exists ? enrollmentDoc.data() : null;

    // Always save stripeCustomerId to the user doc — even on idempotent replays.
    // This ensures the user doc gets the customer ID even if the first attempt
    // wrote the enrollment but crashed before writing the user doc.
    const userRef = adminDb.collection("users").doc(uid);
    tx.set(userRef, { stripeCustomerId }, { merge: true });

    // Idempotent: if this exact session already created the enrollment, skip
    // (but stripeCustomerId was still saved above)
    if (existingData?.stripeSessionId === stripeSessionId) return false;

    // Never let a test-mode enrollment overwrite a live-mode enrollment.
    // The reverse (live overwriting test) is fine — it means a real purchase is replacing test data.
    if (
      existingData &&
      existingData.livemode === true &&
      !livemode
    ) {
      return false;
    }

    // If enrollment exists (e.g. user re-purchasing after cancel, or upgrading),
    // we overwrite it with the new plan
    const enrollmentData: Record<string, unknown> = {
      userId: uid,
      courseId,
      stripeSessionId,
      enrolledAt: FieldValue.serverTimestamp(),
      status: "active",
      source: "purchase",
      planType,
      cancelAtPeriodEnd: false,
      livemode: livemode ?? false,
    };

    if (stripeSubscriptionId) {
      enrollmentData.stripeSubscriptionId = stripeSubscriptionId;
    }
    // Plain set() overwrites the entire document — omitting stripeSubscriptionId
    // and currentPeriodEnd for lifetime purchases effectively removes them.

    tx.set(enrollmentRef, enrollmentData);

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

    return true;
  });
}

/** Update enrollment status directly */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "active" | "revoked"
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === "active") {
    update.paymentFailed = false;
  }
  await adminDb.collection("enrollments").doc(enrollmentId).update(update);
}

/** Mark an enrollment as cancelling at period end */
export async function markCancelAtPeriodEnd(
  enrollmentId: string,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd?: Date
): Promise<void> {
  const update: Record<string, unknown> = { cancelAtPeriodEnd };
  if (currentPeriodEnd) {
    update.currentPeriodEnd = currentPeriodEnd;
  }
  await adminDb.collection("enrollments").doc(enrollmentId).update(update);
}

/** Revoke enrollment when subscription actually ends (transactional to prevent races) */
export async function revokeEnrollmentBySubscription(
  stripeSubscriptionId: string
): Promise<void> {
  const snapshot = await adminDb
    .collection("enrollments")
    .where("stripeSubscriptionId", "==", stripeSubscriptionId)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  const ref = snapshot.docs[0].ref;

  await adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return;

    // Only revoke if this subscription is still the active one on the enrollment
    // (user may have already re-purchased with a new subscription or switched to lifetime)
    if (doc.data()?.stripeSubscriptionId === stripeSubscriptionId) {
      tx.update(ref, { status: "revoked" });
    }
  });
}
