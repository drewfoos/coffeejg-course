# Research Report: Stripe Course Purchase Flow

> Architecture recommendation for the VTubing course platform.
> Stack: Next.js (Vercel) + Firebase Auth + Firestore + Stripe + Vimeo

---

## Executive Summary

The webhook is the source of truth, not the browser. Every purchase decision — granting access, recording enrollment, updating user state — happens inside the `checkout.session.completed` webhook handler using a Firestore transaction. The success page is a read-only confirmation screen. This single principle drives every recommendation below.

---

## 1. Checkout Session Creation

Create sessions via a Next.js Server Action. The user clicks "Buy Course," the server creates a Stripe Checkout Session with all the metadata needed for fulfillment, and Stripe handles the entire payment UI.

### What to attach to the session

| Field | Value | Why |
|---|---|---|
| `metadata.firebaseUid` | The authenticated user's Firebase UID | Links the payment to your user. This is the join key for everything. |
| `metadata.courseId` | Your internal course identifier (e.g. `"warudo-fundamentals"`) | Tells the webhook which course to enroll the user in. |
| `client_reference_id` | The Firebase UID (again) | Stripe indexes this field — useful for support lookups in the Stripe Dashboard. |
| `customer_email` | The user's email from Firebase Auth | Pre-fills Checkout, improves UX, creates a Stripe Customer automatically. |

**Do not** attach sensitive data. Do not attach data you can derive from the courseId (like price). Let Stripe be the authority on what was charged.

### Session parameters

```
mode: "payment"                          // One-time purchase, not subscription
line_items: [{ price: priceId, quantity: 1 }]  // Use a Stripe Price object, not ad-hoc amounts
success_url: "{origin}/courses/{courseId}/success?session_id={CHECKOUT_SESSION_ID}"
cancel_url: "{origin}/courses/{courseId}"
metadata: { firebaseUid, courseId }
client_reference_id: firebaseUid
customer_email: user.email
```

Use Stripe Price objects (created in the Stripe Dashboard or via API), not inline `price_data`. Price objects are reusable, auditable, and prevent accidental price changes in code.

---

## 2. Redirect and Success Flow

### What happens after the user pays

1. Stripe redirects the browser to your `success_url` with the `session_id` query param.
2. **Independently and in parallel**, Stripe fires the `checkout.session.completed` webhook to your server.
3. Stripe waits up to 10 seconds for your webhook to respond before redirecting the customer. In practice, the webhook usually fires *before* the user sees the success page.

### What the success page should do

The success page is **read-only**. It does not grant access. It checks whether access has already been granted.

1. Read the `session_id` from the URL.
2. On the server (Server Component or server action), verify the session exists by calling `stripe.checkout.sessions.retrieve(sessionId)` and confirm `payment_status === "paid"`.
3. Check Firestore for the enrollment record (`enrollments/{firebaseUid}_{courseId}`).
4. If the enrollment exists: show a confirmation with a link to start the course.
5. If the enrollment doesn't exist yet (rare race condition where the success page loads before the webhook completes): show a "Processing your purchase..." state and poll Firestore briefly (e.g., check every 2 seconds for up to 15 seconds). The webhook will almost always complete within this window.

**Never grant access from the success page.** A user who never reaches the success page must still get their course.

---

## 3. Webhook Handling

### Which events to listen to

| Event | Role | Action |
|---|---|---|
| `checkout.session.completed` | **Primary source of truth** | Fulfill the purchase: create enrollment, record purchase |
| `checkout.session.async_payment_succeeded` | Safety net for async payment methods (ACH, BNPL) | Same fulfillment logic. Not needed if you only accept cards, but costs nothing to handle. |
| `checkout.session.async_payment_failed` | Async payment failed after session was created | Log it. No enrollment was created because `payment_status` was `"unpaid"` at session completion. |
| `checkout.session.expired` | Session expired before completion (24h default) | Optional. Log for analytics. No action needed — no money moved. |

**For a card-only course platform**, `checkout.session.completed` with `payment_status === "paid"` is the only event you need to fulfill on. The others are either safety nets or observability.

### Webhook route implementation

```
POST /api/webhook/stripe
```

Key requirements:
- Read the body as **raw text** (not JSON) for signature verification.
- Verify the signature using `stripe.webhooks.constructEvent(body, signature, secret)`.
- Return 200 **quickly** (within a few seconds). Firestore transactions are fast enough to do inline.
- If your handler throws, return 500 — Stripe will retry for up to 3 days.

### Payment status decision logic

When `checkout.session.completed` fires:

- `payment_status === "paid"` → Fulfill immediately.
- `payment_status === "unpaid"` → Do not fulfill. Wait for `async_payment_succeeded`.
- `payment_status === "no_payment_required"` → Fulfill immediately (free course / 100% coupon).

For card payments, you will always see `"paid"`.

---

## 4. Idempotent Purchase Fulfillment

This is the most important section. The webhook **will** fire more than once in production. Your fulfillment logic must be safe to run multiple times for the same session.

### Strategy: Stripe Session ID as Firestore document ID

Use the Checkout Session ID (`cs_...`) as the document ID for your purchase record. Firestore document IDs are unique by definition. Wrap the fulfillment in a Firestore transaction that checks for existence before writing.

### Fulfillment logic (pseudocode)

```
function fulfillPurchase(session):
    firebaseUid = session.metadata.firebaseUid
    courseId = session.metadata.courseId
    enrollmentId = "{firebaseUid}::{courseId}"

    RUN FIRESTORE TRANSACTION:
        1. Read doc at enrollments/{enrollmentId}
        2. If it exists → return early (already fulfilled, idempotent exit)
        3. If it doesn't exist:
           a. Create enrollments/{enrollmentId} with:
              - userId: firebaseUid
              - courseId: courseId
              - stripeSessionId: session.id
              - enrolledAt: serverTimestamp()
              - status: "active"
              - source: "purchase"
           b. Create purchases/{session.id} with:
              - userId: firebaseUid
              - courseId: courseId
              - stripeSessionId: session.id
              - stripePaymentIntentId: session.payment_intent
              - stripeCustomerId: session.customer
              - amountPaid: session.amount_total
              - currency: session.currency
              - purchasedAt: serverTimestamp()
    END TRANSACTION
```

The transaction touches exactly two documents: one enrollment, one purchase. No user doc update needed.

### Why this is idempotent

- The enrollment document ID is `{firebaseUid}::{courseId}` — deterministic and unique per user-course pair.
- The transaction reads before writing. If the document already exists, it exits without modification.
- If two webhook deliveries race, the Firestore transaction serializes them — one succeeds, the other sees the existing document and exits.
- The purchase record uses the Stripe Session ID as its document ID — also naturally unique.

### Why two collections (enrollments + purchases)

- **Enrollments** answer: "Does this user have access to this course?" — the access-check query.
- **Purchases** answer: "What was the financial transaction?" — the audit trail.

These serve different purposes. An enrollment could theoretically be granted without a purchase (gift, promo, admin override). A purchase record should never be modified after creation.

---

## 5. Recommended Firestore Structure

### Design Principles

1. **`enrollments` is the single source of truth for access.** No denormalized arrays, no second place to check. One document read by ID answers "does this user own this course?"
2. **Lessons are subcollections of courses.** Fetching "all lessons for a course" is a natural collection read with no composite index required.
3. **Composite document IDs use `::` as delimiter.** Firebase UIDs are alphanumeric (no colons). Course and lesson slugs should not contain `::`. This avoids the ambiguity risk of using `_` as a delimiter in IDs like `{uid}_{courseId}` where either component might contain underscores.
4. **No redundant derived state.** If the enrollment doc exists and is active, the purchase was fulfilled. No `fulfilled` boolean needed on the purchase record. No `enrolledCourses` array needed on the user doc.

### Collections

```
users/{firebaseUid}
├── displayName: string
├── email: string
├── stripeCustomerId: string | null
├── createdAt: Timestamp
└── updatedAt: Timestamp

enrollments/{firebaseUid}::{courseId}
├── userId: string                     // Firebase UID (indexed)
├── courseId: string                    // (indexed)
├── stripeSessionId: string            // Links back to the purchase
├── enrolledAt: Timestamp
├── status: "active" | "revoked"
└── source: "purchase" | "gift" | "promo"

purchases/{stripeSessionId}
├── userId: string
├── courseId: string
├── stripeSessionId: string
├── stripePaymentIntentId: string
├── stripeCustomerId: string
├── amountPaid: number                 // In cents
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
├── isFree: boolean                    // Free preview lessons
├── order: number
└── durationSeconds: number

progress/{firebaseUid}::{courseId}::{lessonId}
├── userId: string
├── lessonId: string
├── courseId: string
├── completed: boolean
├── completedAt: Timestamp | null
└── lastWatchedAt: Timestamp
```

### Why this structure

| Design choice | Rationale |
|---|---|
| **No `enrolledCourses` array on user doc** | Eliminated. Reading `enrollments/{uid}::{courseId}` by document ID is the same speed as reading the user doc (both are O(1) Firestore gets). The array added a second write on every enrollment, a second place to update on revocation, and couldn't carry metadata (status, enrollment date, source). It was complexity with no performance benefit. |
| **`enrollments` as sole access authority** | One read, one source of truth. Access check = `enrollments/{uid}::{courseId}` exists and `status === "active"`. Revoking access = update one document. No array to keep in sync. |
| **"My Courses" page uses a query, not an array** | `where userId == uid, where status == "active"` on the enrollments collection. This requires a composite index (userId + status), which Firestore auto-suggests on first query. It's one query instead of one doc read — slightly more expensive, but it returns enrollment metadata (enrolled date, source) that the array couldn't provide. The My Courses page is a low-frequency navigation, not a hot path. |
| **Lessons as subcollection of courses** | `courses/{courseId}/lessons` gives you "all lessons for this course" as a simple collection read ordered by `order` field. No composite index needed, no `where courseId == X` filter. Matches the natural hierarchy. |
| **`::` delimiter in composite IDs** | Firebase UIDs are `[a-zA-Z0-9]` only. Course/lesson slugs use `[a-z0-9-]`. The `::` delimiter cannot appear in either component, making ID parsing unambiguous. Security rules can safely split on `::`. |
| **No `fulfilled` boolean on purchases** | Redundant. If `enrollments/{uid}::{courseId}` exists, the purchase was fulfilled. A separate boolean creates a field that can fall out of sync. The purchase record is an immutable audit log — it should never be updated after creation. |
| **Progress with three-part composite ID** | `{uid}::{courseId}::{lessonId}` allows direct document reads for "did this user complete this lesson?" and also allows prefix queries for "all progress in this course" using Firestore's ID range queries. |
| `purchases` keyed by Stripe session ID | Immutable audit trail. Never modified after creation. Natural idempotency key. |
| `isFree` on lessons | Simple boolean gate. No complex role/permission system needed for MVP. |

### Tradeoffs accepted

| Tradeoff | Cost | Why it's worth it |
|---|---|---|
| "My Courses" requires a query instead of a doc read | ~2-5ms slower, slightly higher Firestore cost per read | Eliminates consistency bugs from denormalization. Enrollment metadata is available without a second read. The page loads infrequently. |
| Lessons as subcollection means you can't query lessons across all courses | Need a collection group query (or a collection group index) for "search all lessons" | You almost never need this. Course browsing goes through the course first. If you later need global lesson search, Firestore collection group queries handle it. |
| `::` delimiter is unconventional | Looks unusual in Firestore console | Unambiguous parsing is worth the cosmetic cost. The alternative (`_`) is a real bug risk for any slug-based ID. |

---

## 6. Checking Paid Lesson Access

### The access check

When a user navigates to a lesson page, the server must answer: **"Is this lesson free, or does this user own the course?"**

```
function canAccessLesson(firebaseUid, courseId, lessonId):
    lesson = READ courses/{courseId}/lessons/{lessonId}
    if lesson.isFree → ALLOW

    if user is not authenticated → DENY

    enrollment = READ enrollments/{firebaseUid}::{courseId}
    if enrollment exists AND enrollment.status === "active" → ALLOW

    DENY → redirect to course purchase page
```

### Why read the enrollment doc directly

- One document read by ID. Same speed and cost as reading the user doc — Firestore document gets by ID are O(1).
- The enrollment doc is the single source of truth. No denormalized array to fall out of sync.
- The enrollment doc carries metadata (status, source, enrolledAt) that a bare array of course IDs cannot.
- Revoking access means updating one document. No second write to a user doc array.

### Where to check

Check access in the **Server Component** that renders the lesson page. Do not rely on client-side checks — they can be bypassed. The server reads the user's auth token (Firebase Admin SDK verifies the ID token), reads the enrollment doc, and either renders the lesson (with the Vimeo embed) or redirects.

The Vimeo video ID is stored in Firestore and only sent to the client when access is confirmed server-side. The Vimeo embed should use domain-restricted privacy settings so the video cannot be embedded on other sites even if someone extracts the video ID.

---

## 7. Handling Edge Cases

### Duplicate webhook deliveries

Handled by the Firestore transaction (Section 4). The enrollment document either exists or it doesn't. No duplicates possible.

### Page refresh during checkout

Stripe Checkout is hosted by Stripe (or embedded via iframe). Refreshing the page during checkout either:
- Keeps the user on the Checkout page (Stripe handles session continuity), or
- Navigates them away, which triggers the `cancel_url` redirect.

No partial state is created in your system during checkout. The first time your system learns about the purchase is the webhook.

### User clicks "Buy" twice rapidly

The Server Action that creates the Checkout Session runs twice, creating two sessions. This is fine — only the session the user actually completes will fire a webhook. Uncompleted sessions expire after 24 hours. No cleanup needed.

If you want to prevent this at the UX level, disable the buy button after click and check enrollment status before creating a session.

### Payment succeeds but client doesn't return

This is the most common "failure" case and the entire reason the webhook is the source of truth. The user closes the tab, loses internet, or their browser crashes after entering payment details.

- Stripe still processes the payment.
- Stripe still fires `checkout.session.completed`.
- Your webhook still creates the enrollment.
- Next time the user visits the site and logs in, they have access.

No recovery mechanism needed. The webhook handles it.

### Webhook endpoint is down when payment completes

Stripe retries webhook delivery with exponential backoff for up to **3 days**. Your webhook will eventually receive the event.

If you need a faster safety net: build an admin tool or cron job that calls `stripe.checkout.sessions.list({ status: 'complete' })` and reconciles against your enrollments collection. This is a belt-and-suspenders approach for production confidence, not a required MVP feature.

### User buys the same course twice

The `enrollments/{firebaseUid}_{courseId}` document already exists. The transaction exits early. A new `purchases/{sessionId}` record is created (a second payment did happen), but no duplicate enrollment is created.

You should prevent this at the UX level: if the user is already enrolled, show "Go to Course" instead of "Buy." But even if they circumvent it, the backend is safe.

### Refund

Listen to `charge.refunded` if you want to auto-revoke access. For MVP, handle refunds manually: update the enrollment status to `"revoked"` and remove the courseId from `enrolledCourses`. Stripe's webhook delivers refund events, but the business logic (do you revoke access on refund?) is a product decision.

---

## 8. Security Considerations

### Stripe webhook signature verification

**Mandatory.** Without it, anyone can POST fake events to your webhook URL and grant themselves course access. Always use `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`.

### Firebase Auth token verification on purchase

Before creating a Checkout Session, verify the user's Firebase ID token server-side. Never trust a `userId` sent from the client without verification. The Server Action should:
1. Read the auth token from the request (cookie or header).
2. Verify it with Firebase Admin SDK.
3. Use the verified UID as `metadata.firebaseUid`.

### Vimeo domain restriction

Configure Vimeo embed privacy to only allow embedding on your domain. This prevents someone from extracting a Vimeo video ID from the page source and embedding it elsewhere. It's not DRM, but it's a meaningful barrier.

### Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read their own doc
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // Only server (Admin SDK) writes
    }

    // Enrollments: read own (ID starts with uid::), server writes only
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null
        && enrollmentId[0:request.auth.uid.size() + 2] == (request.auth.uid + '::');
      allow write: if false;
    }

    // Purchases: server only (no client access)
    match /purchases/{purchaseId} {
      allow read, write: if false;
    }

    // Progress: users can read/write their own (ID starts with uid::)
    match /progress/{progressId} {
      allow read, write: if request.auth != null
        && progressId[0:request.auth.uid.size() + 2] == (request.auth.uid + '::');
    }

    // Courses: public read (metadata is marketing)
    match /courses/{courseId} {
      allow read: if true;
      allow write: if false;

      // Lessons: public read (video IDs are gated server-side, not here)
      match /lessons/{lessonId} {
        allow read: if true;
        allow write: if false;
      }
    }
  }
}
```

**Key principle:** All writes to enrollment and purchase data go through the server (Firebase Admin SDK in your API routes/Server Actions), never through client-side Firestore writes. Firestore rules enforce this.

**Note on lesson security rules:** Lesson metadata (title, order, duration) is intentionally public — it's part of the course marketing page. The `vimeoVideoId` field is readable by anyone who queries the lessons subcollection, but the Vimeo embed itself is domain-restricted, and the Server Component only renders the video player for enrolled users. If you want to hide video IDs entirely from unauthenticated users, move `vimeoVideoId` to a `lessonSecrets` subcollection with auth-required rules — but this adds complexity for marginal security gain given Vimeo's domain restriction.

### Lesson metadata vs. video access

Lesson titles and descriptions can be public (they're marketing). The Vimeo video ID should only be returned to authenticated, enrolled users. In your Server Component, conditionally include the video embed based on the access check.

---

## 9. Recommended Architecture Diagram

```
User clicks "Buy Course"
        │
        ▼
Server Action (verified Firebase Auth)
        │
        ▼
stripe.checkout.sessions.create()
  metadata: { firebaseUid, courseId }
        │
        ├──────────────────────────────┐
        ▼                              ▼
User redirected to              Stripe fires webhook
Stripe Checkout                 POST /api/webhook/stripe
        │                              │
        ▼                              ▼
User completes payment          Verify signature
        │                              │
        ▼                              ▼
Redirect to success_url         payment_status === "paid"?
        │                              │
        ▼                              ▼
Success page reads              Firestore transaction:
Firestore enrollment     ───►     - Check enrollments/{uid}_{courseId}
(read-only confirmation)          - If missing: create enrollment + purchase
                                  - Update user.enrolledCourses
                                  - Return 200
```

---

## 10. Summary of Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Fulfillment trigger | `checkout.session.completed` webhook only | Works even if client disappears |
| Idempotency mechanism | Firestore transaction + composite document IDs | Atomic check-and-write, no duplicates possible |
| Enrollment document ID | `{firebaseUid}::{courseId}` | One enrollment per user per course, enforced structurally. `::` delimiter is unambiguous. |
| Purchase document ID | `{stripeSessionId}` | Natural unique key from Stripe. Immutable after creation. |
| Access check | Read `enrollments/{uid}::{courseId}` directly in Server Component | Single source of truth. Same O(1) speed as a user doc read. No denormalized array to sync. |
| Lessons | Subcollection: `courses/{courseId}/lessons/{lessonId}` | Natural hierarchy. "All lessons for course" is a collection read, no index needed. |
| Success page role | Read-only confirmation, never grants access | Webhook is the only write path |
| Video protection | Vimeo domain-restricted embed + server-side gating | Video player only rendered for enrolled users |
| Firestore writes | Server-only via Admin SDK | Security rules block all client writes to enrollment/purchase data |
| No denormalized arrays | `enrolledCourses` array eliminated from user doc | One source of truth (enrollment doc), one place to update on revocation, no consistency bugs |
