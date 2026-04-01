"use server";

import { cookies, headers } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { authLimiter } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/auth/verify-turnstile";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days (in seconds)

/**
 * Creates a Firebase session cookie from an ID token.
 * The session cookie is server-controlled with a matching expiry,
 * eliminating the mismatch between cookie lifetime and token lifetime.
 */
export async function setSessionCookie(idToken: string, turnstileToken?: string) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const { success } = authLimiter.limit(ip);
  if (!success) {
    throw new Error("Too many requests. Please try again later.");
  }

  // Verify Turnstile token (skipped if not provided — e.g. Google OAuth popup)
  if (turnstileToken !== undefined) {
    const valid = await verifyTurnstileToken(turnstileToken);
    if (!valid) {
      throw new Error("Security verification failed. Please try again.");
    }
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE * 1000, // Firebase expects milliseconds
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
