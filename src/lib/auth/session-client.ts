"use client";

import { setSessionCookie } from "./session";

const STORAGE_KEY = "session_refreshed_at";

// Server cookie is good for 5 days. Refresh if the last set was more than
// 4 days ago — keeps the cookie from ever expiring in a logged-in tab while
// avoiding a Server Action POST on every page load.
const REFRESH_AFTER_MS = 4 * 24 * 60 * 60 * 1000;

function readTimestamp(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) ? ts : null;
  } catch {
    return null;
  }
}

export function shouldRefreshSession(): boolean {
  const ts = readTimestamp();
  if (ts === null) return true;
  return Date.now() - ts > REFRESH_AFTER_MS;
}

export function markSessionRefreshed() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage disabled — worst case we POST on next load
  }
}

export function clearSessionMark() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export async function refreshSessionCookie(
  idToken: string,
  turnstileToken?: string
) {
  await setSessionCookie(idToken, turnstileToken);
  markSessionRefreshed();
}
