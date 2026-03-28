# CLAUDE.md

## Project Overview

VTubing education platform with two connected products sharing a single Firebase Auth account system:

1. Course Platform — Paid video courses (Stripe one-time purchases, Vimeo embeds, progress tracking)
2. Resource Hub — Free searchable asset library (tag/source filters, favorites, external links)

---

## Important Files (Read First)

Before making any decisions or writing code, always read:

- `project_spec.md` — full product requirements, system design, and data model
- `research_report_stripe_course_access.md` — Stripe payment and idempotency design
- `docs/architecture.md` — system overview, component interactions, and key flows
- `docs/changelog.md` — what has been built and decided so far
- `CLAUDE.md` — implementation rules and constraints

If something is unclear:
- Prefer `project_spec.md`
- Do NOT invent new architecture

---

## Tech Stack

- Next.js (App Router, Server Components, Server Actions) on Vercel
- Firebase Auth (email/password + Google)
- Firebase Admin SDK (server-side verification)
- Firestore (database)
- Stripe Checkout (one-time payments, webhook-driven fulfillment)
- Vimeo (video hosting, domain-restricted embeds)
- Tailwind CSS + shadcn/ui
- TypeScript (strict mode)

---

## Architecture

### Core Principles

- Stripe webhook is the source of truth for purchases
- Enrollments are the source of truth for course access
- Server-side access control only (never trust client)
- No redundant or denormalized state
- All writes must be idempotent

### Data Model Rules

- Composite IDs use `::`
- Lessons are subcollections:
  - `courses/{courseId}/lessons/{lessonId}`
- Enrollment document existence = access
- No `enrolledCourses` array on user

### Core Collections

- `users/{firebaseUid}`
- `enrollments/{uid}::{courseId}`
- `purchases/{stripeSessionId}`
- `courses/{courseId}`
- `courses/{courseId}/lessons/{lessonId}`
- `progress/{uid}::{courseId}::{lessonId}`
- `assets/{assetId}`
- `favorites/{uid}::{assetId}`

### Access Control Pattern


lesson.isFree → allow
not authenticated → deny
enrollments/{uid}::{courseId} exists AND status === "active" → allow
otherwise → deny


### Payment Flow

1. Server Action verifies Firebase user
2. Create Stripe Checkout Session with metadata
3. Stripe handles payment
4. Webhook creates enrollment (idempotent)
5. Success page is read-only

---

## Design Style Guide

### UI Principles

- Clean, minimal interface
- Content-first (courses/resources are the focus)
- Responsive, mobile-first
- Avoid unnecessary UI complexity

### Component Patterns

- Use shadcn/ui for interactive elements
- Use Tailwind for layout and spacing
- Keep components small and focused
- Prefer Server Components unless interactivity is required

---

## Product & UX Guidelines

### Core UX Principles

- Speed over perfection
- Minimize friction (login, purchase, navigation)
- One-click actions when possible
- Avoid unnecessary steps

### Copy Tone

- Casual, creator-focused
- Clear and concise
- Helpful error messages

---

## Constraints & Policies

### Security (MUST FOLLOW)

- NEVER expose secrets to the client
- ALWAYS use environment variables
- NEVER trust client-provided user data
- ALWAYS verify Firebase tokens server-side
- ALWAYS verify Stripe webhook signatures

### Idempotency

- Enrollment creation must be idempotent
- Favorites must be idempotent
- Progress updates must be idempotent
- Stripe webhook handling must be idempotent

### Code Quality

- TypeScript strict mode
- No `any` without justification
- Keep functions small and readable

### Dependencies

- Do NOT introduce new services without justification
- Do NOT replace Firebase, Stripe, or Firestore
- Minimize external dependencies for MVP

---

## Core User Flows

### Authentication

- Firebase Auth handles all login/signup
- Providers:
  - Email/password
  - Google
- Firebase UID is the canonical identity

### Purchase Flow

- User initiates checkout
- Stripe handles payment
- Webhook grants access
- Client never grants access

### Resource Hub

- Filter by tags and source
- Pagination
- Favorite/unfavorite assets

---

## Repository Etiquette

### Branching

- ALWAYS create a feature branch
- NEVER commit directly to main

Naming:
- `feature/...`
- `fix/...`

### Workflow

1. Create branch
2. Implement feature
3. Test locally
4. Push branch
5. Create PR

### Before pushing

- Run `npm run lint`
- Run `npm run build`
- Manually test

---

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint


## Documentation

- [Project Spec](project_spec.md) — full product and engineering spec
- [Research Report On Stripe](research_report_stripe_course_access.md) — payment flow and webhook architecture
- [Architecture](docs/architecture.md) — system overview and key flows
- [Changelog](docs/changelog.md) — version history and decisions