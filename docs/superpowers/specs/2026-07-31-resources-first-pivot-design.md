# Resources-First Pivot — Design

**Date:** 2026-07-31
**Status:** Approved by drewfoos (in-session), implemented on `feature/resources-first` (stacked on `fix/cache-firestore-assets`)

## Goal

The course platform has no published courses yet, so the Resource Hub becomes
the site's main product. All course/Pro UI is hidden — not deleted — so the
course launch later is a small, mechanical revert.

## Decisions

1. **Resource Hub renders at `/`** (user-selected over "redirect / to
   /resources" and "retheme the landing page"). The old marketing landing page
   is archived, unrouted, at `src/app/_archive/landing/page.tsx`.
2. **Hidden routes redirect to `/`** (user-selected over "leave live" and
   "coming soon page"). Temporary 307s in `next.config.ts` so browsers don't
   cache them: `/resources` → `/`, `/resources/favorites` → `/favorites`,
   `/courses(/:path*)` → `/`, `/pro` → `/`.
3. **Favorites moves to `/favorites`** now that there is no `/resources`
   segment.
4. **No Pro anywhere for signed-in users** (explicit requirement): navbar Pro
   button removed, mobile-nav entries removed, footer "Get Pro Access"
   removed, settings-page Subscription and Course Progress sections gated
   behind `COURSES_ENABLED = false` in `src/lib/feature-flags.ts` (their
   Stripe/Firestore queries are skipped too). The user dropdown never had Pro
   entries; its Favorites link now points to `/favorites`.
5. **Copy updates** on surfaces that sold courses: auth-layout side panel,
   about page (courses card → search/favorites card, single CTA), footer
   blurb, root metadata (now describes the free asset library), 404 buttons.
6. **Asset cache revalidate 300s → 3600s** — assets change rarely and admin
   mutations already invalidate via `updateTag("assets")`.

## Untouched

Auth, admin area, Stripe webhook, checkout, all course/lesson page code,
Firestore data and rules.

## Re-enabling courses later

1. Delete the five redirects in `next.config.ts`.
2. Flip `COURSES_ENABLED` to `true`.
3. Restore nav/footer links and un-archive the landing page (move
   `src/app/_archive/landing/page.tsx` back, move the hub back under
   `/resources` if desired).

## Known trade-off

`loading.tsx` moved from `/resources` to the root segment, so its grid
skeleton is now the fallback for any route without its own loading file.
Acceptable: most navigation lands on `/`, and a mismatched skeleton beats a
blank screen.
