# Custom Video Player Research

## Current State

Basic iframe embed — server-side API returns embed URL, placed in `<iframe>`. Video ID visible in DOM via DevTools.

---

## Recommendation

**Vimeo Player SDK with chromeless mode + custom overlay controls.**

Why: simplest path, keeps Vimeo DRM option open, minimal bundle size (~579 KB), no HLS URL management. Build custom React controls on top of an invisible Vimeo iframe.

---

## Player Comparison

| Player | npm pkg | Downloads/wk | Stars | React Native | Vimeo Support | Bundle | Status |
|--------|---------|-------------|-------|-------------|---------------|--------|--------|
| **Vimeo Player SDK** | `@vimeo/player` | — | — | No (wrapper needed) | Native (it IS Vimeo) | ~579 KB | Active, maintained by Vimeo |
| **Video.js v8** | `video.js` | ~1.5M | 38K | No (wrappers exist) | No (needs HLS URL) | ~18 MB | Stable, v10 beta in progress |
| **Video.js v10** | `video.js@next` | — | — | Yes (planned) | Native provider (planned) | 5 KB gzip min | Beta (March 2026), GA mid-2026 |
| **Plyr** | `plyr` | ~200K | 26K | `plyr-react` wrapper | Native iframe wrapper | ~5.3 MB | **Deprecated** — folded into Video.js v10 |
| **React Player** | `react-player` | ~1.64M | 10K | Yes | Native provider | ~41 KB | Maintained by Mux, thin wrapper |
| **Vidstack** | `vidstack` | ~50-80K | 3.4K | First-class React/Next.js | Native provider | ~2 MB | **Frozen** — creator building Video.js v10 |
| **Media Chrome** | `media-chrome` | ~30-50K | 1.3K | Web Components | Provider-agnostic | ~5 MB | Active, maintained by Mux |

---

## Approach Details

### Option A: Vimeo SDK + Chromeless Mode (Recommended)

**How it works:**
- Install `@vimeo/player`
- Create player with `controls: false` (chromeless) — hides all Vimeo UI
- Overlay custom React controls (play/pause, seek bar, volume, fullscreen)
- SDK provides methods: `player.play()`, `player.pause()`, `player.setCurrentTime()`, `player.setVolume()`
- SDK provides events: `timeupdate`, `ended`, `progress`, `error`

**Pros:**
- Simplest implementation
- No HLS URL management — Vimeo handles adaptive streaming/CDN
- Keeps future DRM path open (Premium plan)
- Smallest bundle addition (~579 KB)
- Domain-restricted embeds still work

**Cons:**
- Still an iframe under the hood — video ID visible in DOM
- Chromeless mode requires Vimeo Pro or higher
- Can't fully style the video element itself, only overlay on top

**Security:**
- Video ID visible in DOM (same as current)
- Actual HLS stream URLs hidden inside cross-origin iframe
- Domain restriction prevents embed reuse elsewhere
- Right-click disabled on overlay

---

### Option B: Extract HLS URL + Custom Player

**How it works:**
- Server-side: call Vimeo API (`GET /videos/{id}?fields=play`) to get HLS `.m3u8` URL
- URLs expire in ~24 hours (time-limited)
- Feed HLS URL to a player with hls.js (Video.js, Vidstack, or raw `<video>` + hls.js)
- Full native `<video>` element — complete styling control

**Pros:**
- No iframe in DOM at all
- No Vimeo video ID visible
- Full pixel-perfect UI control
- Expiring URLs add security layer

**Cons:**
- HLS URL visible on `<video>` element src and Network tab
- Loses Vimeo DRM (only works through their iframe)
- Requires Vimeo Standard/Pro/Business plan for API video file access
- Server-side complexity to fetch/cache HLS URLs
- Must handle URL expiry/refresh

**Plan requirement:** Vimeo Standard or higher (API video file links not available on free/basic).

---

### Option C: Video.js v10 (Future)

**Wait for GA (mid-2026).** Combines the best of Vidstack, Plyr, Media Chrome, and Video.js. Will have:
- Native Vimeo provider
- First-class React support
- 81% smaller bundles than v8 (5 KB gzip minimum)
- Plyr-quality default skin
- Vidstack-level component architecture

Currently in beta. Not recommended for production yet.

---

## What to Avoid

| Don't Use | Why |
|-----------|-----|
| Plyr | Being deprecated, folded into Video.js v10 |
| Vidstack (standalone) | Development frozen, creator now at Mux on Video.js v10 |
| react-player for custom UI | No UI layer — just a wrapper, you'd build everything from scratch |
| Extracting HLS URLs | Loses DRM path, adds complexity, URLs still visible in Network tab |

---

## Vimeo Privacy Settings (Free, Do Now)

Regardless of player choice, configure these in Vimeo:

1. **Privacy → "Where can this be embedded?"** → Only on sites I choose → add production domain
2. **Privacy → "Who can watch?"** → Hide from Vimeo (unlisted)
3. **Privacy → Downloads** → Disable

This is the single most impactful security measure and costs nothing.

---

## Decision Matrix

| Priority | Choose |
|----------|--------|
| Custom UI now, minimal effort | **Option A** — Vimeo SDK chromeless |
| Maximum URL hiding, OK with complexity | **Option B** — HLS extraction |
| Best of everything, can wait | **Option C** — Video.js v10 (mid-2026) |
| Just want security, keep current player | **Vimeo privacy settings only** |
