"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 5; // 5 days

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, idToken, {
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
