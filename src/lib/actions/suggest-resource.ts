"use server";

import { adminAuth } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { verifyTurnstileToken } from "@/lib/auth/verify-turnstile";
import { suggestionLimiter } from "@/lib/rate-limit";
import {
  ALLOWED_IMAGE_HOSTS_LABEL,
  isAllowedImageHost,
  normalizeResourceUrl,
} from "@/lib/resource-url";
import { RESOURCE_TAGS } from "@/lib/resource-taxonomy";
import {
  MAX_IMAGE_BYTES,
  isImageUrlReachable,
  isUrlReachable,
} from "@/lib/url-liveness";
import {
  assetExistsWithUrl,
  countUserSuggestionsLast24h,
  createSuggestion,
} from "@/lib/firestore/suggestions";

const MAX_TITLE_LENGTH = 200;
const MAX_ARTIST_LENGTH = 200;
const MAX_URL_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_IMAGE_URL_LENGTH = 1000;
const MAX_TAGS = 20;
const DAILY_CAP = 5;
const MIN_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000;

const ALLOWED_TAG_SET: Set<string> = new Set(RESOURCE_TAGS);

export interface SuggestResult {
  ok: boolean;
  error?: string;
}

export interface SuggestInput {
  url: string;
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  tags?: string[];
  turnstileToken: string;
}

export async function suggestResourceAction(
  input: SuggestInput
): Promise<SuggestResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to suggest a resource." };
  }

  const { success } = suggestionLimiter.limit(user.uid);
  if (!success) {
    return { ok: false, error: "Too many requests. Please slow down." };
  }

  const turnstileOk = await verifyTurnstileToken(input.turnstileToken);
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

  const urlInput = (input.url ?? "").trim();
  const titleInput = (input.title ?? "").trim();
  const artistInput = (input.artistName ?? "").trim();
  const descriptionInput = (input.description ?? "").trim();
  const imageUrlInput = (input.imageUrl ?? "").trim();
  const rawTags = Array.isArray(input.tags) ? input.tags : [];

  if (titleInput.length === 0) {
    return { ok: false, error: "Please enter a title." };
  }
  if (titleInput.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: "Title is too long." };
  }
  if (artistInput.length === 0) {
    return { ok: false, error: "Please enter the artist's name." };
  }
  if (artistInput.length > MAX_ARTIST_LENGTH) {
    return { ok: false, error: "Artist name is too long." };
  }
  if (descriptionInput.length === 0) {
    return { ok: false, error: "Please enter a description." };
  }
  if (descriptionInput.length > MAX_DESCRIPTION_LENGTH) {
    return { ok: false, error: "Description is too long." };
  }
  if (urlInput.length === 0) {
    return { ok: false, error: "Please enter a URL." };
  }
  if (urlInput.length > MAX_URL_LENGTH) {
    return { ok: false, error: "URL is too long." };
  }
  if (imageUrlInput.length === 0) {
    return { ok: false, error: "Please enter an image URL." };
  }
  if (imageUrlInput.length > MAX_IMAGE_URL_LENGTH) {
    return { ok: false, error: "Image URL is too long." };
  }

  const normalized = normalizeResourceUrl(urlInput);
  if (!normalized) {
    return {
      ok: false,
      error:
        "URL must be a direct link to a resource on Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io.",
    };
  }

  // Image URL: validate shape + allowlist the host so we don't end up showing
  // arbitrary third-party images in the admin review UI.
  let parsedImage: URL;
  try {
    parsedImage = new URL(imageUrlInput);
  } catch {
    return { ok: false, error: "Image URL isn't a valid link." };
  }
  if (parsedImage.protocol !== "https:" && parsedImage.protocol !== "http:") {
    return { ok: false, error: "Image URL must be an http(s) link." };
  }
  if (!isAllowedImageHost(imageUrlInput)) {
    return {
      ok: false,
      error: `Image must be hosted on ${ALLOWED_IMAGE_HOSTS_LABEL}.`,
    };
  }

  // Tags: drop anything not on the allowlist, de-dup, cap count.
  const tags = Array.from(
    new Set(
      rawTags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter((t) => ALLOWED_TAG_SET.has(t))
    )
  ).slice(0, MAX_TAGS);

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

  // Liveness checks — run in parallel to keep latency low.
  const [urlOk, imageCheck] = await Promise.all([
    isUrlReachable(normalized.url),
    isImageUrlReachable(imageUrlInput),
  ]);
  if (!urlOk) {
    return {
      ok: false,
      error: "That link returned an error. Please double-check the URL.",
    };
  }
  if (!imageCheck.ok) {
    const maxMb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024));
    const message =
      imageCheck.reason === "too-large"
        ? `Image is too large. Please use one under ${maxMb} MB.`
        : imageCheck.reason === "not-image"
          ? "That URL doesn't point to an image."
          : "The image URL didn't load or isn't an image.";
    return { ok: false, error: message };
  }

  // Atomic create — same URL by the same user is a no-op (idempotent).
  // Same URL by a different user is rejected as a duplicate.
  const result = await createSuggestion({
    userId: user.uid,
    userEmail: user.email,
    title: titleInput,
    artistName: artistInput,
    description: descriptionInput,
    imageUrl: imageUrlInput,
    externalUrl: normalized.url,
    source: normalized.source,
    tags,
  });

  if (!result.created) {
    // Status-aware dedup messaging.
    if (result.existingStatus === "rejected") {
      return {
        ok: false,
        error: "This link was previously reviewed and not added to the hub.",
      };
    }
    if (result.existingStatus === "imported") {
      return {
        ok: false,
        error: "This resource is already in the Resource Hub.",
      };
    }
    if (result.existingUserId !== user.uid) {
      return { ok: false, error: "This link has already been suggested." };
    }
    // Same user, status "new" — quiet idempotent success.
  }

  return { ok: true };
}
