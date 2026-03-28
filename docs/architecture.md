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
3. Token is stored in a session cookie.
4. Server Components/Actions verify the token via Firebase Admin SDK on every authenticated request.
5. On first sign-in, a `users/{uid}` Firestore doc is created if it doesn't exist.

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

## Lesson Access Flow

Server Component runs this check on every lesson page load:

1. Read lesson doc. If `isFree` → render video.
2. If not free, verify user's Firebase token.
3. Read `enrollments/{uid}::{courseId}`. If exists and `status === "active"` → render Vimeo embed.
4. Otherwise → redirect to course purchase page.

Vimeo video IDs are never sent to the client unless access is confirmed server-side.

## Resource Hub Flow

1. Server Component queries `assets` collection with tag/source filters and cursor-based pagination.
2. If user is authenticated, batch-reads `favorites/{uid}::{assetId}` docs for visible assets (one round-trip).
3. Toggling a favorite creates or deletes the favorite doc via Server Action.

## Data Flow Principles

- **One source of truth per fact.** Enrollment doc = access. No denormalized arrays.
- **Composite IDs enforce uniqueness.** `{uid}::{courseId}` means one enrollment per user per course, structurally.
- **All mutations are idempotent.** Firestore transactions check before writing. Retries and duplicate webhooks are safe.
- **Server writes for sensitive data.** Enrollments, purchases, and user docs are written only by server code (Admin SDK). Firestore rules block client writes to these collections.
- **Client writes for user-scoped data.** Progress and favorites are written by the client, scoped to the user's own documents via security rules.
