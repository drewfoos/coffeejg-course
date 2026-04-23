"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { verifyTurnstileToken } from "@/lib/auth/verify-turnstile";
import { suggestionLimiter } from "@/lib/rate-limit";
import { normalizeResourceUrl } from "@/lib/resource-url";
import {
  assetExistsWithUrl,
  countUserSuggestionsLast24h,
  createSuggestion,
} from "@/lib/firestore/suggestions";

const MAX_URL_LENGTH = 500;
const MAX_NOTE_LENGTH = 500;
const DAILY_CAP = 5;
const MIN_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000;

export interface SuggestResult {
  ok: boolean;
  error?: string;
}

export async function suggestResourceAction(
  rawUrl: string,
  rawNote: string,
  turnstileToken: string
): Promise<SuggestResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to suggest a resource." };
  }

  const { success } = suggestionLimiter.limit(user.uid);
  if (!success) {
    return { ok: false, error: "Too many requests. Please slow down." };
  }

  const turnstileOk = await verifyTurnstileToken(turnstileToken);
  if (!turnstileOk) {
    return { ok: false, error: "Security verification failed. Please try again." };
  }

  // Account age gate — blocks throwaway accounts
  try {
    const record = await adminAuth.getUser(user.uid);
    const createdAt = record.metadata.creationTime
      ? new Date(record.metadata.creationTime).getTime()
      : Date.now();
    if (Date.now() - createdAt < MIN_ACCOUNT_AGE_MS) {
      return {
        ok: false,
        error:
          "Accounts must be at least 24 hours old to submit suggestions. Thanks for your patience!",
      };
    }
  } catch {
    return { ok: false, error: "Could not verify your account. Please try again." };
  }

  const urlInput = (rawUrl ?? "").trim();
  const noteInput = (rawNote ?? "").trim();

  if (urlInput.length === 0) {
    return { ok: false, error: "Please enter a URL." };
  }
  if (urlInput.length > MAX_URL_LENGTH) {
    return { ok: false, error: "URL is too long." };
  }
  if (noteInput.length > MAX_NOTE_LENGTH) {
    return { ok: false, error: "Note is too long (max 500 characters)." };
  }

  const normalized = normalizeResourceUrl(urlInput);
  if (!normalized) {
    return {
      ok: false,
      error:
        "URL must be a direct link to a resource on Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io.",
    };
  }

  // Firestore-backed daily cap (distributed, survives instance reuse)
  const recentCount = await countUserSuggestionsLast24h(user.uid);
  if (recentCount >= DAILY_CAP) {
    return {
      ok: false,
      error: `You've reached the daily limit of ${DAILY_CAP} suggestions. Please try again tomorrow.`,
    };
  }

  // Already in the hub? Reject before attempting the suggestion write.
  if (await assetExistsWithUrl(normalized.url)) {
    return { ok: false, error: "This resource is already in the Resource Hub." };
  }

  // Atomic create — same URL by the same user is a no-op (idempotent).
  // Same URL by a different user is rejected as a duplicate.
  const result = await createSuggestion({
    userId: user.uid,
    userEmail: user.email,
    externalUrl: normalized.url,
    source: normalized.source,
    note: noteInput,
  });

  if (!result.created && result.existingUserId !== user.uid) {
    return { ok: false, error: "This resource has already been suggested." };
  }

  return { ok: true };
}
