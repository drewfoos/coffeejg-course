#!/usr/bin/env node
// Enrich scraped Discord data → asset records.
// Phase 1: pure transform (domain→source, thread→tags, artist from URL, preview image)
// Phase 2: fetch OG metadata for title/description/better imageUrl
//
// Usage:
//   node scripts/enrich-assets.mjs --phase1        # writes scripts/assets-phase1.json
//   node scripts/enrich-assets.mjs --phase2        # reads phase1, fetches OG, writes scripts/assets-enriched.json
//   node scripts/enrich-assets.mjs --phase2 --retry  # only retry entries that previously failed

import fs from "node:fs";
import path from "node:path";

const INPUT = "scripts/discord-scrape-combined.json";
const PHASE1_OUT = "scripts/assets-phase1.json";
const PHASE2_OUT = "scripts/assets-enriched.json";

// ----- Thread → tags -----
const THREAD_TAGS = {
  "1440409120854249543": ["Live2D/3D/PNGtuber Models", "Character Assets"], // MODELS
  "1440409294628589671": ["Clothing/Accessories", "Outfits"],                // OUTFITS
  "1440409316975972423": ["Character Assets", "Hands"],                      // HANDS
  "1440409384621707265": ["Overlays & Alerts"],                              // OVERLAYS
  "1440410434455863436": ["Schedules"],                                      // SCHEDULES
  "1440410459823018064": ["Backgrounds"],                                    // BACKGROUNDS
  "1440410520107614228": ["Background Music"],                               // BG MUSIC
  "1440410569260798072": [],                                                 // GENERAL (source-only)
  "1440415200527384637": ["Objects"],                                        // OBJECTS
  "1440415443989827738": ["Emotes/Stickers/Badges", "Emotes"],               // EMOTES
  "1440416052629471406": ["Panels"],                                         // PANELS
  "1440416125442592869": ["Emotes/Stickers/Badges", "Badges"],               // BADGES
  "1440417540634575030": ["Thumbnails"],                                     // THUMBNAILS
  "1441882273925566597": ["Guides"],                                         // GETTING STARTED
  "1441888243522998322": ["Live2D/3D/PNGtuber Models", "2D"],                // PNGTUBER
};

// ----- Domain → source -----
function sourceFromUrl(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "ko-fi.com" || host.endsWith(".ko-fi.com")) return "Ko-fi";
    if (host === "vgen.co") return "VGen";
    if (host === "booth.pm" || host.endsWith(".booth.pm") || host === "booth.pximg.net" || host === "asset.booth.pm") return "Booth";
    if (host === "gumroad.com" || host.endsWith(".gumroad.com")) return "Gumroad";
    if (host === "x.com" || host === "twitter.com" || host === "pbs.twimg.com" || host === "t.co") return "Twitter/X";
    if (host.endsWith(".itch.io") || host === "itch.io" || host === "img.itch.zone") return "itch.io";
    if (host === "picrew.me" || host === "cdn.picrew.me") return "Picrew";
    if (host === "vtubergraphics.com") return "VTuberGraphics";
    if (host === "youtube.com" || host === "youtu.be") return "YouTube";
    if (host === "vroid.com") return "VRoid";
    return "Other";
  } catch {
    return "Other";
  }
}

// ----- Which URL is the asset page vs. a preview image -----
const IMAGE_HOSTS = new Set([
  "storage.ko-fi.com",
  "pbs.twimg.com",
  "storage.googleapis.com",
  "booth.pximg.net",
  "asset.booth.pm",
  "img.itch.zone",
  "static.wixstatic.com",
  "cdn.picrew.me",
]);

function isImageHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return IMAGE_HOSTS.has(host);
  } catch { return false; }
}

function looksLikeImageUrl(url) {
  return /\.(png|jpe?g|webp|gif|avif)(\?|:|$)/i.test(url);
}

// Primary external URL: first non-image link. Preview image: first image-host link.
function pickUrls(msg) {
  const links = msg.links || [];
  let externalUrl = null;
  let previewImage = null;

  for (const url of links) {
    if (isImageHost(url) || looksLikeImageUrl(url)) {
      if (!previewImage) previewImage = url;
    } else {
      if (!externalUrl) externalUrl = url;
    }
  }
  // Fallback: if only image links, use first image as externalUrl too
  if (!externalUrl && links.length) externalUrl = links[0];
  // Also try msg.images as fallback preview
  if (!previewImage && msg.images?.length) {
    previewImage = msg.images.find(i => !i.includes("discord.com/assets/")) || null;
  }
  return { externalUrl, previewImage };
}

// ----- Extract artist handle from URL path -----
function artistFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);

    if (host === "ko-fi.com") {
      // ko-fi.com/s/XXXX = shop shortcut (no artist in URL)
      // ko-fi.com/{artist}/... = artist page
      if (parts[0] === "s") return null;
      return parts[0] || null;
    }
    if (host === "vgen.co") {
      // vgen.co/{artist}/product/...
      return parts[0] || null;
    }
    if (host === "x.com" || host === "twitter.com") {
      // x.com/{handle}/status/...
      return parts[0] ? "@" + parts[0] : null;
    }
    if (host.endsWith(".booth.pm")) {
      // {artist}.booth.pm
      return host.replace(".booth.pm", "");
    }
    if (host === "booth.pm") {
      // booth.pm/en/items/... or booth.pm/items/...
      return null;
    }
    if (host.endsWith(".itch.io")) {
      return host.replace(".itch.io", "");
    }
    if (host === "gumroad.com") {
      // gumroad.com/{artist}/l/...
      return parts[0] || null;
    }
    return null;
  } catch { return null; }
}

// ----- Stable asset ID -----
function makeAssetId(source, externalUrl, msgId) {
  try {
    const u = new URL(externalUrl);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const slug = u.pathname.split("/").filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 60);
    return `${host.replace(/\./g, "-")}-${slug}`.replace(/-+/g, "-").replace(/^-|-$/g, "") || `discord-${msgId}`;
  } catch {
    return `discord-${msgId}`;
  }
}

// ===== PHASE 1 =====
function phase1() {
  const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const assets = [];
  const skipped = [];

  for (const thread of raw.threads) {
    const tags = THREAD_TAGS[thread.threadId] || [];
    for (const msg of thread.messages) {
      const { externalUrl, previewImage } = pickUrls(msg);
      if (!externalUrl) {
        skipped.push({ threadId: thread.threadId, msgId: msg.msgId, reason: "no URL" });
        continue;
      }
      const source = sourceFromUrl(externalUrl);
      const artist = artistFromUrl(externalUrl);
      const id = makeAssetId(source, externalUrl, msg.msgId);
      assets.push({
        id,
        msgId: msg.msgId,
        threadId: thread.threadId,
        threadName: thread.name,
        // Asset fields
        title: null,                      // filled in phase 2
        artistName: artist,               // may be overridden by phase 2
        description: "",                  // filled in phase 2
        imageUrl: previewImage || null,   // may be overridden by phase 2
        tags,
        source,
        externalUrl,
        free: true,                       // channel is "f2u-vtuber-assets"
        // Metadata
        postedBy: msg.author,
        postedAt: msg.time,
        _ogFetched: false,
      });
    }
  }

  fs.writeFileSync(PHASE1_OUT, JSON.stringify({
    count: assets.length,
    skipped: skipped.length,
    skippedItems: skipped,
    assets,
  }, null, 2));

  // Summary
  const bySource = {}, byTag = {};
  for (const a of assets) {
    bySource[a.source] = (bySource[a.source] || 0) + 1;
    for (const t of a.tags) byTag[t] = (byTag[t] || 0) + 1;
  }
  console.log(`Phase 1: ${assets.length} assets (${skipped.length} skipped) → ${PHASE1_OUT}`);
  console.log("By source:", bySource);
  console.log("By tag:", byTag);
  console.log(`\nArtist coverage: ${assets.filter(a => a.artistName).length}/${assets.length} have artist from URL`);
}

// ===== PHASE 2: OG METADATA =====
// Simple regex-based OG tag extraction. Lightweight; no cheerio dep.
function extractOg(html, baseUrl) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].trim() : null;
  };
  const decode = (s) => s
    ? s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&nbsp;/g, " ")
    : s;

  // <meta property="og:title" content="...">  (also handle content-first order)
  const ogTitle = pick(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
                || pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const ogDesc  = pick(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
                || pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  const ogImage = pick(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
                || pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const twTitle = pick(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  const twDesc  = pick(/<meta[^>]+name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
  const twImage = pick(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);
  const pageTitle = pick(/<title[^>]*>([^<]+)<\/title>/i);
  const metaDesc  = pick(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);

  const absolutize = (u) => {
    if (!u) return null;
    try { return new URL(u, baseUrl).href; } catch { return u; }
  };

  return {
    title: decode(ogTitle || twTitle || pageTitle) || null,
    description: decode(ogDesc || twDesc || metaDesc) || null,
    image: absolutize(ogImage || twImage),
  };
}

async function fetchOg(url, timeoutMs = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ac.signal,
      headers: {
        // Many sites gate OG tags on a browser-ish UA
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return { error: `HTTP ${res.status}`, finalUrl: res.url };
    const html = await res.text();
    const og = extractOg(html, res.url);
    return { ...og, finalUrl: res.url };
  } catch (e) {
    return { error: e.name === "AbortError" ? "timeout" : String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

// Map an artist name guess from the OG data for Ko-fi (which embeds "by <handle>" sometimes)
function extractKofiArtist(og) {
  // Ko-fi shop shortcut pages (ko-fi.com/s/...) put creator in title like:
  //   "Item Name on Ko-fi" — no artist.
  // og:site_name is sometimes present — og:url might include /{artist}/...
  if (og.finalUrl) {
    try {
      const u = new URL(og.finalUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] && parts[0] !== "s" && parts[0] !== "post" && parts[0].length < 40) return parts[0];
    } catch {}
  }
  return null;
}

// Concurrency-limited runner
async function pMap(items, limit, fn, onProgress) {
  const results = new Array(items.length);
  let idx = 0, done = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
      done++;
      if (onProgress) onProgress(done, items.length);
    }
  });
  await Promise.all(workers);
  return results;
}

async function phase2(retryOnly = false) {
  const input = JSON.parse(fs.readFileSync(PHASE1_OUT, "utf8"));
  let assets = input.assets;

  // If output already exists, merge previous OG results so we don't re-fetch
  let prev = new Map();
  if (fs.existsSync(PHASE2_OUT)) {
    const p = JSON.parse(fs.readFileSync(PHASE2_OUT, "utf8"));
    for (const a of p.assets || []) prev.set(a.id, a);
  }

  const toFetch = [];
  const merged = assets.map(a => {
    const p = prev.get(a.id);
    if (p && p._ogFetched && !(retryOnly && p._ogError)) return { ...a, ...p, _ogFetched: true };
    toFetch.push(a);
    return { ...a, ...(p || {}) };
  });

  console.log(`Phase 2: fetching OG for ${toFetch.length}/${assets.length} assets (concurrency 6)`);
  const started = Date.now();

  const byId = new Map(merged.map(a => [a.id, a]));

  await pMap(toFetch, 6, async (a) => {
    const og = await fetchOg(a.externalUrl);
    const dst = byId.get(a.id);
    dst._ogFetched = true;
    if (og.error) {
      dst._ogError = og.error;
      return;
    }
    delete dst._ogError;
    dst._ogFinalUrl = og.finalUrl;

    // Only overwrite nulls/empties with OG data (preserve any manual curation)
    if (og.title && !dst.title) dst.title = og.title;
    if (og.description && !dst.description) dst.description = og.description;
    if (og.image && (!dst.imageUrl || dst.imageUrl.includes("discord.com/assets/"))) dst.imageUrl = og.image;

    // Artist inference from final URL (esp. ko-fi shortcuts)
    if (!dst.artistName) {
      const k = extractKofiArtist(og);
      if (k) dst.artistName = k;
    }
  }, (done, total) => {
    if (done % 20 === 0 || done === total) {
      const pct = ((done / total) * 100).toFixed(0);
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      process.stdout.write(`  ${done}/${total} (${pct}%) ${elapsed}s\r`);
    }
  });
  console.log("");

  const outAssets = merged;
  const ok = outAssets.filter(a => a._ogFetched && !a._ogError).length;
  const fail = outAssets.filter(a => a._ogError).length;
  const haveTitle = outAssets.filter(a => a.title).length;
  const haveImage = outAssets.filter(a => a.imageUrl).length;
  const haveArtist = outAssets.filter(a => a.artistName).length;

  fs.writeFileSync(PHASE2_OUT, JSON.stringify({
    count: outAssets.length,
    ok, failed: fail,
    haveTitle, haveImage, haveArtist,
    assets: outAssets,
  }, null, 2));

  console.log(`Phase 2 done → ${PHASE2_OUT}`);
  console.log(`  fetched OK: ${ok}  failed: ${fail}`);
  console.log(`  have title: ${haveTitle}/${outAssets.length}`);
  console.log(`  have image: ${haveImage}/${outAssets.length}`);
  console.log(`  have artist: ${haveArtist}/${outAssets.length}`);

  // Print failures by domain for triage
  const failsByHost = {};
  for (const a of outAssets) {
    if (!a._ogError) continue;
    try {
      const h = new URL(a.externalUrl).hostname.replace(/^www\./, "");
      failsByHost[h] = (failsByHost[h] || 0) + 1;
    } catch {}
  }
  if (fail) {
    console.log("  failures by host:", failsByHost);
  }
}

// ===== PHASE 3: Merge Discord embed data into phase1 assets =====
function phase3() {
  const input = JSON.parse(fs.readFileSync(PHASE1_OUT, "utf8"));
  const assets = input.assets;

  // Load all embed files
  const embedMap = new Map(); // msgId → embed data
  const embedFiles = fs.readdirSync("scripts").filter(f => f.startsWith("embeds-") && f.endsWith(".json"));
  for (const f of embedFiles) {
    const data = JSON.parse(fs.readFileSync(path.join("scripts", f), "utf8"));
    for (const e of data.embeds || []) {
      if (e.hasEmbed) embedMap.set(e.msgId, e);
    }
  }

  console.log(`Phase 3: merging ${embedMap.size} embeds into ${assets.length} assets`);

  // Also load phase2 OG data for non-Ko-fi sources
  let ogMap = new Map();
  if (fs.existsSync(PHASE2_OUT)) {
    const ogData = JSON.parse(fs.readFileSync(PHASE2_OUT, "utf8"));
    for (const a of ogData.assets || []) {
      if (a._ogFetched && !a._ogError) ogMap.set(a.msgId, a);
    }
    console.log(`  also using ${ogMap.size} successful OG fetches from phase 2`);
  }

  // Extract artist name from Ko-fi embed title pattern: "Product Name - Artist's Ko-fi Shop"
  // Discord truncates long titles, so we handle:
  //   "... - Artist's Ko-fi Shop"  (full)
  //   "... - Artist's Ko-fi ..."   (truncated)
  //   "... - Artist's Ko..."       (more truncated)
  //   "... - Artis..."             (severely truncated, still useful)
  function artistFromKofiTitle(title) {
    if (!title) return null;
    // Find the last " - " and extract artist from what follows
    const lastDash = title.lastIndexOf(" - ");
    if (lastDash === -1) return null;
    let after = title.slice(lastDash + 3).trim();
    // Remove possessive + Ko-fi suffix (full or truncated)
    after = after.replace(/(?:'s|'s)\s+Ko.*$/i, "").replace(/(?:'s|'s)\s*$/i, "").replace(/\.{2,}$/, "").trim();
    // If what's left looks like a name (not the whole title), use it
    return after.length >= 2 && after.length < 60 ? after : null;
  }

  // Clean up title: remove " - Artist's Ko-fi Shop" suffix (and truncated variants)
  function cleanTitle(title, source) {
    if (!title) return null;
    if (source === "Ko-fi") {
      const lastDash = title.lastIndexOf(" - ");
      if (lastDash > 0) {
        const after = title.slice(lastDash + 3);
        if (/Ko[-\s]?fi|'s\s+Ko|\.{2,}$/i.test(after)) {
          return title.slice(0, lastDash).trim() || title;
        }
      }
      return title.replace(/\s*-\s*[^-]+?(?:'s|'s)\s+Ko.*$/i, "").trim() || title;
    }
    if (source === "VGen") {
      return title.replace(/\s+by\s+.+$/i, "").trim() || title;
    }
    if (source === "Booth") {
      return title.replace(/\s*-\s*BOOTH$/i, "").trim() || title;
    }
    return title;
  }

  let enriched = 0, noEmbed = 0;
  for (const asset of assets) {
    const embed = embedMap.get(asset.msgId);
    const og = ogMap.get(asset.msgId);

    if (embed) {
      enriched++;
      // Title: prefer embed, clean up
      if (!asset.title && embed.title) {
        asset.title = cleanTitle(embed.title, asset.source);
      }
      // Description
      if (!asset.description && embed.description) {
        asset.description = embed.description;
      }
      // Image: prefer embed image (higher quality)
      if (embed.imageHref) {
        asset.imageUrl = embed.imageHref;
      }
      // Artist: try embed title pattern, then embed authorName
      if (!asset.artistName) {
        const kofiArtist = artistFromKofiTitle(embed.title);
        if (kofiArtist) {
          asset.artistName = kofiArtist;
        } else if (embed.authorName) {
          asset.artistName = embed.authorName;
        }
      }
    } else {
      noEmbed++;
    }

    // Layer on OG data for non-Ko-fi (VGen, Booth, itch.io, etc. — successful fetches)
    if (og) {
      if (!asset.title && og.title) asset.title = cleanTitle(og.title, asset.source);
      if (!asset.description && og.description) asset.description = og.description;
      if (!asset.artistName && og.artistName) asset.artistName = og.artistName;
    }

    // Twitter/X: use handle as artist, build a descriptive title from embed description
    if (asset.source === "Twitter/X" && !asset.title) {
      try {
        const handle = new URL(asset.externalUrl).pathname.split("/")[1];
        if (handle) {
          if (!asset.artistName) asset.artistName = "@" + handle;
          asset.title = `Free asset by @${handle}`;
        }
      } catch {}
    }

    // Final fallbacks
    if (!asset.title) asset.title = asset.externalUrl;
    if (!asset.artistName) asset.artistName = asset.postedBy || "Unknown";
    if (!asset.description) asset.description = "";
    if (!asset.imageUrl) asset.imageUrl = "";

    asset._ogFetched = true;
    delete asset._ogError;
  }

  const haveTitle = assets.filter(a => a.title && a.title !== a.externalUrl).length;
  const haveImage = assets.filter(a => a.imageUrl).length;
  const haveArtist = assets.filter(a => a.artistName && a.artistName !== "Unknown" && a.artistName !== a.postedBy).length;
  const haveDesc = assets.filter(a => a.description).length;

  fs.writeFileSync(PHASE2_OUT, JSON.stringify({
    count: assets.length,
    haveTitle, haveImage, haveArtist, haveDesc,
    assets,
  }, null, 2));

  console.log(`Phase 3 done → ${PHASE2_OUT}`);
  console.log(`  enriched from embeds: ${enriched}  no embed: ${noEmbed}`);
  console.log(`  have title: ${haveTitle}/${assets.length}`);
  console.log(`  have image: ${haveImage}/${assets.length}`);
  console.log(`  have artist: ${haveArtist}/${assets.length}`);
  console.log(`  have description: ${haveDesc}/${assets.length}`);
}

// ----- CLI -----
const args = process.argv.slice(2);
if (args.includes("--phase1")) {
  phase1();
} else if (args.includes("--phase2")) {
  phase2(args.includes("--retry")).catch(e => { console.error(e); process.exit(1); });
} else if (args.includes("--phase3")) {
  phase3();
} else {
  console.log("Usage: node scripts/enrich-assets.mjs --phase1 | --phase2 [--retry] | --phase3");
  process.exit(1);
}
