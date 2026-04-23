# Changelog

## v0.6.0 — Resource Suggestions & Admin Resource Management

### User-facing
- Signed-in users can suggest resources via a dialog on `/resources` (shadcn Dialog, opens from a button under the search bar next to Favorites)
- URL normalization strips tracking params and enforces an allowlist of sources (Ko-fi, Booth, VGen, Gumroad, Twitter/X, itch.io)
- Duplicate detection against existing `assets` and prior `suggestions`
- Idempotent writes: deterministic doc id from URL hash + atomic Firestore `create()` means double-clicks and retries are safe no-ops

### Abuse protection (layered, in order)
- Auth gate via session cookie
- In-memory burst limiter: 3 requests/min/uid
- Cloudflare Turnstile (server-side siteverify)
- Account age gate: accounts must be ≥ 24h old
- Length caps: URL ≤ 500, note ≤ 500
- URL allowlist (host-based)
- Firestore-backed daily cap: 5 suggestions/uid/24h (distributed, survives instance reuse)
- Duplicate checks vs. assets and prior suggestions

### Admin
- New `/admin/suggestions` page — tabs for New / Imported / Rejected / All; Import, Reject, and Reopen actions
- New `/admin/assets` page — list + delete; "New resource" CTA
- New `/admin/assets/new` — manual asset creation, prefills from a suggestion via `?suggestion=<id>` and marks it `imported` on save
- Nav updated with Resources + Suggestions links

### Infrastructure
- `firestore.indexes.json` with composite indexes for suggestions queries (`status+createdAt`, `userId+createdAt`)
- Shared taxonomy (`src/lib/resource-taxonomy.ts`) for tags + sources — filter bar and admin form share one source of truth
- `Suggestion` type added to `src/lib/types.ts`

## v0.5.9 — Resource Hub Filter Bug Fixes

### Bug Fixes
- Filter sheet "Clear all" button now actually clears filters and closes the sheet (previously only reset local pending state with no visible effect)
- Active filter pills on mobile no longer overflow the viewport — FilterBar row now wraps

## v0.5.8 — Cloudflare Turnstile Bot Protection

### Security
- Added Cloudflare Turnstile to login, signup, and forgot-password forms
- Server-side token verification via Cloudflare `siteverify` API before session creation
- Forgot-password moved from client-side Firebase call to server action with Turnstile verification
- Google OAuth skips Turnstile (Google has its own bot protection)
- Graceful degradation: skips verification in dev (no secret key) and fails open if Cloudflare is unreachable
- New env vars: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`

## v0.5.7 — Universal Access Model, Settings Redesign & Security Hardening

### Universal Access Model
- Single purchase (monthly or lifetime) now unlocks ALL courses, not per-course
- New `getActiveEnrollment(uid)` queries by userId + status + livemode (not scoped to courseId)
- Lesson access, video API, progress tracking, checkout, and success page all updated to universal model
- Webhook `checkout.session.completed` finds existing enrollment by query instead of composite ID
- Webhook `customer.subscription.updated` looks up enrollment by `stripeSubscriptionId` instead of composite ID

### Settings Page Redesign
- Account info section: name, email, sign-in provider (Google logo or email icon), member since date
- Course progress: overall progress bar + per-course circular SVG rings with percentage and lesson counts
- Upgrade CTA for monthly subscribers ("Switch to Lifetime Access")
- Sign out button in account section
- Danger zone with hardened delete account flow

### Account Deletion — Security Hardened
- Fresh Firebase ID token re-authentication required (not just session cookie)
- ID token UID cross-checked against session UID (prevents cross-account attacks)
- Server-side confirmation phrase verification ("delete my account")
- Rate limited: 2 attempts per 10 minutes per user
- Cancels all Stripe subscriptions (via enrollment records AND stripeCustomerId fallback)
- Deletes all Firestore data in chunked batches (499 ops per batch, stays under 500 limit)
- Revokes all Firebase sessions, deletes Firebase Auth account, clears session cookie
- Large confirmation dialog: warning icon, red theme, lists everything that will be deleted
- Delete button disabled until user types exact confirmation phrase

### Legal Pages
- Terms of Service page (11 sections: acceptance, subscriptions, refunds, IP, acceptable use, etc.)
- Privacy Policy page (10 sections: data collected, third-party services, cookies, retention, rights, etc.)
- Footer updated with Terms and Privacy links
- Signup page links to Terms of Service and Privacy Policy
- Pro page links to Terms of Service at checkout

### Billing Security Hardening
- Rate limiting added to billing portal, cancel, and resume subscription actions (5/min)
- Customer ID fallback query now filters by current Stripe livemode
- `stripeCustomerId` backfill respects livemode
- Checkout success page validates Stripe session_id format before API call
- Livemode field added to purchase docs for correct customer ID resolution

### Admin
- Admin user enrollment list now includes `livemode` field (Test/Live badges render correctly)

## v0.5.6 — Custom Branded Video Player (Plyr)

### Video Player
- Replaced raw iframe embed with Plyr-based custom video player
- CoffeeJG purple branding on all controls via `--plyr-color-main` CSS variable
- Custom controls: play/pause, progress bar, current time/duration, volume, fullscreen
- Hides all native Vimeo/YouTube chrome (title, byline, recommendations)
- Right-click disabled on player container
- Vimeo: cookies disabled, title/byline/portrait hidden, DNT enabled
- YouTube: no-cookie domain, modest branding, no related videos
- Keyboard shortcuts via Plyr (space/k for play/pause, arrows for seek, m for mute, f for fullscreen)
- Clean unmount on navigation — no "provider destroyed" errors

### Dependencies
- Added `plyr` for custom video player controls
- Removed `@vimeo/player` (Plyr handles Vimeo embedding natively)
- Removed custom player module (`src/components/course/player/` — 8 files)

## v0.5.5 — Stripe Livemode Enforcement, Mobile Nav & UI Polish

### Security
- Stripe test-mode enrollments no longer grant access when running with live keys
- `livemode` field stored on enrollments at webhook creation time
- `getEnrollment()` rejects purchase-based enrollments that don't match current Stripe mode
- Legacy enrollments (missing `livemode`) treated as test mode — safe default
- Gift/promo enrollments exempt from livemode check
- Test enrollments cannot overwrite live enrollments in Firestore
- Webhook downgrade prevention now scoped to same Stripe mode
- Settings page and billing actions filter enrollments by current Stripe mode
- Video player iframe sandboxed (`allow-scripts allow-same-origin allow-popups allow-presentation`)

### UI
- Added mobile hamburger menu (Sheet drawer) with navigation links
- Footer compact layout: 3-column link grid on mobile instead of stacked
- Social icons row below links on mobile, inline with brand on desktop
- Normalized navbar icon sizes (theme toggle, avatar, hamburger all `h-8 w-8` targets, `h-5 w-5` icons)
- Fixed avatar dropdown click behavior (`pointer-events-none` on Avatar, explicit trigger sizing)
- Consistent `gap-2`/`gap-3` spacing across navbar items

## v0.5.4 — About Page, Footer & Lesson Page Polish

### UI
- Redesigned about page socials section with actual SVG brand logos (Twitch, YouTube, TikTok, X, Discord, Linktree)
- Brand-colored hover states on social links (Twitch purple, YouTube red, Discord blurple, Linktree green)
- Unified about page section widths and grid layout
- Removed copyright bar from footer, reduced footer height and spacing

### Performance
- Video player iframe uses `loading="lazy"` for deferred loading
- Progress query uses Firestore `.select()` to fetch only needed fields

## v0.5.3 — Favorites Page Redesign

### UI
- Redesigned favorites page with hero section matching Resource Hub style
- Warm red/pink gradient, glow orbs, and layered wave transition
- Floating heart decorations with staggered CSS pulse animations
- Improved empty state with heart icon badge and "Explore Resources" CTA
- Fredoka + Quicksand typography consistent with Resource Hub

## v0.5.2 — Performance, Self-Hosted Assets & Resource Hub UX

### Performance
- Home page marquee images self-hosted as optimized WebP (40 images, 1.3MB total)
- Eliminated external CDN dependency for home page (Ko-fi, Booth, VGen URLs replaced with local files)
- Home page no longer calls Firestore for resource images (hardcoded static array)
- Video API response caching (`Cache-Control: private, max-age=3600`)
- Settings page queries parallelized with `Promise.all`
- Admin user listing uses batch `getAll()` instead of N+1 individual reads
- Admin user search parallelized with `Promise.all`
- Resource hub: Firestore count and paginated query now run in parallel

### Resource Hub UX
- Trimmed category tags from 18 to 10 (removed Streaming, Twitch, Debut Assets, Backgrounds, Panels & Banners, Holiday, Props, Transition Screens)
- Category filter changed to compact dropdown select above results grid
- Source filters remain as pills in the hero section (only 4 sources)
- Cleaner mobile experience — no more cluttered tag pills

### Bug Fixes
- Settings page now correctly shows "Monthly Subscription" when Stripe keys aren't configured (was incorrectly falling through to "Lifetime Access")

### Infrastructure
- Added `scripts/download-resource-images.mjs` utility for downloading and converting resource images to WebP

## v0.5.1 — Dark Mode Default

### UI
- Default theme switched to dark mode (SSR renders with `dark` class, no flash of light)
- First-time visitors see dark mode; user preference persisted in localStorage
- Light mode still accessible via theme toggle

## v0.5.0 — Subscription Management, Admin Users & Payment Hardening

### Subscription System
- Dual pricing: monthly subscription + lifetime one-time purchase via Stripe
- Dynamic price display on Pro page fetched from Stripe API (5-min in-memory cache)
- Cancel subscription at period end (access continues until billing period expires)
- Resume cancelled subscription before period ends
- Upgrade path: monthly → lifetime (cancels old subscription, creates new enrollment)
- Stripe billing portal access from settings page
- Live subscription details (amount, interval, next billing date) from Stripe API

### Admin Users
- Admin users list page with Firebase Auth as source of truth (enriched with Firestore data)
- User detail page with enrollment management
- Search users by email, name, or UID (exact lookup + fuzzy fallback)
- Pagination via Firebase Auth page tokens
- Cancel subscription (end-of-period or immediate)
- Revoke enrollment (with automatic Stripe subscription cancellation)
- Delete user account (cancels subscriptions, deletes all Firestore data + Firebase Auth)

### Payment Hardening
- Webhook event dedup upgraded to transactional claim (prevents concurrent duplicate processing)
- Failed webhook events unclaimed for Stripe retry
- `stripeCustomerId` always saved to user doc (even on idempotent replay)
- Purchase record fallback + backfill for missing `stripeCustomerId`
- Downgrade prevention: lifetime → monthly blocked at webhook level (unwanted subscription auto-cancelled)
- Checkout guards: only monthly → lifetime upgrade allowed, all other re-purchases blocked
- `planType` validated at webhook level (no unsafe cast from metadata)
- Signup race fix: `createUserDocIfNotExists` uses `set({ merge: true })` to avoid clobbering webhook data
- Subscription ownership checks on all webhook event handlers
- `revokeEnrollmentBySubscription` wrapped in Firestore transaction (prevents TOCTOU race)
- Delete user action cancels subscriptions via both customer ID and enrollment subscription IDs

### Security
- Security headers: HSTS, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Removed X-Powered-By header (no framework version leak)

### UI
- Pro page shows upgrade-only option for monthly subscribers
- Settings page shows live subscription status with cancel/resume controls
- Admin user detail shows Stripe customer ID, enrollment details, danger zone

## v0.4.0 — Resource Hub Expansion & Landing Page Redesign

### Resources
- Scraped and curated 176 free VTuber assets across Ko-fi, Booth, VGen, and Gumroad
- Patched 48 missing image URLs with direct product page images
- Added Gumroad to source filters
- Offset-based pagination with Firestore count()
- Improved card spacing, image placeholders, search

### Landing Page
- VRM 3D model viewer with animated hero
- About page, courses listing, error page
- CTA section, testimonials
- Custom UI components (3D marquee, pulse beams, wave path)

### Infrastructure
- Asset merge/patch utility scripts for asset pipeline
- Reorganized public assets into /images and /models directories

## v0.3.0 — Security Hardening, Theming & UX Polish

### Security
- Replaced raw ID token cookie with Firebase `createSessionCookie()` (server-controlled 5-day expiry, revocation check)
- Video embed URLs resolved server-side via `/api/video` route — Vimeo IDs never leak to client
- Lesson sidebar receives stripped `SidebarLesson` type (excludes vimeoVideoId, description, topics)
- Lesson article content gated behind access check (locked state shows upgrade CTA)
- Server-side price resolution in checkout — removed client-supplied `priceId` parameter
- `createUserDocIfNotExists` now verifies ID token server-side instead of trusting client UID
- Input validation (`validateId`) on all Server Actions and API routes
- Stripe webhook event deduplication via `processedEvents` collection
- Webhook error messages genericized (no config leak)
- Checkout success page validates `client_reference_id` matches current user
- Favorites query capped at 100 results
- CORS headers on `/api/video` restricted to app origin
- Firestore security rules deny all client-side access
- Removed 50-minute token refresh interval (unnecessary with session cookies)

### Theming & Design
- Purple-dominant color palette matching CoffeeJG character (oklch color space, hue 280/285)
- VTuber-style typography: Fredoka (headings) + Quicksand (body accents) via next/font
- Replaced placeholder navbar logo with actual SVG logo
- Floating emoji particles on Resource Hub hero (canvas-based, mouse-interactive)
- Color consistency across all pages: replaced hardcoded greens/blacks with theme tokens

### Performance
- `getAssetsByIds` batches Firestore reads in chunks of 500
- Hero particles canvas pauses via IntersectionObserver when off-screen
- Cursor pagination validates input before `Timestamp.fromMillis`

## v0.2.0 — MVP Complete

### Auth + Payments (Milestone 1)
- Firebase Auth with email/password and Google sign-in
- Login, signup, and forgot-password pages
- HttpOnly session cookie (`__session`) bridging client auth to server verification
- `getCurrentUser()` for server-side auth checks
- `proxy.ts` protecting authenticated routes and redirecting authed users from auth pages
- Stripe Checkout integration with Server Action
- Webhook handler with Stripe signature verification and idempotent enrollment creation
- Checkout success page with session status display

### Resource Hub (Milestone 2)
- Asset listing page with grid layout and cursor-based pagination
- Tag and source filtering via URL search params
- Asset detail modal with full metadata
- Heart/favorite button with optimistic UI and auth gating
- My Favorites page (authenticated only)
- Server Actions for favorite toggling with path revalidation

### First Course (Milestone 3)
- Course landing page with lesson list, pricing, and progress indicators
- Lesson page with access control (free lessons open, paid lessons require enrollment)
- Video player supporting YouTube (dev) and Vimeo (prod) embeds
- Lesson sidebar with completion checkmarks and lock icons
- Mark complete button with optimistic toggle
- Buy course button triggering Stripe Checkout
- Progress tracking via Firestore

### App Shell
- Responsive navbar with navigation links and user menu
- User avatar dropdown with My Favorites link and sign out
- Footer with copyright
- Hero landing page with featured course card and CTA buttons
- Custom 404 page

### Seed Scripts
- `npm run seed:course` — seeds sample course with 10 lessons
- `npm run seed:assets` — seeds 18 sample VTubing assets
- `npm run seed` — runs both

### Infrastructure
- Firebase Admin SDK with graceful build-time fallback
- Firebase client SDK singleton
- Stripe server instance
- TypeScript interfaces for all Firestore documents
- Composite ID helpers (`makeEnrollmentId`, `makeProgressId`, `makeFavoriteId`)
- shadcn/ui components (button, card, dialog, badge, input, label, separator, skeleton, tabs, avatar, dropdown-menu, sheet, toast)

## v0.1.0 — Project Foundation

- Created `project_spec.md` with full product requirements and engineering design
- Created `research_report_stripe_course_access.md` with Stripe payment architecture
- Decided tech stack: Next.js, Firebase Auth, Firestore, Stripe, Vimeo, Tailwind CSS
- Designed Firestore data model (8 collections, `::` composite IDs, lessons as subcollections)
- Defined idempotent purchase fulfillment flow (webhook-only enrollment creation)
- Defined access control pattern (enrollment doc = course access)
- Resolved MVP decisions: both auth providers from day one, filter-based search, seed scripts for content, manual refunds
- Scaffolded Next.js 16 project with TypeScript and Tailwind CSS v4
- Created placeholder landing page
- Created `.env.example` with all required environment variables
- Created `CLAUDE.md` with implementation rules and constraints
- Created `docs/architecture.md` and `docs/changelog.md`
