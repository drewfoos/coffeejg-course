import { Testimonials } from "@/components/testimonials";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getActiveEnrollment } from "@/lib/firestore/enrollments";
import { BuyCourseButton } from "@/components/course/buy-course-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Video, BarChart3, RefreshCw } from "lucide-react";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import type { PlanType } from "@/lib/actions/checkout";

// courseId used for Stripe metadata and navigation — the actual enrollment
// grants access to ALL courses, not just this one.
const DEFAULT_COURSE_ID = "3d-vtubing-with-warudo";

// Cache both prices in memory to avoid hitting Stripe on every page load
let priceCache: { data: { lifetime: string; monthly: string; monthlyInterval: string }; expiresAt: number } | null = null;
const PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getPrices(): Promise<{ lifetime: string; monthly: string; monthlyInterval: string }> {
  if (priceCache && Date.now() < priceCache.expiresAt) {
    return priceCache.data;
  }

  const lifetimeId = process.env.STRIPE_LIFETIME_PRICE_ID;
  const monthlyId = process.env.STRIPE_MONTHLY_PRICE_ID;

  const defaults = { lifetime: "$2.00", monthly: "$5.00", monthlyInterval: "/year" };

  try {
    const [lifetimePrice, monthlyPrice] = await Promise.all([
      lifetimeId ? stripe.prices.retrieve(lifetimeId) : null,
      monthlyId ? stripe.prices.retrieve(monthlyId) : null,
    ]);

    const formatPrice = (p: { unit_amount: number | null; currency: string } | null, fallback: string) => {
      if (!p || p.unit_amount == null) return fallback;
      const amount = (p.unit_amount / 100).toFixed(2);
      const currency = (p.currency ?? "usd").toUpperCase();
      const symbol = currency === "USD" ? "$" : currency + " ";
      return `${symbol}${amount}`;
    };

    const intervalMap: Record<string, string> = {
      day: "/day",
      week: "/week",
      month: "/mo",
      year: "/year",
    };
    const interval = monthlyPrice?.recurring?.interval ?? "month";
    const monthlyInterval = intervalMap[interval] || `/${interval}`;

    const data = {
      lifetime: formatPrice(lifetimePrice, defaults.lifetime),
      monthly: formatPrice(monthlyPrice, defaults.monthly),
      monthlyInterval,
    };

    priceCache = { data, expiresAt: Date.now() + PRICE_CACHE_TTL };
    return data;
  } catch {
    return defaults;
  }
}

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
  const [user, prices] = await Promise.all([
    getCurrentUser(),
    getPrices(),
  ]);
  const enrollment = user
    ? await getActiveEnrollment(user.uid)
    : null;
  const isEnrolled = enrollment?.status === "active";
  const isCancelling = isEnrolled && enrollment?.cancelAtPeriodEnd === true;
  const isMonthly = isEnrolled && enrollment?.planType === "monthly";
  const isLifetime = isEnrolled && enrollment?.planType === "lifetime";
  // Show plans if not enrolled, or on monthly (upgrade to lifetime only)
  const showPlans = !isEnrolled || isMonthly;

  const plans: {
    name: string;
    price: string;
    period: string;
    planType: PlanType;
    description: string;
    features: string[];
    popular: boolean;
  }[] = [
    {
      name: "Monthly Access",
      price: prices.monthly,
      period: prices.monthlyInterval,
      planType: "monthly",
      description: "Flexible, cancel anytime",
      features: [
        "All course lessons",
        "Progress tracking",
        "Cancel anytime",
      ],
      popular: false,
    },
    {
      name: "Lifetime Access",
      price: prices.lifetime,
      period: "one-time",
      planType: "lifetime",
      description: "Pay once, learn forever",
      features: [
        "All course lessons",
        "Progress tracking",
        "Lifetime access — never expires",
        "All future courses and updates",
      ],
      popular: true,
    },
  ];

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
        {isLifetime ? (
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
                  href={`/courses/${DEFAULT_COURSE_ID}`}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Go to Course
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl px-4">
            {isCancelling && enrollment?.currentPeriodEnd && (
              <div className="mb-6 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4 text-center text-sm text-muted-foreground">
                Your current subscription ends{" "}
                <strong>
                  {new Date(enrollment.currentPeriodEnd).toLocaleDateString(
                    undefined,
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </strong>
                . Choose a plan below to keep your access.
              </div>
            )}
            {isMonthly && (
              <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-muted-foreground">
                You&apos;re on a monthly plan. Upgrade to lifetime for permanent access.
              </div>
            )}
            <div className={`grid gap-8 ${isMonthly ? "max-w-md mx-auto" : "md:grid-cols-2"}`}>
              {plans.filter((plan) => {
                // Monthly subscribers (active or cancelling) only see the lifetime upgrade
                if (isMonthly) return plan.planType === "lifetime";
                return true;
              }).map((plan) => (
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
                      courseId={DEFAULT_COURSE_ID}
                      price={plan.price}
                      planType={plan.planType}
                      label={`Get ${plan.name}`}
                      variant={plan.popular ? "default" : "outline"}
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
              Secure payment powered by Stripe. By purchasing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              .
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
