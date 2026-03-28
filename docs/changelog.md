# Changelog

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
