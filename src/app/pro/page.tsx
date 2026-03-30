import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { BuyCourseButton } from "@/components/course/buy-course-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const COURSE_ID = "3d-vtubing-with-warudo";

const PLANS = [
  {
    name: "Annual Access",
    price: "$2.00",
    period: "/ year",
    description: "Full access for one year",
    planType: "subscription" as const,
    features: [
      "All course lessons",
      "Progress tracking",
      "1 year of access",
      "Future updates during your plan",
    ],
    popular: false,
  },
  {
    name: "Lifetime Access",
    price: "$5.00",
    period: "one-time",
    description: "Pay once, learn forever",
    planType: "lifetime" as const,
    features: [
      "All course lessons",
      "Progress tracking",
      "Lifetime access — never expires",
      "All future courses and updates",
    ],
    popular: true,
  },
];

export default async function ProPage() {
  const user = await getCurrentUser();
  const enrollment = user
    ? await getEnrollment(user.uid, COURSE_ID)
    : null;
  const isEnrolled = enrollment?.status === "active";

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <Badge variant="secondary" className="mb-4">
          PRO
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          Get Unlimited Access to Videos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn everything you need to become a professional VTuber.
          Choose the plan that works for you.
        </p>
      </div>

      {isEnrolled ? (
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardContent className="p-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">You have access!</h2>
              <p className="text-muted-foreground">
                You already have full access to all course content.
              </p>
              <Link
                href={`/courses/${COURSE_ID}`}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Course
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden ${
                plan.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  BEST VALUE
                </div>
              )}
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>

                <BuyCourseButton
                  courseId={COURSE_ID}
                  price={plan.price}
                  label={`Get ${plan.name}`}
                  variant={plan.popular ? "default" : "outline"}
                  planType={plan.planType}
                />

                <Separator className="my-6" />

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <svg
                        className="h-5 w-5 shrink-0 text-primary mt-0.5"
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
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-20 text-center">
        <h3 className="text-2xl font-semibold mb-8">
          Everything you need to start VTubing
        </h3>
        <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </div>
            <p className="font-medium">10+ Video Lessons</p>
            <p className="text-sm text-muted-foreground">
              Step-by-step tutorials from setup to going live
            </p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <p className="font-medium">Track Progress</p>
            <p className="text-sm text-muted-foreground">
              Mark lessons complete and pick up where you left off
            </p>
          </div>
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M21.015 4.356v4.992" />
              </svg>
            </div>
            <p className="font-medium">Future Updates</p>
            <p className="text-sm text-muted-foreground">
              New lessons and content added over time
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-muted-foreground">
        <p>Secure payment powered by Stripe. Cancel anytime.</p>
      </div>
    </main>
  );
}
