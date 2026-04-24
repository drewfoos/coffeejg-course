const TIMEOUT_MS = 6000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; CoffeeJG-LinkCheck/1.0; +https://coffeejg.com)";

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
 * Same policy as isUrlReachable, but also verifies the Content-Type is an
 * image when HEAD succeeds. Falls back to `true` on network errors.
 */
export async function isImageUrlReachable(url: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(url, { method: "HEAD" });
    if (res.status === 404 || res.status === 410) return false;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !contentType.toLowerCase().startsWith("image/")) {
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
