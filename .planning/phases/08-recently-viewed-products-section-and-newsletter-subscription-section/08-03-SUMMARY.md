---
phase: 08-recently-viewed-products-section-and-newsletter-subscription-section
plan: "03"
subsystem: ui
tags: [react-hook-form, zod, next-intl, tailwind, prisma, better-auth]

# Dependency graph
requires:
  - phase: 08-01
    provides: subscribeToNewsletter server action, newsletterSchema, i18n keys
  - phase: 08-02
    provides: RecentlyViewedSection server component

provides:
  - NewsletterForm client component with gender radio, email input, inline success
  - NewsletterSection full-width wrapper with neutral-100 background
  - Home page wired with RecentlyViewedSection + NewsletterSection after HeroPageBuilder
  - Anonymous-to-auth merge carries recentlyViewedProduct rows via $transaction

affects: [home-page, anonymous-session-merge, newsletter]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - z.input<typeof schema> for useForm TFieldValues when schema uses .default() — avoids resolver type mismatch
    - Suspense fallback=null for async server components that stream silently
    - $transaction updateMany pattern for migrating entity rows from anonymous to authenticated userId

key-files:
  created:
    - src/features/newsletter/ui/NewsletterForm.tsx
    - src/features/newsletter/ui/NewsletterSection.tsx
  modified:
    - src/widgets/home/ui/view.tsx
    - src/features/auth/lib/on-link-account.ts

key-decisions:
  - "z.input<typeof newsletterSchema> used as TFieldValues for useForm — Zod .default() makes input type optional but output required; using input type prevents resolver TS mismatch"
  - "NewsletterSection heading hardcoded Ukrainian — consistent with CONTEXT.md screenshot; form strings remain i18n via useTranslations"

patterns-established:
  - "z.input<T> / z.infer<T> (output) split for useForm TFieldValues vs TTransformedValues when schema uses .default()"

requirements-completed: []

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 8 Plan 03: Newsletter UI + Home Page Integration Summary

**NewsletterForm with gender radio and inline success, NewsletterSection wrapper, home page wired with RecentlyViewed + Newsletter sections, and anonymous-to-auth recently viewed merge via Prisma $transaction**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T20:33:12Z
- **Completed:** 2026-02-28T20:35:37Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created NewsletterForm: client component with gender radio (defaults "woman"), underline-only email input, black submit button, and inline "Дякуємо! Ви підписані" success state
- Created NewsletterSection: full-width bg-neutral-100 section wrapping the form with centered heading
- Updated home page view.tsx to render all three sections: HeroPageBuilder, Suspense-wrapped RecentlyViewedSection, and NewsletterSection
- Patched on-link-account.ts to include recentlyViewedProduct.updateMany in the $transaction — anonymous recently viewed data now transfers on sign-in

## Task Commits

Each task was committed atomically:

1. **Task 1: Create NewsletterForm and NewsletterSection components** - `3d6c57f` (feat)
2. **Task 2: Wire home page + patch anonymous merge** - `ae5b220` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/features/newsletter/ui/NewsletterForm.tsx` - Client form component: react-hook-form + zodResolver, gender radio, email input, black submit button, submitted success state
- `src/features/newsletter/ui/NewsletterSection.tsx` - Full-width neutral-100 section wrapper containing NewsletterForm
- `src/widgets/home/ui/view.tsx` - Home page now renders HeroPageBuilder + Suspense(RecentlyViewedSection) + NewsletterSection
- `src/features/auth/lib/on-link-account.ts` - $transaction extended with recentlyViewedProduct.updateMany after favoriteProduct.updateMany

## Decisions Made

- Used `z.input<typeof newsletterSchema>` as `TFieldValues` generic for `useForm` — Zod's `.default('woman')` on the gender field creates an optional input type but required output type. Passing the input type as TFieldValues matches what zodResolver infers, eliminating the TS2322 resolver type mismatch. The output type (`NewsletterFormData`) is passed as TTransformedValues.
- NewsletterSection heading text hardcoded Ukrainian — consistent with CONTEXT.md; interactive form strings use `useTranslations('Newsletter')`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript resolver type mismatch in NewsletterForm**
- **Found during:** Task 1 (Create NewsletterForm)
- **Issue:** `zodResolver(newsletterSchema)` produced a `Resolver<{ gender?: "woman" | "man" }>` (input type, where `.default()` makes gender optional) but `useForm<NewsletterFormData>` expected `Resolver<{ gender: "woman" | "man" }>` (output type) — TS2322 error
- **Fix:** Used `useForm<z.input<typeof newsletterSchema>, unknown, NewsletterFormData>` — input type for TFieldValues matches resolver, output type for TTransformedValues used in onSubmit
- **Files modified:** `src/features/newsletter/ui/NewsletterForm.tsx`
- **Verification:** `npx tsc --noEmit` reports 0 errors
- **Committed in:** `3d6c57f` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix essential for correct TypeScript compilation. No scope creep.

## Issues Encountered

- Zod `.default()` creates a type mismatch between schema input and output types when used with react-hook-form's zodResolver generic parameters. Resolved using the three-generic form of `useForm<TFieldValues, TContext, TTransformedValues>` with `z.input<>` for TFieldValues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 8 is now complete:
- Newsletter subscription UI fully functional — form renders on home page, submits to subscribeToNewsletter, shows inline success
- Recently Viewed carousel integrated into home page, streaming silently via Suspense
- Anonymous-to-auth data migration covers: contact info, delivery info, payment info, orders, favorites, and now recently viewed products
- No blockers for subsequent work

---
*Phase: 08-recently-viewed-products-section-and-newsletter-subscription-section*
*Completed: 2026-02-28*

## Self-Check: PASSED

- FOUND: src/features/newsletter/ui/NewsletterForm.tsx
- FOUND: src/features/newsletter/ui/NewsletterSection.tsx
- FOUND: src/widgets/home/ui/view.tsx
- FOUND: src/features/auth/lib/on-link-account.ts
- FOUND commit: 3d6c57f
- FOUND commit: ae5b220
