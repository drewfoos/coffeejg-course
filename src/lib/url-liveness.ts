const TIMEOUT_MS = 6000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; CoffeeJG-LinkCheck/1.0; +https://coffeejg.com)";

/**
 * Max size for a user-submitted preview image. Bounded because asset cards
 * serve originals directly (unoptimized) — one bloated image would be
 * downloaded by every visitor viewing the grid.
 */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export type ImageCheckReason = "gone" | "not-image" | "too-large";
export interface ImageCheckResult {
  ok: boolean;
  reason?: ImageCheckReason;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT, ...init.headers },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Light liveness check. Rejects only on definitive "gone" responses
 * (404, 410) so we don't false-reject sites that block HEAD or rate-limit.
 * Network errors / timeouts → give benefit of the doubt.
 */
export async function isUrlReachable(url: string): Promise<boolean> {
  try {
    let res = await fetchWithTimeout(url, { method: "HEAD" });
    // Some hosts don't allow HEAD — retry with a ranged GET.
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
      });
    }
    return res.status !== 404 && res.status !== 410;
  } catch {
    return true;
  }
}

/**
 * Same policy as isUrlReachable, but also verifies Content-Type is an image
 * and Content-Length is under MAX_IMAGE_BYTES. Returns a reason on failure
 * so the caller can give the user a useful error message.
 *
 * If HEAD doesn't expose Content-Length we fall back to a ranged GET so
 * misconfigured CDNs don't slip a giant file past the gate.
 */
export async function isImageUrlReachable(
  url: string
): Promise<ImageCheckResult> {
  try {
    let res = await fetchWithTimeout(url, { method: "HEAD" });

    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetchWithTimeout(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
      });
    }

    if (res.status === 404 || res.status === 410) {
      return { ok: false, reason: "gone" };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return { ok: false, reason: "not-image" };
    }

    // Content-Length from a ranged GET reports the slice, not the whole file.
    // Prefer Content-Range's total when present.
    const contentRange = res.headers.get("content-range");
    const totalFromRange = contentRange?.match(/\/(\d+)$/)?.[1];
    const lengthHeader = totalFromRange ?? res.headers.get("content-length");
    if (lengthHeader) {
      const bytes = Number.parseInt(lengthHeader, 10);
      if (Number.isFinite(bytes) && bytes > MAX_IMAGE_BYTES) {
        return { ok: false, reason: "too-large" };
      }
    }

    return { ok: true };
  } catch {
    return { ok: true };
  }
}
