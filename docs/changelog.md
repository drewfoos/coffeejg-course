# Changelog

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
