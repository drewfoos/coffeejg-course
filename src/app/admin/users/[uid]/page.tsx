import { getUserById, getUserEnrollments } from "@/lib/firestore/admin-users";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RevokeEnrollmentButton } from "@/components/admin/revoke-enrollment-button";
import { CancelSubscriptionButton } from "@/components/admin/cancel-subscription-button";
import { DeleteUserButton } from "@/components/admin/delete-user-button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  const [user, enrollments] = await Promise.all([
    getUserById(uid),
    getUserEnrollments(uid),
  ]);

  if (!user) notFound();

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const revokedEnrollments = enrollments.filter((e) => e.status === "revoked");

  return (
    <div>
      <Link
        href="/admin/users"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to Users
      </Link>

      {/* User info */}
      <div className="mt-6 rounded-lg border border-border/50 bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {user.displayName || "No name"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {user.authProvider}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-muted-foreground">User ID</p>
            <p className="mt-0.5 font-mono text-xs break-all">{user.uid}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Joined</p>
            <p className="mt-0.5">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Stripe Customer</p>
            <p className="mt-0.5 font-mono text-xs">
              {user.stripeCustomerId || "None"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Enrollments</p>
            <p className="mt-0.5">
              {activeEnrollments.length} active
              {revokedEnrollments.length > 0 &&
                `, ${revokedEnrollments.length} revoked`}
            </p>
          </div>
        </div>
      </div>

      {/* Active Enrollments */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Active Enrollments</h2>
        <div className="mt-3 space-y-2">
          {activeEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active enrollments.
            </p>
          ) : (
            activeEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="rounded-lg border border-border/50 bg-card px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">VTubing Course</p>
                      {enrollment.cancelAtPeriodEnd && (
                        <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-500">
                          Cancelling
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {enrollment.planType === "monthly" ? "Subscription" : "Lifetime"}{" "}
                      &middot; {enrollment.source}{" "}
                      &middot; Enrolled{" "}
                      {enrollment.enrolledAt
                        ? new Date(enrollment.enrolledAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                    {enrollment.cancelAtPeriodEnd && enrollment.currentPeriodEnd && (
                      <p className="mt-1 text-xs text-orange-500">
                        Access until{" "}
                        {new Date(enrollment.currentPeriodEnd).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {enrollment.planType === "monthly" &&
                      user.stripeCustomerId &&
                      !enrollment.cancelAtPeriodEnd && (
                        <CancelSubscriptionButton
                          uid={uid}
                          stripeCustomerId={user.stripeCustomerId}
                        />
                      )}
                    <RevokeEnrollmentButton
                      enrollmentId={enrollment.id}
                      uid={uid}
                      courseId={enrollment.courseId}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revoked Enrollments */}
      {revokedEnrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Revoked Enrollments</h2>
          <div className="mt-3 space-y-2">
            {revokedEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-5 py-4 opacity-60"
              >
                <div>
                  <p className="text-sm font-semibold">{enrollment.courseId}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {enrollment.planType === "monthly" ? "Subscription" : "Lifetime"}{" "}
                    &middot; {enrollment.source}{" "}
                    &middot; Revoked
                  </p>
                </div>
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs text-red-500">
                  Revoked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="mt-10 rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete this user account. This will remove all their data
          including enrollments, progress, favorites, and their Firebase Auth
          account. Active subscriptions will be cancelled. This action cannot be
          undone.
        </p>
        <div className="mt-4">
          <DeleteUserButton uid={uid} displayName={user.displayName || user.email} />
        </div>
      </div>
    </div>
  );
}
