# Project Spec: VTubing Education Platform

---

## 1. Project Overview

A VTubing education platform with two connected products:

1. **Course Platform** — Paid video courses focused on 3D VTubing and Warudo, with support for free preview lessons.
2. **Resource Hub** — A free, searchable library of VTubing assets and resources (models, textures, tools, references).

Both products share a single account system. A user signs up once and can access courses and the resource hub with the same login.

The platform is intended to ship to real users. It must support sign-up, login, payments, gated content, and reliable backend behavior from day one.

---

## 2. Goals

- Let users discover, purchase, and complete structured VTubing courses with video lessons.
- Provide a free, searchable hub of VTubing assets that users can browse, filter, and favorite.
- Share a single account across both products so users don't need separate logins.
- Handle payments and access granting reliably — no duplicate charges, no missing enrollments, no inconsistent state.
- Ship a product that feels like a real learning platform (similar in UX quality to NeetCode), not a prototype.

---

## 3. Target Users

- **Aspiring VTubers** who want structured guidance on 3D VTubing, especially using Warudo.
- **Existing VTubers** looking for assets, resources, and references to improve their setup.
- **Hobbyists** interested in VTubing who want a curated starting point rather than scattered YouTube tutorials.

---

## 4. Problems Solved

- VTubing education is scattered across YouTube, Discord, and forums with no structured learning path.
- Finding quality VTubing assets requires searching multiple sites with no central index.
- There is no single platform that combines structured courses with a resource library for the VTubing community.

---

## 5. Product Scope

### Course Platform

- User sign-up and login (shared with resource hub).
- Paid course access after Stripe purchase.
- Course landing pages with lesson list and structure.
- Lesson pages with embedded video player (Vimeo).
- Support for free and paid lessons within a course.
- Lesson sidebar navigation within a course.
- Mark lesson as complete.
- Track lesson progress per user.
- Optional: lesson ratings (post-MVP).
- Optional: comments/questions on lessons (post-MVP).

### Resource Hub

- Same sign-in/account as the course platform.
- Searchable asset library with pagination.
- Filterable asset cards.
- Asset card displaying: image, title, artist name, short description, tags, source/origin label, heart/favorite button.
- Click to open a detail modal with: larger image, full title, artist name, full description, tags, source, heart button, external link to the original asset page.
- Heart/favorite system (saved per user).
- External links to original asset sources.

---

## 6. MVP Scope

### Course side (Milestone 1 + 3)

- Firebase Auth (email/password + Google sign-in from day one).
- Stripe Checkout for one-time course purchases.
- Webhook-driven enrollment fulfillment (idempotent).
- 1 course with multiple lessons.
- Lesson sidebar with course structure.
- Lesson page with Vimeo video embed.
- Free vs. paid lesson gating.
- Manual "Mark as Complete" button per lesson + progress tracking.

### Resource hub side (Milestone 2)

- Shared login with course platform.
- Asset list with tag/source filtering and pagination.
- Card layout with image, title, artist, description, tags, source label.
- Heart/favorite per user.
- Detail modal with full info + external link.
- "My Favorites" page to view saved assets.

### Not in MVP

- Full-text search (MVP uses tag/source filters only — see Section 9 for rationale).
- Multiple courses.
- Lesson ratings or comments.
- Admin dashboard for managing courses/assets (seed scripts are sufficient).
- Subscription billing (courses are one-time purchases).
- Self-hosted video (Vimeo handles hosting).
- Object storage for asset images (external URLs are sufficient).
- Video position tracking or auto-completion (progress is manual button only).

---

## 7. Milestones

### Milestone 1: Foundation

- Shared auth system (Firebase Auth).
- Stripe payment integration.
- Protected paid course access.
- Idempotent purchase and enrollment handling.
- Webhook endpoint with signature verification.
- Success page (read-only confirmation).

### Milestone 2: Resource Hub

- Asset seed script: reads from a JSON file, writes to Firestore (idempotent, uses fixed asset IDs).
- Asset list with tag/source filtering and cursor-based pagination.
- Filterable asset cards.
- Heart/favorite system.
- "My Favorites" page.
- Detail modal with external links.
- Shared account support (same Firebase Auth).

### Milestone 3: First Course

- Course/lesson seed script: reads from a JSON file, writes to Firestore.
- Course landing page with lesson list.
- Lesson pages with Vimeo video player.
- Lesson sidebar navigation.
- Free and paid lesson gating.
- Manual "Mark as Complete" button + progress tracking.
- Placeholder YouTube embeds during development (switch to Vimeo for production).

---

## 8. Course Platform Requirements

### Course landing page

- Course title, description, thumbnail.
- List of lessons (titles visible, paid lessons marked as locked for non-enrolled users).
- Price and "Buy Course" button (or "Go to Course" if already enrolled).
- Free preview lessons accessible without purchase.

### Lesson page

- Embedded Vimeo video player.
- Lesson title.
- Lesson sidebar showing all lessons in the course, with current lesson highlighted.
- "Mark as Complete" button.
- Visual indicator of completed lessons in the sidebar.
- Navigation to next/previous lesson.

### Access control

- Free lessons: accessible to anyone (authenticated or not).
- Paid lessons: require authentication + active enrollment.
- Access is checked server-side in the Server Component. The Vimeo embed is only rendered if access is confirmed.

### Progress tracking

- Per-user, per-lesson completion status.
- Stored in Firestore with composite document IDs for idempotent writes.
- "Mark Complete" is a manual button click — no automatic detection based on video watch time.
- "Mark Complete" is a toggle — can be undone.
- The course landing page and lesson sidebar show completion indicators (e.g., checkmark icon, "X of Y complete" summary).
- Progress data is loaded server-side when rendering the lesson page. No real-time sync across tabs for MVP.

---

## 9. Resource Hub Requirements

### Asset card

| Field | Display |
|---|---|
| Preview image | Thumbnail from external URL |
| Title | Asset name |
| Artist name | Creator/author |
| Short description | 1-2 line summary on the card |
| Tags | Category/type labels |
| Source/origin label | Where the asset comes from (e.g., Booth, Gumroad, free) |
| Heart button | Toggle favorite (requires login) |

### Detail modal (click to expand)

| Field | Display |
|---|---|
| Larger image | Full-size preview |
| Full title | Complete asset name |
| Artist name | Creator/author |
| Full description | Complete description |
| Tags | All tags |
| Source | Origin label |
| Heart button | Toggle favorite |
| External link | Button/link to the original asset page |

### Search, filter, and pagination

**MVP search is filter-based, not full-text.** Firestore does not support full-text search natively. Adding a search service (Algolia, Typesense) for MVP adds cost and complexity disproportionate to the asset count. Instead:

- **Filter by tags**: Firestore `array-contains` query on the `tags` field. User selects one or more tags from a predefined list.
- **Filter by source**: Firestore `where source == X` query. User selects from a dropdown (e.g., "Booth", "Gumroad", "Free").
- **Combined filters**: Tag filter + source filter can be combined in a single Firestore query (requires a composite index).
- **No free-text search for MVP.** If the asset library grows large enough to need it, add Algolia or Typesense as a future enhancement.
- **Pagination**: Cursor-based using Firestore `startAfter()` with the last document from the previous page. Firestore does not support offset-based pagination. Page size: 20 assets per page.
- Results update when filters change. Changing a filter resets to page 1.

### Favorites

- Heart/favorite toggle per asset, per user.
- Requires authentication. Unauthenticated users see the heart button but are prompted to log in on click.
- Stored in Firestore with composite document IDs (`{uid}::{assetId}`) for idempotent writes.
- **"My Favorites" page** to view saved assets (query `favorites` collection where `userId == uid`, then batch-read the corresponding asset docs).
- **Loading heart state on asset list pages**: When an authenticated user loads a page of assets, batch-read the corresponding `favorites/{uid}::{assetId}` docs for all visible asset IDs (one `getAll()` call for up to 20 docs). This is efficient — it's a single round-trip for the page size.

---

## 10. Core User Flows

### Sign up and log in

**Email/password sign-up:**
1. User clicks "Sign Up."
2. Enters email and password. Firebase Auth creates the account.
3. On first sign-in, the app creates (or confirms) a `users/{uid}` document in Firestore with display name and email.
4. Session is established. User can access both course platform and resource hub.

**Email/password log-in:**
1. User clicks "Log In."
2. Enters email and password. Firebase Auth verifies credentials.
3. Session is established.

**Google sign-in:**
1. User clicks "Sign in with Google."
2. Firebase Auth handles the OAuth flow (popup or redirect).
3. On first sign-in, the app creates a `users/{uid}` document in Firestore using the Google profile (display name, email). On subsequent sign-ins, no Firestore write needed — the user doc already exists.
4. Session is established.

**Password reset (email/password users only):**
1. User clicks "Forgot password?" on the login page.
2. Enters their email. The app calls Firebase Auth's `sendPasswordResetEmail()`.
3. Firebase sends a password reset email with a link.
4. User clicks the link, sets a new password, and can log in.

**Provider-agnostic user identity:** Regardless of sign-in method, the Firebase UID is the canonical user identifier. All Firestore documents (enrollments, progress, favorites, purchases) are keyed to this UID. A user who signs up with email/password and later signs in with Google using the same email address will be linked to the same Firebase UID if account linking is enabled in the Firebase console.

### Purchase a course

1. User browses to a course landing page.
2. Sees lesson list, price, and "Buy Course" button.
3. Clicks "Buy Course."
4. Server Action verifies Firebase Auth token, creates a Stripe Checkout Session with `metadata: { firebaseUid, courseId }`.
5. User is redirected to Stripe Checkout.
6. User completes payment.
7. Stripe fires `checkout.session.completed` webhook.
8. Webhook handler runs a Firestore transaction: creates `enrollments/{uid}::{courseId}` and `purchases/{sessionId}`.
9. User is redirected to the success page, which reads the enrollment from Firestore (read-only).
10. User clicks through to start the course.

### Access a paid lesson

1. User navigates to a lesson page.
2. Server Component reads the lesson doc from `courses/{courseId}/lessons/{lessonId}`.
3. If `lesson.isFree` is true, render the video.
4. If not, verify the user's Firebase Auth token and read `enrollments/{uid}::{courseId}`.
5. If enrollment exists and `status === "active"`, render the Vimeo embed.
6. Otherwise, redirect to the course landing page with a prompt to purchase.

### Browse and favorite resources

1. User visits the resource hub.
2. Sees a grid of asset cards with search bar and filters.
3. Types a search query or selects filters. Results update with pagination.
4. Clicks a card to open the detail modal.
5. Clicks the heart button to favorite (must be logged in).
6. Clicks the external link to visit the original asset page.

### Mark a lesson complete

1. User finishes watching a lesson.
2. Clicks "Mark as Complete."
3. Client sends a request. Server writes/updates `progress/{uid}::{courseId}::{lessonId}` with `completed: true`.
4. Sidebar updates to show the lesson as complete.

---

## 11. Engineering Design Overview

### Design principles

- **Webhook is the source of truth for purchases.** The success page never grants access. All enrollment writes happen in the Stripe webhook handler.
- **Enrollments are the single source of truth for course access.** No denormalized arrays on user docs. One document read answers "does this user own this course?"
- **Idempotency everywhere money or state is involved.** Stripe webhooks, enrollment creation, lesson completion, and favoriting must all be safe to retry.
- **Server-side access control.** Paid content (Vimeo video IDs) is only sent to the client after server-side verification of enrollment status.
- **No redundant derived state.** If a fact can be determined by reading one canonical document, don't store it in a second place.

### Server Actions vs Route Handlers

Both are valid patterns in this project. The rule:

- **Server Actions** for user-initiated mutations from the UI: creating a Checkout Session, toggling a favorite, marking a lesson complete. They are simpler to wire up from Client Components and handle form submissions natively.
- **Route Handlers** for external inbound requests: Stripe webhooks, any future third-party callbacks. These need raw request body access and custom header reading that Server Actions don't support.

Either pattern is acceptable for a given use case. The spec uses "Server Action" as the default for UI mutations because it's less boilerplate, but replacing any Server Action with a Route Handler is a valid implementation choice if it simplifies the code.

---

## 12. Chosen Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js (App Router) | Server Components for access-gated pages, Server Actions for mutations, file-system routing. |
| Hosting | Vercel | Zero-config deployment for Next.js, serverless functions for webhook handling. |
| Authentication | Firebase Auth | Shared auth across both products. Supports email/password + Google. Firebase Admin SDK for server-side token verification. |
| Database | Firestore | Document model fits course/lesson/enrollment structure. Transactions for idempotent writes. Real-time listeners available if needed later. |
| Payments | Stripe (Checkout) | Hosted payment page. Webhook-driven fulfillment. One-time payments for courses. |
| Video hosting | Vimeo | Private/domain-restricted embeds. Offloads video storage and streaming. Application controls who sees the embed. |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with pre-built accessible components. |
| Asset images | External URLs | Resource hub images are links to external sources. No object storage needed for MVP. |

---

## 13. Main System Components

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Course Pages  │  │ Resource Hub │  │  Auth Pages    │  │
│  │ (Server Comp) │  │ (Server Comp)│  │ (Client Comp) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                  │                   │          │
│  ┌──────┴──────────────────┴───────────────────┴───────┐ │
│  │              Server Actions / Route Handlers         │ │
│  │  - createCheckoutSession (Stripe)                    │ │
│  │  - toggleFavorite                                    │ │
│  │  - markLessonComplete                                │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                 │
│  ┌──────────────────────┴──────────────────────────────┐ │
│  │              Webhook Route Handler                    │ │
│  │  POST /api/webhook/stripe                            │ │
│  │  - Signature verification                            │ │
│  │  - Idempotent enrollment fulfillment                 │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐       ┌────────────┐       ┌──────────┐
   │ Firebase  │       │ Firestore  │       │  Stripe  │
   │   Auth    │       │            │       │          │
   └──────────┘       └────────────┘       └──────────┘
                            │
                      ┌─────┴─────┐
                      │   Vimeo   │
                      │ (embeds)  │
                      └───────────┘
```

---

## 14. How the Components Interact

### Authentication flow

**Client side (Firebase Auth SDK):**
1. The app initializes the Firebase Auth client SDK with the project's public config (`NEXT_PUBLIC_FIREBASE_*` env vars).
2. Sign-up/login UI uses Firebase Auth methods: `createUserWithEmailAndPassword()`, `signInWithEmailAndPassword()`, `signInWithPopup(GoogleAuthProvider)`, and `sendPasswordResetEmail()`.
3. On successful authentication, Firebase issues an ID token (JWT).
4. The app stores the ID token in a session cookie (set via a server endpoint or Server Action) so that Server Components can read it on subsequent requests.

**Server side (Firebase Admin SDK):**
1. Server Components and Server Actions read the session cookie and verify the ID token using `admin.auth().verifyIdToken(token)`.
2. The verified token provides the Firebase UID, email, and auth provider — no client-provided user ID is trusted without this verification.
3. All authenticated Firestore operations (enrollment checks, progress reads, checkout session creation) use the UID from the verified token.

**User document creation:**
1. On first sign-in (any provider), the app checks if `users/{uid}` exists in Firestore.
2. If not, it creates the document with `displayName`, `email`, `createdAt`, and `stripeCustomerId: null`.
3. For Google sign-in, display name and email come from the Google profile. For email/password, display name is collected during sign-up (or defaults to the email prefix).
4. This check-and-create is idempotent — if the document already exists, no write occurs.

**Account linking:**
- Firebase Auth should be configured with "Link accounts that use the same email" in the Firebase console. This ensures that a user who signs up with email/password and later clicks "Sign in with Google" (same email) is linked to the same UID, not given a second account.

### Purchase flow

1. **Server Action** verifies the user's Firebase token, then calls `stripe.checkout.sessions.create()` with `metadata: { firebaseUid, courseId }`.
2. **Stripe Checkout** handles the payment UI. No payment data touches our server.
3. **Stripe webhook** (`checkout.session.completed`) fires to `POST /api/webhook/stripe`.
4. **Webhook handler** verifies the signature, checks `payment_status === "paid"`, then runs a Firestore transaction to create the enrollment and purchase records.
5. **Success page** reads the enrollment from Firestore. It is read-only.

### Lesson access flow

1. **Server Component** receives the route params (`courseId`, `lessonId`).
2. Reads the lesson doc from `courses/{courseId}/lessons/{lessonId}`.
3. If the lesson is free, renders the Vimeo embed.
4. If the lesson is paid, verifies the user's Firebase token, reads `enrollments/{uid}::{courseId}`, and renders the embed only if the enrollment is active.

### Resource hub flow

1. **Server Component** queries the `assets` collection with search, filter, and pagination parameters.
2. Renders asset cards. Heart state is fetched per-user if authenticated.
3. **Server Action** handles `toggleFavorite` — writes/deletes `favorites/{uid}::{assetId}` in Firestore.

---

## 15. Data Model Overview

### Design principles

1. **`enrollments` is the single source of truth for course access.** No denormalized arrays. One document read by ID answers "does this user own this course?"
2. **Lessons are subcollections of courses.** "All lessons for this course" is a natural collection read.
3. **Composite document IDs use `::` as delimiter.** Firebase UIDs are alphanumeric. Slugs use `[a-z0-9-]`. The `::` delimiter is unambiguous.
4. **No redundant derived state.** If the enrollment doc exists and is active, the purchase was fulfilled. No separate `fulfilled` boolean. No `enrolledCourses` array.

### Collections

```
users/{firebaseUid}
├── displayName: string
├── email: string
├── authProvider: "email" | "google"      (provider used at account creation)
├── stripeCustomerId: string | null
├── createdAt: Timestamp
└── updatedAt: Timestamp

enrollments/{firebaseUid}::{courseId}
├── userId: string
├── courseId: string
├── stripeSessionId: string
├── enrolledAt: Timestamp
├── status: "active" | "revoked"
└── source: "purchase" | "gift" | "promo"

purchases/{stripeSessionId}
├── userId: string
├── courseId: string
├── stripeSessionId: string
├── stripePaymentIntentId: string
├── stripeCustomerId: string
├── amountPaid: number                    (cents)
├── currency: string
└── purchasedAt: Timestamp

courses/{courseId}
├── title: string
├── slug: string
├── description: string
├── stripePriceId: string
├── isFree: boolean
├── thumbnailUrl: string
└── publishedAt: Timestamp

courses/{courseId}/lessons/{lessonId}
├── title: string
├── slug: string
├── vimeoVideoId: string
├── isFree: boolean
├── order: number
└── durationSeconds: number

progress/{firebaseUid}::{courseId}::{lessonId}
├── userId: string
├── lessonId: string
├── courseId: string
├── completed: boolean
└── completedAt: Timestamp | null

assets/{assetId}
├── title: string
├── artistName: string
├── description: string
├── imageUrl: string                      (external URL)
├── tags: string[]
├── source: string                        (e.g., "Booth", "Gumroad", "Free")
├── externalUrl: string                   (link to original asset page)
├── createdAt: Timestamp
└── updatedAt: Timestamp

favorites/{firebaseUid}::{assetId}
├── userId: string
├── assetId: string
└── favoritedAt: Timestamp
```

### Indexes required

| Collection | Fields | Purpose |
|---|---|---|
| `enrollments` | `userId`, `status` | "My Courses" page: query all active enrollments for a user. |
| `assets` | `tags` (array-contains), `source`, `createdAt` | Filtered asset browsing with pagination. |
| `progress` | `userId`, `courseId`, `completed` | Course progress summary: "X of Y lessons complete." |
| `favorites` | `userId` | "My Favorites" page. |

---

## 16. Payment and Access Architecture

This section summarizes the conclusions from the Stripe research report.

### Checkout Session creation

- Created via Server Action after verifying the user's Firebase Auth token.
- Uses Stripe Price objects (not ad-hoc amounts).
- `metadata: { firebaseUid, courseId }` and `client_reference_id: firebaseUid`.
- `success_url` includes `{CHECKOUT_SESSION_ID}` for the confirmation page.

### Source of truth

- `checkout.session.completed` webhook with `payment_status === "paid"` is the sole trigger for granting course access.
- The success page is read-only. It reads the enrollment from Firestore but never creates it.

### Fulfillment

- Webhook handler verifies the Stripe signature.
- Runs a Firestore transaction that:
  1. Reads `enrollments/{uid}::{courseId}`.
  2. If it exists, returns early (idempotent).
  3. If not, creates the enrollment doc and the purchase doc.
- Transaction touches exactly two documents. No user doc update needed.

### Access gating

- Server Components read `enrollments/{uid}::{courseId}` by document ID (O(1)).
- If the enrollment exists and `status === "active"`, the Vimeo embed is rendered.
- If not, the user is redirected to the course landing page.

### Edge cases handled

| Scenario | Outcome |
|---|---|
| Duplicate webhook delivery | Transaction sees existing enrollment, exits early. |
| User doesn't return to success page | Webhook still fires, enrollment still created. |
| User clicks "Buy" twice | Two sessions created, only the completed one triggers fulfillment. |
| User already enrolled, buys again | New purchase record created, enrollment unchanged. Prevent at UX level. |
| Webhook endpoint temporarily down | Stripe retries for up to 3 days. |

---

## 17. Idempotency Requirements

Every action tied to money, access, or saved user state must be safe to retry.

| Action | Idempotency mechanism |
|---|---|
| **Enrollment creation** | Firestore transaction: check `enrollments/{uid}::{courseId}` existence before writing. Composite document ID enforces one enrollment per user-course pair. |
| **Purchase recording** | Document ID is the Stripe Session ID. Firestore rejects duplicate document creation. |
| **Mark lesson complete** | Document ID is `{uid}::{courseId}::{lessonId}`. Upsert (set with merge) is inherently idempotent. |
| **Toggle favorite** | Document ID is `{uid}::{assetId}`. Toggle = check existence, then create or delete. |
| **Stripe webhook handling** | Enrollment transaction provides idempotency. Optionally store processed event IDs for defense in depth. |

---

## 18. Security and Access Control Considerations

### Authentication

- Firebase Auth handles all user authentication. No custom auth system.
- **Two providers for MVP**: email/password and Google sign-in. Both produce the same Firebase UID-based identity.
- Firebase Admin SDK verifies ID tokens server-side in every Server Action and Server Component that accesses user-specific data.
- No client-provided user ID is trusted without server-side token verification.
- Password reset is handled entirely by Firebase Auth (`sendPasswordResetEmail()`). No custom reset flow.
- Account linking is enabled in the Firebase console ("Link accounts that use the same email") to prevent duplicate accounts when a user signs up with email and later uses Google with the same email.
- Session management uses a server-set cookie containing the Firebase ID token. Token expiry and refresh are handled by the Firebase client SDK; the cookie is updated accordingly.

### Payment security

- Stripe Checkout handles all payment data. No card numbers touch our server.
- Webhook signature is verified on every delivery using `STRIPE_WEBHOOK_SECRET`.
- Without signature verification, anyone could POST fake events and grant themselves access.

### Content protection

- Vimeo videos use domain-restricted embed privacy settings.
- The `vimeoVideoId` is only rendered in the client when the Server Component confirms enrollment.
- Lesson metadata (titles, descriptions) is public — it serves as course marketing.

### Firestore security rules

- All writes to `enrollments`, `purchases`, and `users` are server-only (Firebase Admin SDK). Client-side writes are blocked by Firestore rules.
- `progress` allows client reads/writes scoped to the authenticated user's own documents (enforced by composite ID prefix matching on `{uid}::` ).
- `favorites` allows client reads/writes scoped to the authenticated user's own documents (same `{uid}::` prefix matching).
- `courses` and `lessons` (subcollection) are publicly readable.
- `assets` are publicly readable. All asset writes are server-only (seed scripts via Admin SDK).

### Environment variables

| Variable | Scope | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server only | Never exposed to client. |
| `STRIPE_WEBHOOK_SECRET` | Server only | Used for webhook signature verification. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | Prefixed with `NEXT_PUBLIC_` for browser access. |
| `FIREBASE_ADMIN_*` credentials | Server only | Service account for Firebase Admin SDK. |
| `NEXT_PUBLIC_FIREBASE_*` config | Client | Firebase client SDK configuration (not secret). |

---

## 19. Resolved Decisions

These were originally open questions. They are now decided for MVP.

| Decision | Resolution | Rationale |
|---|---|---|
| **Auth providers** | Email/password + Google sign-in, both from day one. | Firebase Auth supports both natively. Google sign-in improves conversion. Email/password provides a fallback for users without Google accounts. Password reset is handled by Firebase Auth's built-in email flow. |
| **Content management** | Seed scripts (TypeScript scripts using Firebase Admin SDK). | One course, one set of assets. A seed script that reads from a JSON file and writes to Firestore is the simplest correct approach. No admin UI needed for MVP. |
| **Asset data source** | JSON file checked into the repo, loaded by seed script. | Assets are curated manually. A JSON file is versionable, reviewable, and easy to edit. The seed script is idempotent (uses fixed asset IDs). |
| **Search implementation** | Filter-based (tags + source), no full-text search. | Firestore doesn't support full-text search natively. The MVP asset count is small enough that tag/source filters are sufficient. Add Algolia or Typesense if the library grows past ~500 assets. |
| **Refund policy** | Manual for MVP. | Refunds are handled in the Stripe Dashboard. Access revocation (set enrollment status to `"revoked"`) is a manual Firestore update. Automate via `charge.refunded` webhook later if volume justifies it. |

## 20. Open Questions

| Question | Context | When to decide |
|---|---|---|
| **Vimeo plan level** | Domain-restricted embeds require Vimeo Pro, Business, or Premium. Need to confirm which plan supports the privacy settings we need and at what cost. | Before Milestone 3. Must be resolved before uploading course videos. |
| **Free course support** | The `isFree` field on courses exists, but the enrollment flow for a fully free course (no Stripe, just create an enrollment on sign-up or button click) isn't defined. | Before MVP if the first course has any fully-free variant. If the first course is paid-only with some free preview lessons, this can wait. |
| **Asset image fallback** | External image URLs may break (source site goes down, URL changes). Should we cache/proxy images, or accept broken images as a known risk for MVP? | Before Milestone 2. Accepting broken images with a placeholder fallback is simplest. |

---

## 21. Future Enhancements

These are explicitly out of scope for MVP but worth designing toward.

- **Full-text search.** Add Algolia or Typesense for free-text search across asset titles, descriptions, and artist names. Sync Firestore data via Cloud Functions or a write-through pattern.
- **Multiple courses.** The data model already supports this — each course is a document with its own lessons subcollection and Stripe Price.
- **Lesson ratings.** Add a `ratings/{uid}::{lessonId}` collection with the same composite ID pattern.
- **Comments/discussion.** Add a `comments` subcollection under lessons. Requires moderation consideration.
- **Admin dashboard.** Manage courses, lessons, assets, and view enrollment/purchase data. Could be a protected `/admin` route or a separate app.
- **Course bundles or discounts.** Stripe supports coupon codes and promotion codes natively.
- **Subscription model.** If demand supports it, switch from one-time purchases to a subscription that unlocks all courses. Requires different Stripe integration (subscription mode, `invoice.payment_succeeded` events).
- **2D VTubing and PNGtubing content.** Additional courses and resource hub categories.
- **Real-time progress sync.** Firestore real-time listeners to update the sidebar as other tabs complete lessons.
- **Mobile-responsive design.** The MVP should be responsive, but dedicated mobile optimization is a future effort.
- **Analytics.** Track which lessons are most watched, where users drop off, which assets are most favorited.
- **Email notifications.** Welcome emails, purchase confirmations, new course announcements.
