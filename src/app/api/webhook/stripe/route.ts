import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import {
  createEnrollmentWithPurchase,
  markCancelAtPeriodEnd,
  revokeEnrollmentBySubscription,
  updateEnrollmentStatus,
} from "@/lib/firestore/enrollments";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Server error." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Deduplicate webhook events using a transaction to prevent concurrent replays
  const eventRef = adminDb.collection("processedEvents").doc(event.id);
  const alreadyProcessed = await adminDb.runTransaction(async (tx) => {
    const eventDoc = await tx.get(eventRef);
    if (eventDoc.exists) return true;
    // Claim this event so concurrent duplicates see it as processed
    tx.set(eventRef, { claimedAt: new Date().toISOString() });
    return false;
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === "paid") {
          const firebaseUid = session.metadata?.firebaseUid;
          const courseId = session.metadata?.courseId;
          const rawPlanType = session.metadata?.planType;
          const planType: "lifetime" | "monthly" =
            rawPlanType === "monthly" ? "monthly" : "lifetime";

          if (!firebaseUid || !courseId) {
            // Return 200 so Stripe doesn't endlessly retry an unfixable event
            console.error(
              "Missing metadata in checkout session:",
              session.id
            );
            break;
          }

          const stripeSubscriptionId =
            session.mode === "subscription"
              ? (session.subscription as string)
              : undefined;

          // Check existing enrollment to handle upgrades and prevent downgrades.
          // Query by userId + status + livemode (not by composite ID) because
          // a single purchase unlocks all courses — the enrollment may have any courseId.
          const existingSnap = await adminDb
            .collection("enrollments")
            .where("userId", "==", firebaseUid)
            .where("status", "==", "active")
            .where("livemode", "==", session.livemode)
            .limit(1)
            .get();
          const existingData = existingSnap.empty
            ? null
            : existingSnap.docs[0].data();
          const existingMatchesMode = !!existingData;

          // Never downgrade lifetime → monthly (even if a stale session completes)
          if (
            existingMatchesMode &&
            existingData?.status === "active" &&
            existingData?.planType === "lifetime" &&
            planType === "monthly"
          ) {
            // Immediately cancel the new subscription so user isn't billed
            if (stripeSubscriptionId) {
              try {
                await stripe.subscriptions.cancel(stripeSubscriptionId);
              } catch {
                // Best effort
              }
            }
            break;
          }

          // If user had an old subscription in the same mode, cancel it before
          // creating new enrollment (e.g. upgrading monthly → lifetime)
          const oldSubId =
            existingMatchesMode ? existingData?.stripeSubscriptionId : undefined;
          if (
            oldSubId &&
            oldSubId !== stripeSubscriptionId
          ) {
            try {
              await stripe.subscriptions.cancel(oldSubId);
            } catch {
              // Old subscription may already be cancelled
            }
          }

          await createEnrollmentWithPurchase(
            firebaseUid,
            courseId,
            session.id,
            (session.payment_intent as string) ?? "",
            (session.customer as string) ?? "",
            session.amount_total ?? 0,
            session.currency ?? "usd",
            planType,
            stripeSubscriptionId,
            session.livemode
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        // Look up enrollment by stripeSubscriptionId (not composite ID)
        // because a single purchase unlocks all courses.
        const subscription = event.data.object as Stripe.Subscription;
        const snapshot = await adminDb
          .collection("enrollments")
          .where("stripeSubscriptionId", "==", subscription.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const enrollId = snapshot.docs[0].id;
          const periodEnd =
            subscription.items.data[0]?.current_period_end;

          await markCancelAtPeriodEnd(
            enrollId,
            subscription.cancel_at_period_end,
            periodEnd ? new Date(periodEnd * 1000) : undefined
          );

          // If subscription went past_due or unpaid, revoke access
          if (
            subscription.status === "past_due" ||
            subscription.status === "unpaid"
          ) {
            await updateEnrollmentStatus(enrollId, "revoked");
          }
          // If subscription is re-activated (e.g. payment succeeded after past_due)
          if (subscription.status === "active") {
            await updateEnrollmentStatus(enrollId, "active");
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription actually ended — revoke access
        const subscription = event.data.object as Stripe.Subscription;
        await revokeEnrollmentBySubscription(subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        // A subscription renewal payment failed
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId =
          typeof subRef === "string" ? subRef : subRef?.id ?? null;

        if (subId) {
          // Look up the enrollment by subscription ID and mark it
          const snapshot = await adminDb
            .collection("enrollments")
            .where("stripeSubscriptionId", "==", subId)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            // Mark as payment_failed so the UI can show a warning
            await snapshot.docs[0].ref.update({
              paymentFailed: true,
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge without processing
        return NextResponse.json({ received: true }, { status: 200 });
    }

    // Mark event as fully processed (doc was already claimed above)
    await eventRef.update({ processedAt: new Date().toISOString() });
  } catch (error) {
    console.error(`Failed to handle ${event.type}:`, error);
    // Unclaim the event so Stripe's retry can process it
    try {
      await eventRef.delete();
    } catch {
      // Best-effort cleanup
    }
    return NextResponse.json(
      { error: "Failed to process event." },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
