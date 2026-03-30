import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { adminDb } from "@/lib/firebase/admin";
import { ManageSubscriptionButton } from "@/components/settings/manage-subscription-button";

const COURSE_ID = "3d-vtubing-with-warudo";

async function getStripeCustomerId(uid: string): Promise<string | null> {
  // Check user doc first
  const userDoc = await adminDb.collection("users").doc(uid).get();
  const fromUser = userDoc.data()?.stripeCustomerId;
  if (fromUser) return fromUser;

  // Fall back to purchases collection
  const purchaseSnap = await adminDb
    .collection("purchases")
    .where("userId", "==", uid)
    .limit(1)
    .get();

  if (!purchaseSnap.empty) {
    const customerId = purchaseSnap.docs[0].data().stripeCustomerId;
    if (customerId) {
      await adminDb
        .collection("users")
        .doc(uid)
        .update({ stripeCustomerId: customerId });
    }
    return customerId ?? null;
  }

  return null;
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Check enrollment (same way pro page does)
  const enrollmentDoc = await adminDb
    .collection("enrollments")
    .where("userId", "==", user.uid)
    .limit(1)
    .get();
  const hasEnrollment = !enrollmentDoc.empty;
  const enrollment = hasEnrollment ? enrollmentDoc.docs[0].data() : null;

  const stripeCustomerId = await getStripeCustomerId(user.uid);
  const hasStripeCustomer = !!stripeCustomerId;

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
        {hasEnrollment ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Active
              </span>
              <span className="text-sm font-medium">
                {enrollment?.planType === "subscription"
                  ? "Annual Subscription"
                  : "Lifetime Access"}
              </span>
            </div>
            {enrollment?.planType === "subscription" ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your subscription renews annually. You can manage your
                  subscription, update payment methods, or cancel through the
                  Stripe customer portal.
                </p>
                {hasStripeCustomer && <ManageSubscriptionButton />}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You have permanent access to all course content. No recurring
                charges.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No active subscription. Get Pro access to unlock all course
              content.
            </p>
            <a
              href="/pro"
              className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Pro Access
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
