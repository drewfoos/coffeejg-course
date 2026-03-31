import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/** True when running against Stripe live keys, false for test keys */
export const stripeLiveMode =
  process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
