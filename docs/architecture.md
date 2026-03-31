# Architecture

## System Overview

The platform is a single Next.js application hosted on Vercel. It connects to four external services: Firebase Auth (identity), Firestore (data), Stripe (payments), and Vimeo (video hosting). There is no custom backend — Next.js Server Components, Server Actions, and Route Handlers handle all server-side logic.

```
Browser
  │
  ▼
Next.js on Vercel
  ├── Firebase Auth (identity + tokens)
  ├── Firestore (all application data)
  ├── Stripe (payment sessions + webhooks)
  └── Vimeo (embedded video player)
```

## Main Components

| Component | Role |
|---|---|
| **Next.js App Router** | File-system routing, Server Components for access-gated pages, Server Actions for mutations |
| **Firebase Auth** | Client SDK handles sign-up/login UI. Admin SDK verifies tokens server-side. |
| **Firestore** | All data: users, enrollments, purchases, courses, lessons, progress, assets, favorites |
| **Stripe Checkout** | Hosted payment page. Webhook delivers payment confirmation. |
| **Vimeo** | Domain-restricted video embeds. App controls who sees the player. |

## Authentication Flow

1. User signs in via Firebase Auth (email/password or Google).
2. Firebase issues an ID token (JWT).
3. Server Action calls `adminAuth.createSessionCookie(idToken)` to mint a server-controlled session cookie (`__session`, HttpOnly, 5-day expiry).
4. Server Components/Actions verify the session cookie via `adminAuth.verifySessionCookie(cookie, true)` (with revocation check) on every authenticated request.
5. On first sign-in, a Server Action verifies the ID token via `adminAuth.verifyIdToken()` and creates a `users/{uid}` Firestore doc if it doesn't exist.

Firebase UID is the canonical user identity across all collections.

## Purchase Flow

```
User clicks "Buy" → Server Action creates Stripe Checkout Session
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                                                      ▼
  User completes payment                              Stripe fires webhook
  on Stripe-hosted page                            POST /api/webhook/stripe
         │                                                      │
         ▼                                                      ▼
  Redirect to success page                      Firestore transaction:
  (read-only, checks enrollment)                create enrollment + purchase
```

The webhook is the only path that creates enrollments. The success page never writes data.

### Plan Types

- **Lifetime** — One-time Stripe payment. Enrollment has no subscription fields.
- **Monthly** — Stripe subscription. Enrollment stores `stripeSubscriptionId`, `cancelAtPeriodEnd`, and `currentPeriodEnd`.

### Checkout Guards

The Server Action enforces plan rules before creating a Stripe session:
- Not enrolled → allow any plan
- Active monthly → only allow lifetime upgrade
- Active lifetime → block all purchases

### Webhook Event Handling

| Event | Action |
|---|---|
| `checkout.session.completed` | Create enrollment + purchase. Cancel old subscription if upgrading. Block lifetime→monthly downgrade. |
| `customer.subscription.updated` | Sync `cancelAtPeriodEnd` and `currentPeriodEnd`. Revoke on `past_due`/`unpaid`. Reactivate on `active`. |
| `customer.subscription.deleted` | Revoke enrollment (transactional, checks subscription ID still matches). |
| `invoice.payment_failed` | Mark enrollment with `paymentFailed` flag. |

### Webhook Security

1. **Signature verification** — `constructEvent` validates Stripe HMAC before processing.
2. **Transactional dedup** — Event ID claimed atomically in Firestore. Concurrent duplicates rejected.
3. **Failed event recovery** — Claimed events deleted on error so Stripe retries succeed.
4. **Subscription ownership** — All handlers verify subscription ID matches enrollment before modifying.
5. **Downgrade prevention** — Lifetime→monthly blocked at webhook level; unwanted subscription auto-cancelled.

### Subscription Lifecycle

```
Active → Cancel (cancel_at_period_end=true) → Period ends → subscription.deleted → Revoke enrollment
Active → Cancel → Resume (cancel_at_period_end=false) → Active
Active Monthly → Upgrade to Lifetime → Old subscription cancelled → New lifetime enrollment
```

### stripeCustomerId Resolution

The `stripeCustomerId` is stored on the Firestore user doc by the webhook. If missing (race condition, old account), all read paths fall back to querying the `purchases` collection and backfill the user doc on first lookup.

## Lesson Access Flow

Server Component runs this check on every lesson page load:

1. Read lesson doc. If `isFree` → allow access.
2. If not free, verify user's session cookie.
3. Read `enrollments/{uid}::{courseId}`. If exists and `status === "active"` → allow access.
4. Otherwise → show locked state with purchase CTA.

Video embed URLs are resolved server-side via `/api/video` route, which re-verifies auth and enrollment before returning the embed URL. Vimeo video IDs never appear in RSC payloads or client-side code. Lesson article content (description, topics) is also gated — only sidebar metadata (title, order, duration, section) is sent to client components.

## Resource Hub Flow

1. Server Component queries `assets` collection with tag/source filters and cursor-based pagination.
2. If user is authenticated, batch-reads `favorites/{uid}::{assetId}` docs for visible assets (one round-trip).
3. Toggling a favorite creates or deletes the favorite doc via Server Action.

## Data Flow Principles

- **One source of truth per fact.** Enrollment doc = access. No denormalized arrays.
- **Composite IDs enforce uniqueness.** `{uid}::{courseId}` means one enrollment per user per course, structurally.
- **All mutations are idempotent.** Firestore transactions check before writing. Retries and duplicate webhooks are safe.
- **Server writes for all data.** All Firestore writes go through the Admin SDK (Server Actions / Route Handlers). Firestore security rules deny all client-side reads and writes.
- **Input validation at boundaries.** All user-supplied IDs are validated against `^[a-zA-Z0-9_-]{1,128}$` before use in Firestore queries.
- **Webhook deduplication.** Processed Stripe event IDs are claimed transactionally in `processedEvents` collection. Concurrent duplicates rejected; failed events unclaimed for retry.
- **Security headers.** HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Permissions-Policy, Referrer-Policy applied via `next.config.ts`. X-Powered-By disabled.
