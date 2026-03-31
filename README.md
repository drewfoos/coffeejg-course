# CoffeeJG VTubing Course

A full-stack education platform for learning 3D VTubing. Features paid video courses with Stripe payments, a free searchable resource hub with 176+ curated assets, and an admin CMS for content management.

**Live:** Deployed on Vercel

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Server Actions)
- **Auth:** Firebase Auth (email/password + Google)
- **Database:** Firestore (via Firebase Admin SDK)
- **Payments:** Stripe Checkout (one-time + subscriptions)
- **Video:** Vimeo (domain-restricted embeds)
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript (strict mode)
- **Hosting:** Vercel

## Features

### Course Platform
- Video lessons with progress tracking and completion markers
- Dual pricing: monthly subscription or lifetime one-time purchase
- Stripe-powered checkout with webhook-driven enrollment
- Subscription management: cancel, resume, upgrade monthly to lifetime
- Lesson access control (free preview lessons + paid gated content)

### Resource Hub
- 176+ curated free VTuber assets (models, textures, rigs, animations)
- Search by name, filter by tags and source (Ko-fi, Booth, VGen, Gumroad)
- Favorite/unfavorite with optimistic UI
- Paginated browsing with asset detail modals

### Admin CMS
- Course and lesson management with Plate.js rich text editor
- User management: search, view enrollments, cancel subscriptions, delete accounts
- Enrollment controls: revoke access, cancel at period end, immediate cancel

### Security
- Server-side access control (Firebase session cookies, Admin SDK verification)
- Stripe webhook signature verification + transactional event deduplication
- Input validation on all server actions
- Security headers (HSTS, X-Frame-Options, CSP, Referrer-Policy)
- Firestore rules deny all client-side access
- Video IDs resolved server-side (never leaked to client)

## Getting Started

### Prerequisites

- Node.js 22+
- Firebase project with Auth + Firestore enabled
- Stripe account with webhook configured
- Vimeo account (for video hosting)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/drewfoos/coffeejg-course.git
   cd coffeejg-course
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` from the example:
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase, Stripe, and Vimeo credentials.

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

### Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `FIREBASE_*` | Firebase Admin SDK credentials |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase client SDK config |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_LIFETIME_PRICE_ID` | Stripe price ID for lifetime plan |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe price ID for monthly plan |
| `NEXT_PUBLIC_APP_URL` | App URL (for Stripe redirects) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed:course` | Seed sample course + lessons |
| `npm run seed:assets` | Seed resource hub assets |
| `npm run seed` | Run all seed scripts |

## Architecture

Single Next.js app on Vercel connecting to Firebase Auth, Firestore, Stripe, and Vimeo. No custom backend — all server logic runs in Server Components, Server Actions, and Route Handlers.

- **Enrollment doc = course access.** No denormalized arrays.
- **Webhook is the only enrollment creator.** Success page is read-only.
- **All mutations are idempotent.** Safe for retries and duplicate webhooks.
- **Composite IDs** (`uid::courseId`) enforce structural uniqueness.

See [docs/architecture.md](docs/architecture.md) for the full system design and [docs/changelog.md](docs/changelog.md) for version history.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    admin/                # Admin CMS (courses, lessons, users)
    api/webhook/stripe/   # Stripe webhook handler
    courses/              # Course and lesson pages
    resources/            # Resource hub
    pro/                  # Pricing page
    settings/             # User settings + subscription management
  components/             # React components
    admin/                # Admin UI components
    course/               # Course-specific components
    resources/            # Resource hub components
    settings/             # Settings components
    layout/               # Navbar, footer
    ui/                   # shadcn/ui + custom UI primitives
  lib/
    actions/              # Server Actions (checkout, billing, admin)
    auth/                 # Auth helpers (session, user doc creation)
    firebase/             # Firebase client + admin SDK setup
    firestore/            # Firestore query functions
    vrm/                  # VRM model utilities
scripts/                  # Seed scripts and asset pipeline
docs/                     # Architecture and changelog
```

## License

Private repository. All rights reserved.
