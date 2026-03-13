# Phase 3: Visible Bug Fixes - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three specific user-facing defects: favorites persistence (BUG-01, BUG-02), quick-buy variant selection (BUG-04), and announcement bar phone number. No new capabilities — only these three bugs.

</domain>

<decisions>
## Implementation Decisions

### Favorites storage
- DB only (server-authoritative) — Prisma DB is the source of truth
- Anonymous users have no persisted favorites; only authenticated users can save favorites
- No localStorage sync, no merge-on-login

### Favorites UI behavior
- Optimistic UI: heart fills immediately on click, DB save happens in background
- On DB save failure: revert heart to unfavorited + sonner toast ("Couldn't save favorite. Try again.")
- Guest users: heart icon is visible; clicking it opens the auth modal / prompts login

### Quick-buy variant selection
- Nothing pre-selected when modal opens — user must make an explicit choice
- Add-to-cart button is disabled until a variant is selected (no inline error needed)
- Out-of-stock variants: visible but disabled (greyed out / strikethrough)
- After successful add-to-cart: close modal + open cart sidebar

### Announcement bar phone number
- Source priority: Sanity CMS field (primary) → env var (fallback)
- If both are empty/missing: hide the Viber link entirely; rest of announcement bar still shows
- Phone number stored as raw digits (e.g., `380991234567`); code constructs `viber://chat?number=%2B...` format

### Claude's Discretion
- Exact Sanity schema field name for phone number
- Which env var name to use as fallback
- Exact toast copy beyond the provided template
- Variant selector component styling details (beyond greyed-out/strikethrough direction)

</decisions>

<specifics>
## Specific Ideas

- Favorites failure toast should follow the Phase 2 pattern: sonner toast, copy is "Couldn't save favorite. Try again."
- Quick-buy post-add behavior (close modal + open cart sidebar) matches common fashion e-commerce flow
- Viber URL format: `viber://chat?number=%2B{digits}` — code constructs this, Sanity stores only digits

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-visible-bug-fixes*
*Context gathered: 2026-02-23*
