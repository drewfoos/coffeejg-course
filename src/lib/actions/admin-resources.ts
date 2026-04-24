"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createAsset,
  deleteAsset,
  type AssetInput,
} from "@/lib/firestore/admin-assets";
import {
  getSuggestion,
  updateSuggestionStatus,
} from "@/lib/firestore/admin-suggestions";
import { ALLOWED_SOURCES, normalizeResourceUrl } from "@/lib/resource-url";
import { validateId } from "@/lib/validation";

const MAX_TITLE = 200;
const MAX_ARTIST = 200;
const MAX_DESC = 2000;
const MAX_URL = 500;
const MAX_IMG = 1000;
const MAX_TAGS = 20;
const MAX_TAG_LEN = 40;
const ALLOWED_SOURCE_NAMES: Set<string> = new Set(
  ALLOWED_SOURCES.map((s) => s.name)
);

function validateImageUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error();
    }
  } catch {
    throw new Error("Image URL must be a valid http(s) URL.");
  }
}

function sanitizeInput(input: unknown): AssetInput {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid input.");
  }
  const raw = input as Record<string, unknown>;

  const title = String(raw.title ?? "").trim();
  const artistName = String(raw.artistName ?? "").trim();
  const description = String(raw.description ?? "").trim();
  const imageUrl = String(raw.imageUrl ?? "").trim();
  const externalUrlRaw = String(raw.externalUrl ?? "").trim();
  const source = String(raw.source ?? "").trim();
  const free = Boolean(raw.free);
  const tagsRaw = Array.isArray(raw.tags) ? raw.tags : [];

  if (!title) throw new Error("Title is required.");
  if (title.length > MAX_TITLE) throw new Error("Title is too long.");
  if (!artistName) throw new Error("Artist name is required.");
  if (artistName.length > MAX_ARTIST) throw new Error("Artist name is too long.");
  if (!description) throw new Error("Description is required.");
  if (description.length > MAX_DESC) throw new Error("Description is too long.");
  if (!imageUrl) throw new Error("Image URL is required.");
  if (imageUrl.length > MAX_IMG) throw new Error("Image URL is too long.");
  validateImageUrl(imageUrl);
  if (!externalUrlRaw) throw new Error("External URL is required.");
  if (externalUrlRaw.length > MAX_URL) throw new Error("External URL is too long.");

  const normalized = normalizeResourceUrl(externalUrlRaw);
  if (!normalized) {
    throw new Error(
      "External URL must be on Ko-fi, Booth, VGen, Gumroad, Twitter/X, or itch.io."
    );
  }

  if (!ALLOWED_SOURCE_NAMES.has(source)) {
    throw new Error("Source must be one of the allowed platforms.");
  }

  const tags = tagsRaw
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0 && t.length <= MAX_TAG_LEN);
  if (tags.length === 0) throw new Error("At least one tag is required.");
  if (tags.length > MAX_TAGS) throw new Error("Too many tags.");

  return {
    title,
    artistName,
    description,
    imageUrl,
    tags,
    source,
    externalUrl: normalized.url,
    free,
  };
}

/**
 * Admin creates an asset directly (no suggestion). Optionally pass
 * `suggestionId` to link: on success, that suggestion is marked "imported".
 */
export async function createAssetAction(
  input: AssetInput,
  suggestionId?: string
): Promise<{ id: string }> {
  const user = await requireAdmin();
  const sanitized = sanitizeInput(input);
  const id = await createAsset(sanitized);

  if (suggestionId) {
    validateId(suggestionId, "suggestion ID");
    try {
      await updateSuggestionStatus(suggestionId, "imported", user.uid);
    } catch {
      // Suggestion linkage is best-effort; the asset was created successfully.
    }
    revalidatePath("/admin/suggestions");
  }

  revalidatePath("/admin/assets");
  revalidatePath("/resources");
  return { id };
}

export async function deleteAssetAction(assetId: string): Promise<void> {
  await requireAdmin();
  validateId(assetId, "asset ID");
  await deleteAsset(assetId);
  revalidatePath("/admin/assets");
  revalidatePath("/resources");
}

export async function rejectSuggestionAction(
  suggestionId: string
): Promise<void> {
  const user = await requireAdmin();
  validateId(suggestionId, "suggestion ID");
  await updateSuggestionStatus(suggestionId, "rejected", user.uid);
  revalidatePath("/admin/suggestions");
}

/** Reverses a reject/import — puts a suggestion back into "new". */
export async function reopenSuggestionAction(
  suggestionId: string
): Promise<void> {
  const user = await requireAdmin();
  validateId(suggestionId, "suggestion ID");
  await updateSuggestionStatus(suggestionId, "new", user.uid);
  revalidatePath("/admin/suggestions");
}

export async function getSuggestionForPrefill(
  suggestionId: string
): Promise<{
  title: string;
  artistName: string;
  description: string;
  imageUrl: string;
  externalUrl: string;
  source: string;
  tags: string[];
} | null> {
  await requireAdmin();
  validateId(suggestionId, "suggestion ID");
  const s = await getSuggestion(suggestionId);
  if (!s) return null;
  return {
    title: s.title,
    artistName: s.artistName,
    description: s.description,
    imageUrl: s.imageUrl,
    externalUrl: s.externalUrl,
    source: s.source,
    tags: s.tags ?? [],
  };
}
