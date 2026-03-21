---
phase: 13
plan: 01
status: complete
date: 2026-03-21
---

# Summary: Phase 13 - Plan 01 (Core Single-Hop Infrastructure)

Refactored `proxy.ts` middleware to use a "Goal State" pattern, ensuring all structural and domain redirects resolve in a single 301 hop.

## Key Changes

### Infrastructure
- Created `src/shared/lib/tests/proxy.test.ts` using Vitest to verify redirect logic.
- Mocked `next-intl` and local dependencies to enable isolated middleware testing.

### Middleware (`proxy.ts`)
- Implemented **Goal State Normalization Block**:
  - **Canonical Host/Protocol:** Redirects `http` and non-`www` to `https://www.miomio.com.ua` in one hop.
  - **Trailing Slash:** Consistently removes trailing slashes (except root).
  - **Locale Root Fix:** Fixed bug where `/ru` redirected to `/uk/woman`. Now `/ru` -> `/ru/woman`.
  - **Structural Path Consolidation:** Typo fixes (`productt`) and locale prepending are now handled within the same normalization logic.
- Switched to **301 (Permanent)** redirects for all structural changes.

## Verification Results

### Automated Tests
- Ran `npm test src/shared/lib/tests/proxy.test.ts`
- **Result:** 9/9 tests passed.

### Success Criteria
- [x] `/ru` -> `/ru/woman` (301)
- [x] `/uk/` -> `/uk/woman` (301)
- [x] `http://miomio.com.ua` -> `https://www.miomio.com.ua/uk/woman` (301)
- [x] No multi-hop chains in `proxy.ts` logic.
