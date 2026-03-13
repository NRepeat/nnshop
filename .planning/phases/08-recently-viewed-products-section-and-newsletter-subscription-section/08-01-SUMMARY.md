---
phase: 08-recently-viewed-products-section-and-newsletter-subscription-section
plan: "01"
subsystem: backend-foundations
tags: [prisma, server-actions, shopify, newsletter, recently-viewed, i18n, zod]
dependency_graph:
  requires: []
  provides:
    - recordProductView server action (src/entities/recently-viewed/api/record-view.ts)
    - getProductsByHandles Shopify fetch (src/entities/recently-viewed/api/get-products-by-handles.ts)
    - subscribeToNewsletter server action (src/features/newsletter/api/subscribe.ts)
    - newsletterSchema Zod schema (src/features/newsletter/schema/newsletterSchema.ts)
    - newsletter_subscriber DB table (via migration)
  affects:
    - Plans 02 and 03 (UI layers depend on these server actions and types)
tech_stack:
  added: []
  patterns:
    - Prisma upsert with composite unique key (userId_productId)
    - Session auth pattern via auth.api.getSession + headers()
    - Shopify handle query: handle:X OR handle:Y with post-sort to match input order
    - Zod v4 schema with z.enum().default() for gender field
    - Server actions marked 'use server' at file top
key_files:
  created:
    - prisma/migrations/20260228202542_add_newsletter_subscriber/migration.sql
    - src/entities/recently-viewed/api/record-view.ts
    - src/entities/recently-viewed/api/get-products-by-handles.ts
    - src/features/newsletter/api/subscribe.ts
    - src/features/newsletter/schema/newsletterSchema.ts
  modified:
    - prisma/schema.prisma
    - messages/uk.json
    - messages/ru.json
decisions:
  - NewsletterSubscriber model is standalone (no User relation) — email-only identification, no auth required to subscribe
  - recordProductView returns success:false with reason NO_SESSION for anonymous users — silent skip, no error thrown
  - subscribeToNewsletter always returns success:true — duplicate emails treated silently per CONTEXT.md
  - getProductsByHandles post-sorts results to match DB viewedAt DESC order — Shopify API does not guarantee handle order
metrics:
  duration: 2 min
  completed_date: "2026-02-28"
  tasks_completed: 3
  files_created: 5
  files_modified: 3
---

# Phase 08 Plan 01: Backend Foundations (Recently Viewed + Newsletter) Summary

**One-liner:** Prisma migration for newsletter_subscriber table, recordProductView + getProductsByHandles server actions, subscribeToNewsletter + Zod schema, and RecentlyViewed/Newsletter i18n keys for uk/ru locales.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add NewsletterSubscriber to schema + run migration | a37ab82 | prisma/schema.prisma, migration.sql |
| 2 | Create recently-viewed server actions and Shopify fetch | 030eb90 | record-view.ts, get-products-by-handles.ts |
| 3 | Create newsletter server action, Zod schema, and i18n keys | 5489dc2 | subscribe.ts, newsletterSchema.ts, uk.json, ru.json |

## What Was Built

### DB Schema
- Added `NewsletterSubscriber` model to `prisma/schema.prisma` — standalone model with `email` (unique), `gender`, `subscribedAt`, `createdAt`, `updatedAt` fields mapped to `newsletter_subscriber` table
- Applied migration `20260228202542_add_newsletter_subscriber` creating the table in PostgreSQL

### Recently Viewed Server Actions
- **`recordProductView(productHandle, productId)`** — upserts `RecentlyViewedProduct` row (updates `viewedAt` if exists), caps list at 20 per user by deleting overflow records
- **`getProductsByHandles(handles, locale)`** — fetches Shopify products by handle using `handle:X OR handle:Y` query, post-sorts results to match input order (DB returns by viewedAt DESC)

### Newsletter Feature
- **`subscribeToNewsletter({ email, gender })`** — upserts `NewsletterSubscriber`, always returns `{ success: true }` (duplicate emails handled silently)
- **`newsletterSchema`** — Zod schema: `email` with `.email()` validation, `gender` as `z.enum(['woman', 'man']).default('woman')`
- **`NewsletterFormData`** — inferred TypeScript type from schema

### i18n Keys
- Added `RecentlyViewed.title` and full `Newsletter` namespace (heading, forHer, forHim, emailPlaceholder, submit, success, emailError) to both `messages/uk.json` and `messages/ru.json`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prisma client regeneration needed after schema change**
- **Found during:** Task 2 TypeScript verification
- **Issue:** TypeScript reported `Property 'recentlyViewedProduct' does not exist on type 'PrismaClient'` because the client was not regenerated after adding `NewsletterSubscriber` model (which triggered full client regen)
- **Fix:** Ran `npx prisma generate` to regenerate the Prisma client with updated types
- **Files modified:** generated/prisma (auto-generated, not committed)
- **Commit:** Part of Task 2 verification flow

## Self-Check: PASSED

Files exist:
- [x] prisma/schema.prisma contains NewsletterSubscriber model
- [x] prisma/migrations/20260228202542_add_newsletter_subscriber/migration.sql exists
- [x] src/entities/recently-viewed/api/record-view.ts exists
- [x] src/entities/recently-viewed/api/get-products-by-handles.ts exists
- [x] src/features/newsletter/api/subscribe.ts exists
- [x] src/features/newsletter/schema/newsletterSchema.ts exists
- [x] messages/uk.json has RecentlyViewed and Newsletter keys (JSON valid)
- [x] messages/ru.json has RecentlyViewed and Newsletter keys (JSON valid)

Commits exist:
- [x] a37ab82 — feat(08-01): add NewsletterSubscriber model and apply migration
- [x] 030eb90 — feat(08-01): create recently-viewed server actions and Shopify fetch
- [x] 5489dc2 — feat(08-01): create newsletter server action, Zod schema, and i18n keys
