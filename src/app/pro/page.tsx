import { Testimonials } from "@/components/testimonials";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getEnrollment } from "@/lib/firestore/enrollments";
import { BuyCourseButton } from "@/components/course/buy-course-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Video, BarChart3, RefreshCw } from "lucide-react";
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

const PERKS = [
  {
    icon: Video,
    title: "10+ Video Lessons",
    desc: "Step-by-step tutorials from setup to going live",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    desc: "Mark lessons complete and pick up where you left off",
  },
  {
    icon: RefreshCw,
    title: "Future Updates",
    desc: "New lessons and content added over time",
  },
];

export default async function ProPage() {
  const user = await getCurrentUser();
  const enrollment = user
    ? await getEnrollment(user.uid, COURSE_ID)
    : null;
  const isEnrolled = enrollment?.status === "active";

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-pink-500/5" />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center">
          <Badge variant="secondary" className="mb-6">
            PRO
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
            Get{" "}
            <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              Unlimited Access
            </span>{" "}
            to All Videos
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Learn everything you need to become a professional 3D VTuber.
            Choose the plan that works for you.
          </p>
        </div>
      </section>

      {/* Plans or Enrolled state */}
      <section className="relative -mt-4 pb-20">
        {isEnrolled ? (
          <div className="mx-auto max-w-md px-4 text-center">
            <Card className="border-primary/30 shadow-lg shadow-primary/10">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
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
          <div className="mx-auto max-w-3xl px-4">
          <div className="grid gap-8 md:grid-cols-2">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-shadow ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 rounded-bl-lg bg-gradient-to-r from-primary to-pink-500 px-3 py-1 text-xs font-semibold text-primary-foreground">
                    BEST VALUE
                  </div>
                )}
                <CardContent className="flex h-full flex-col p-8">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-muted-foreground">
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

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Secure payment powered by Stripe. Cancel anytime.
          </p>
          </div>
        )}
      </section>

      {/* Perks */}
      <section className="border-t border-border/50 bg-card/50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="mb-10 text-center text-2xl font-bold">
            Everything you need to start VTubing
          </h3>
          <div className="grid gap-8 sm:grid-cols-3">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

    </main>
  );
}
