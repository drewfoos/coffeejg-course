"use server";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true if the token is valid, false otherwise.
 *
 * In development (no secret key configured), always returns true
 * so local dev isn't blocked.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Skip verification in dev if no secret configured
  if (!secret) return true;

  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });

    const data = await res.json();
    return data.success === true;
  } catch {
    // If Cloudflare is unreachable, fail open to avoid locking users out.
    // Rate limiting still protects against abuse.
    return true;
  }
}
