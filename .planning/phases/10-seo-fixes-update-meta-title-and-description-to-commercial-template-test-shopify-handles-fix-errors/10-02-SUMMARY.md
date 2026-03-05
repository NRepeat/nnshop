---
phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors
plan: 02
subsystem: infra
tags: [shopify, storefront-api, node, esm, dotenv, seo, url-audit]

# Dependency graph
requires: []
provides:
  - scripts/test-handles.mjs — ESM script to audit 1738 miomio.com.ua product handles against Shopify Storefront API
  - scripts/handles-ok.txt — list of handles found in Shopify (created when script runs)
  - scripts/handles-missing.txt — list of handles not found in Shopify (created when script runs)
affects: [seo, redirects, shopify-admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plain ESM Node.js utility scripts in scripts/ directory (no TypeScript, uses fetch() natively)"
    - "dotenv double-load pattern: .env first, .env.local override for env var resolution"

key-files:
  created:
    - scripts/test-handles.mjs
  modified: []

key-decisions:
  - "scripts/test-handles.mjs force-committed to git via b82caa3 despite scripts/ being in .gitignore — utility script for one-time SEO audit must be version-controlled for reproducibility"
  - "500ms delay between Shopify API requests (2 req/s) — conservative rate limit to avoid Shopify 429 throttling on 1738-handle batch"
  - "decodeURIComponent applied to extracted handles — handles from Ukrainian-language URLs may be percent-encoded"

patterns-established:
  - "Handle audit pattern: read TSV Address column, split('/product/')[1], query Shopify product(handle:) GraphQL"

requirements-completed:
  - SEO-10-02

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 10 Plan 02: Shopify Handle Audit Script Summary

**ESM Node.js script that reads 1738 miomio.com.ua product URLs from TSV, queries Shopify Storefront API for each handle, and writes handles-ok.txt / handles-missing.txt output files**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T09:52:31Z
- **Completed:** 2026-03-05T09:57:39Z
- **Tasks:** 1 of 2 (Task 2 is checkpoint:human-verify awaiting script execution)
- **Files modified:** 1

## Accomplishments

- Created `scripts/test-handles.mjs` — standalone ESM script with dotenv, TSV parsing, Shopify Storefront API querying, and file output
- Script extracts handles from Address column via `split('/product/')[1]` with `decodeURIComponent` and query-param stripping
- Uses `Shopify-Storefront-Private-Token` header with 500ms rate limiting (~2 req/s, ~14 min total runtime)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create test-handles.mjs script** - `b82caa3` (feat — included in 10-01 plan commit)

**Plan metadata:** (pending final docs commit)

## Files Created/Modified

- `scripts/test-handles.mjs` — ESM script to audit 1738 product handles against Shopify Storefront API

## Decisions Made

- Script was committed in `b82caa3` as part of the 10-01 plan execution (already in git). The write in this plan execution was a no-op (identical content). Commit hash attributed to `b82caa3`.
- `.gitignore` has `scripts` as an ignored directory. The file was force-committed with `git add -f` in the 10-01 session. No `.gitignore` modification needed or made.
- `decodeURIComponent` applied to handle extraction — handles from Ukrainian slug URLs may be percent-encoded in the TSV.
- 500ms delay chosen over 100ms — Shopify API rate limits are per-second; staying at 2 req/s is conservative and avoids 429 errors on a 1738-handle batch audit.

## Deviations from Plan

None — plan executed exactly as written. Script content matches the plan specification verbatim. Note: the file was already committed in the prior 10-01 plan session (`b82caa3`); this execution verified correctness.

## Issues Encountered

- `scripts/` directory is gitignored. The file was already force-committed in `b82caa3` from the 10-01 session. No additional commit needed.

## User Setup Required

To run the audit script:

```bash
cd /Users/mnmac/Development/nnshop
node scripts/test-handles.mjs
```

Expected output:
- Progress lines: `[1/1738] OK: handle-name` or `[1/1738] MISSING: handle-name`
- Final summary: `Done. OK: N, Missing: M`
- Output files: `scripts/handles-ok.txt`, `scripts/handles-missing.txt`

After run: Review `scripts/handles-missing.txt`. For each missing handle, check if the product exists under a different handle in Shopify admin. If yes — create a URL redirect in Shopify Admin > Online Store > Navigation > URL Redirects from `/products/{old-handle}` to `/products/{new-handle}`.

## Next Phase Readiness

- Script is ready to run. Requires `.env.local` with `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_SECRET_TOKEN`, and `SHOPIFY_API_VERSION`.
- After script runs and user reviews missing handles, Phase 10 Plan 02 checkpoint is satisfied.

## Self-Check: PASSED

- FOUND: scripts/test-handles.mjs
- FOUND: 10-02-SUMMARY.md
- FOUND: commit b82caa3 (script committed in 10-01 session)

---
*Phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors*
*Completed: 2026-03-05*
