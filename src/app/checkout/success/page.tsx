import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { stripe } from "@/lib/stripe";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let courseId: string;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    // Verify this session belongs to the logged-in user
    if (session.client_reference_id !== user.uid) {
      redirect("/");
    }
    courseId = session.metadata?.courseId ?? "";
  } catch {
    redirect("/");
  }

  if (!courseId) {
    redirect("/");
  }

  const enrollment = await getEnrollment(user.uid, courseId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      {enrollment ? (
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            You now have full access to the course. Start learning right away.
          </p>
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to Course
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <svg
              className="h-8 w-8 animate-spin text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Processing Your Payment...</h1>
          <p className="text-muted-foreground">
            Your payment was received. We are setting up your access now. This
            usually takes just a few seconds.
          </p>
          <p className="text-sm text-muted-foreground">
            Please refresh this page in a moment.
          </p>
        </div>
      )}
    </main>
  );
}
