import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { createEnrollmentWithPurchase } from "@/lib/firestore/enrollments";
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

  // Deduplicate webhook events to prevent replay attacks
  const eventRef = adminDb.collection("processedEvents").doc(event.id);
  const eventDoc = await eventRef.get();
  if (eventDoc.exists) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const firebaseUid = session.metadata?.firebaseUid;
      const courseId = session.metadata?.courseId;

      if (!firebaseUid || !courseId) {
        console.error("Missing metadata in checkout session:", session.id);
        return NextResponse.json(
          { error: "Missing metadata." },
          { status: 400 }
        );
      }

      try {
        await createEnrollmentWithPurchase(
          firebaseUid,
          courseId,
          session.id,
          (session.payment_intent as string) ?? "",
          (session.customer as string) ?? "",
          session.amount_total ?? 0,
          session.currency ?? "usd"
        );
      } catch (error) {
        console.error("Failed to create enrollment:", error);
        return NextResponse.json(
          { error: "Failed to process enrollment." },
          { status: 500 }
        );
      }
    }
  }

  // Mark event as processed
  await eventRef.set({ processedAt: new Date().toISOString() });

  return NextResponse.json({ received: true }, { status: 200 });
}
