import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeLiveMode } from "@/lib/stripe";
import { ManageSubscriptionButton } from "@/components/settings/manage-subscription-button";
import { CancelSubscriptionSection } from "@/components/settings/cancel-subscription-section";
import Link from "next/link";

async function getSubscriptionDetails(stripeCustomerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) return null;

    const sub = subscriptions.data[0];
    const item = sub.items.data[0];
    return {
      id: sub.id,
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: new Date(
        (item?.current_period_end ?? 0) * 1000
      ).toISOString(),
      amount: item?.price?.unit_amount ?? 0,
      currency: item?.price?.currency ?? "usd",
      interval: item?.price?.recurring?.interval ?? "month",
    };
  } catch {
    return null;
  }
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Parallelize all independent Firestore queries
  const [enrollmentSnap, userDoc] = await Promise.all([
    adminDb
      .collection("enrollments")
      .where("userId", "==", user.uid)
      .where("status", "==", "active")
      .where("livemode", "==", stripeLiveMode)
      .limit(1)
      .get(),
    adminDb.collection("users").doc(user.uid).get(),
  ]);
  const hasEnrollment = !enrollmentSnap.empty;
  const enrollment = hasEnrollment ? enrollmentSnap.docs[0].data() : null;

  // Resolve Stripe customer ID (with fallback to purchase records)
  let stripeCustomerId = userDoc.data()?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const purchaseSnap = await adminDb
      .collection("purchases")
      .where("userId", "==", user.uid)
      .limit(1)
      .get();
    if (!purchaseSnap.empty) {
      stripeCustomerId = purchaseSnap.docs[0].data()?.stripeCustomerId ?? null;
      if (stripeCustomerId) {
        await adminDb
          .collection("users")
          .doc(user.uid)
          .set({ stripeCustomerId }, { merge: true });
      }
    }
  }

  // Get live subscription details from Stripe
  const subscription =
    stripeCustomerId && enrollment?.planType === "monthly"
      ? await getSubscriptionDetails(stripeCustomerId)
      : null;

  const intervalLabels: Record<string, string> = {
    day: "daily",
    week: "weekly",
    month: "monthly",
    year: "yearly",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Settings</h1>

      {/* Account Info */}
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="text-sm font-medium">
              {user.name || "Not set"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{user.email}</span>
          </div>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mt-6 rounded-lg border border-border/50 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Subscription</h2>

        {!hasEnrollment ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No active subscription. Get Pro access to unlock all course
              content.
            </p>
            <Link
              href="/pro"
              className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Pro Access
            </Link>
          </div>
        ) : enrollment?.planType === "monthly" && subscription ? (
          <div className="space-y-4">
            {/* Status badge */}
            <div className="flex items-center gap-2">
              {subscription.cancelAtPeriodEnd ? (
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-500">
                  Cancelling
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Active
                </span>
              )}
              <span className="text-sm font-medium">
                {(intervalLabels[subscription.interval] || subscription.interval).charAt(0).toUpperCase() +
                  (intervalLabels[subscription.interval] || subscription.interval).slice(1)}{" "}
                Subscription
              </span>
            </div>

            {/* Details */}
            <div className="rounded-md border border-border/30 bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${(subscription.amount / 100).toFixed(2)}{" "}
                  / {subscription.interval}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? "Access until"
                    : "Next billing date"}
                </span>
                <span className="font-medium">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    undefined,
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </span>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd ? (
              <div className="rounded-md border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Your subscription has been cancelled. You&apos;ll continue to have
                  access until{" "}
                  <strong>
                    {new Date(
                      subscription.currentPeriodEnd
                    ).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </strong>
                  . After that, your access will be removed.
                </p>
              </div>
            ) : null}

            <CancelSubscriptionSection
              isCancelling={subscription.cancelAtPeriodEnd}
            />

            {stripeCustomerId && (
              <div className="border-t border-border/30 pt-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  Update payment methods or view invoices:
                </p>
                <ManageSubscriptionButton />
              </div>
            )}
          </div>
        ) : enrollment?.planType === "monthly" ? (
          /* Monthly plan but Stripe details unavailable */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Active
              </span>
              <span className="text-sm font-medium">Monthly Subscription</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You have an active monthly subscription to all course content.
            </p>
          </div>
        ) : (
          /* Lifetime plan */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Active
              </span>
              <span className="text-sm font-medium">Lifetime Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You have permanent access to all course content. No recurring
              charges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
