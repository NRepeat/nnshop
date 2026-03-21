---
phase: 13
plan: 02
status: complete
date: 2026-03-21
---

# Summary: Phase 13 - Plan 02 (Redirect Consistency & Final Audit)

Ensured consistency across all redirect sources (Sanity, `next.config.ts`, and `proxy.ts`) and performed final verification of the Goal State architecture.

## Key Changes

### `next.config.ts`
- Added `trailingSlash: false` to enforce canonical URL patterns.
- Updated `redirects()` to normalize all destination URLs (internal and absolute):
  - Ensures internal paths start with `/` and have no trailing slashes.
  - Ensures absolute URLs for `miomio.com.ua` use `https://www.miomio.com.ua` and have no trailing slashes.

### `proxy.ts`
- Switched from `request.nextUrl.clone()` to `new URL(request.url)` for normalization logic. This prevents `NextURL` from automatically appending trailing slashes, which was causing unnecessary redirect hops.

## Verification Results

### Automated Tests
- Ran `npm test src/shared/lib/tests/proxy.test.ts`
- **Result:** All 9 test cases passed, confirming:
  - Single-hop 301 redirects for domain/protocol/path normalization.
  - Correct `/ru` -> `/ru/woman` routing.
  - Strict trailing slash removal.

### Success Criteria
- [x] All structural and domain redirects resolve in ≤ 1 hop.
- [x] `next.config.ts` is logically aligned with `proxy.ts` canonicalization.
