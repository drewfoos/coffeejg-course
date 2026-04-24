const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "ref_src",
  "ref_url",
  "fbclid",
  "gclid",
  "mc_cid",
  "mc_eid",
  "si",
  "s",
  "t",
]);

export const ALLOWED_SOURCES = [
  { host: "ko-fi.com", name: "Ko-fi" },
  { host: "booth.pm", name: "Booth" },
  { host: "vgen.co", name: "VGen" },
  { host: "gumroad.com", name: "Gumroad" },
  { host: "twitter.com", name: "Twitter/X" },
  { host: "x.com", name: "Twitter/X" },
  { host: "itch.io", name: "itch.io" },
] as const;

/**
 * Hosts we trust for user-submitted preview images. Covers:
 *  - CDNs for the resource platforms themselves
 *  - Social platforms where creators promote their work
 *  - Popular general-purpose image hosts used in the VTuber space
 * Matched the same way as ALLOWED_SOURCES (exact or subdomain).
 */
export const ALLOWED_IMAGE_HOSTS = [
  // Resource platform CDNs
  "ko-fi.com",
  "storage.ko-fi.com",
  "booth.pm",
  "booth.pximg.net",
  "pximg.net",
  "gumroad.com",
  "public-files.gumroad.com",
  "vgen.co",
  "itch.io",
  "img.itch.zone",
  // Social
  "twimg.com",
  // General-purpose image hosts
  "imgur.com",
  "discordapp.com",
  "discordapp.net",
  "githubusercontent.com",
] as const;

export const ALLOWED_IMAGE_HOSTS_LABEL =
  "Ko-fi, Booth, Gumroad, VGen, itch.io, Twitter, Imgur, Discord, or GitHub";

export function isAllowedImageHost(urlInput: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(urlInput.trim());
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") {
    return false;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  return ALLOWED_IMAGE_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

export interface NormalizedUrl {
  url: string;
  source: string;
}

/**
 * Normalize + validate a resource URL against the allowlist of known VTuber
 * asset sources. Returns null if the URL is malformed or not from an allowed
 * host. Strips tracking params, trailing slashes, and lowercases the host.
 */
export function normalizeResourceUrl(input: string): NormalizedUrl | null {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") {
    return null;
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");

  const match = ALLOWED_SOURCES.find(
    (s) => host === s.host || host.endsWith(`.${s.host}`)
  );
  if (!match) return null;

  // Strip tracking params
  const params = new URLSearchParams(parsed.search);
  for (const key of Array.from(params.keys())) {
    if (TRACKING_PARAMS.has(key.toLowerCase())) {
      params.delete(key);
    }
  }

  // Reject URLs with no meaningful path for most sources (e.g. bare "https://ko-fi.com/")
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  if (pathname === "/" || pathname === "") {
    return null;
  }

  const search = params.toString();
  const normalized = `https://${host}${pathname}${search ? `?${search}` : ""}`;

  return { url: normalized, source: match.name };
}
