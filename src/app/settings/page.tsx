import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { adminDb } from "@/lib/firebase/admin";
import { stripe, stripeLiveMode } from "@/lib/stripe";
import { ManageSubscriptionButton } from "@/components/settings/manage-subscription-button";
import { CancelSubscriptionSection } from "@/components/settings/cancel-subscription-section";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { getAllCourses } from "@/lib/firestore/courses";
import { getLessonSummaries } from "@/lib/firestore/lessons";
import { getCourseProgress } from "@/lib/firestore/progress";
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

  // Parallelize all independent queries
  const [enrollmentSnap, userDoc, courses] = await Promise.all([
    adminDb
      .collection("enrollments")
      .where("userId", "==", user.uid)
      .where("status", "==", "active")
      .where("livemode", "==", stripeLiveMode)
      .limit(1)
      .get(),
    adminDb.collection("users").doc(user.uid).get(),
    getAllCourses(),
  ]);

  const hasEnrollment = !enrollmentSnap.empty;
  const enrollment = hasEnrollment ? enrollmentSnap.docs[0].data() : null;
  const userData = userDoc.data();

  // Resolve Stripe customer ID (with fallback to purchase records)
  let stripeCustomerId = userData?.stripeCustomerId ?? null;
  if (!stripeCustomerId) {
    const purchaseSnap = await adminDb
      .collection("purchases")
      .where("userId", "==", user.uid)
      .where("livemode", "==", stripeLiveMode)
      .limit(1)
      .get();
    if (!purchaseSnap.empty) {
      stripeCustomerId =
        purchaseSnap.docs[0].data()?.stripeCustomerId ?? null;
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

  // Fetch progress for all courses in parallel
  const courseProgress = hasEnrollment
    ? await Promise.all(
        courses.map(async (course) => {
          const [lessons, progress] = await Promise.all([
            getLessonSummaries(course.id),
            getCourseProgress(user.uid, course.id),
          ]);
          const completedCount = Array.from(progress.values()).filter(
            Boolean
          ).length;
          return {
            id: course.id,
            title: course.title,
            totalLessons: lessons.length,
            completedLessons: completedCount,
          };
        })
      )
    : [];

  const totalLessons = courseProgress.reduce(
    (sum, c) => sum + c.totalLessons,
    0
  );
  const totalCompleted = courseProgress.reduce(
    (sum, c) => sum + c.completedLessons,
    0
  );

  const intervalLabels: Record<string, string> = {
    day: "daily",
    week: "weekly",
    month: "monthly",
    year: "yearly",
  };

  const authProvider = userData?.authProvider ?? "email";
  const memberSince = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Settings</h1>

      {/* Account Info */}
      <section className="rounded-lg border border-border/50 bg-card p-6">
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
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sign-in method</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              {authProvider === "google" ? (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                  Email
                </>
              )}
            </span>
          </div>
          {memberSince && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member since</span>
              <span className="text-sm font-medium">{memberSince}</span>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-border/30 pt-4">
          <SignOutButton />
        </div>
      </section>

      {/* Subscription Status */}
      <section className="mt-6 rounded-lg border border-border/50 bg-card p-6">
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
                {(
                  intervalLabels[subscription.interval] ||
                  subscription.interval
                )
                  .charAt(0)
                  .toUpperCase() +
                  (
                    intervalLabels[subscription.interval] ||
                    subscription.interval
                  ).slice(1)}{" "}
                Subscription
              </span>
            </div>

            {/* Details */}
            <div className="rounded-md border border-border/30 bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${(subscription.amount / 100).toFixed(2)} /{" "}
                  {subscription.interval}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {subscription.cancelAtPeriodEnd
                    ? "Access until"
                    : "Next billing date"}
                </span>
                <span className="font-medium">
                  {new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd ? (
              <div className="rounded-md border border-orange-500/20 bg-orange-500/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Your subscription has been cancelled. You&apos;ll continue to
                  have access until{" "}
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

            {/* Upgrade CTA for monthly users */}
            {!subscription.cancelAtPeriodEnd && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">
                      Switch to Lifetime Access
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Pay once, keep access forever. No more monthly charges.
                    </p>
                  </div>
                  <Link
                    href="/pro"
                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Upgrade
                  </Link>
                </div>
              </div>
            )}

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
            {/* Upgrade CTA */}
            <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">
                    Switch to Lifetime Access
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Pay once, keep access forever. No more monthly charges.
                  </p>
                </div>
                <Link
                  href="/pro"
                  className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Upgrade
                </Link>
              </div>
            </div>
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
      </section>

      {/* Course Progress */}
      {hasEnrollment && courseProgress.length > 0 && (
        <section className="mt-6 rounded-lg border border-border/50 bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Course Progress</h2>
            {totalLessons > 0 && (
              <span className="text-sm text-muted-foreground">
                {totalCompleted}/{totalLessons} lessons
              </span>
            )}
          </div>

          {/* Overall progress bar */}
          {totalLessons > 0 && (
            <div className="mb-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.round((totalCompleted / totalLessons) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {totalCompleted === totalLessons
                  ? "All lessons completed!"
                  : `${Math.round((totalCompleted / totalLessons) * 100)}% complete`}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {courseProgress.map((course) => {
              const pct =
                course.totalLessons > 0
                  ? Math.round(
                      (course.completedLessons / course.totalLessons) * 100
                    )
                  : 0;
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex items-center gap-4 rounded-md border border-border/30 bg-muted/20 p-3.5 transition-colors hover:bg-accent/50"
                >
                  <div className="relative h-10 w-10 shrink-0">
                    <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        strokeWidth="3"
                        className="stroke-muted"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="stroke-primary"
                        strokeDasharray={`${pct * 0.974} 100`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
                      {pct}%
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {course.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {course.completedLessons} of {course.totalLessons} lessons
                      completed
                    </p>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Danger Zone */}
      <section className="mt-10 rounded-lg border border-red-500/20 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data. Active
          subscriptions will be cancelled immediately. This cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
