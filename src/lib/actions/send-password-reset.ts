"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { authLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/auth/verify-turnstile";
import { headers } from "next/headers";

/**
 * Server action to send a password reset email.
 * Verifies Turnstile token before sending to prevent email abuse.
 *
 * Always returns success to avoid email enumeration — even if the
 * email doesn't exist, we don't reveal that.
 */
export async function sendPasswordResetAction(
  email: string,
  turnstileToken: string
): Promise<void> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { success } = authLimiter.limit(ip);
  if (!success) {
    throw new Error("Too many requests. Please try again later.");
  }

  const valid = await verifyTurnstileToken(turnstileToken);
  if (!valid) {
    throw new Error("Security verification failed. Please try again.");
  }

  try {
    await adminAuth.generatePasswordResetLink(email);
  } catch {
    // Silently swallow — don't reveal whether the email exists
  }
}
