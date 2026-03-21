# Phase 17 Context: Gender Navigation Architecture

Source: SEO audit + user confirmation (2026-03-21)

## Problem Description

Two related back-navigation bugs were identified in the SEO audit (marked as "previously found, still present"):

### Bug 1: Gender switch breadcrumb/navigation mismatch
When navigating woman→man→(back), the page shows man's products but the breadcrumb and navigation context shows woman's state. The gender is stored in a cookie. On back navigation, the browser restores the previous page from bfcache/history without triggering a new navigation event, so the cookie is never updated to match the URL.

### Bug 2: Stale headings after back navigation from product page
After navigating: collection page → product page → related products block → (back), stale H1/H2/H3 from other templates appear in the DOM alongside the correct product headings. Multiple H1s on a single page is an SEO signal problem.

## Root Cause
**Gender is stored in a cookie** — this is wrong. Gender is a URL-derived attribute (`/uk/woman/...` vs `/uk/man/...`). On back navigation:
- The URL correctly shows the previous state
- But the cookie hasn't changed (back navigation doesn't re-run navigation effects)
- Components reading gender from the cookie show stale state

## Required Architecture Change

**Replace cookie-based gender state with URL-derived gender.**

The gender should be read directly from the URL segment (`params.gender` in Next.js App Router) — never from a cookie. This is always in sync with the URL, even on back navigation.

Steps:
1. Find where gender cookie is written and read
2. Find all components that consume gender from cookie/store
3. Replace cookie reads with URL params (pass `gender` prop from server components, or use `useParams()` in client components)
4. Remove the cookie write on gender switch
5. Verify breadcrumb, navigation active state, and product grid all derive gender from URL

## Key Files to Investigate
- Search for `gender` in cookie-related code: `document.cookie`, `cookies()`, any Zustand store that holds gender
- Search for `setGender`, `useGender`, or similar hooks
- The gender switcher component (toggles between /woman and /man)
- Breadcrumb component that shows wrong state
- Collection page layout that feeds gender to child components

## SEO Impact
- Back navigation with stale headings creates multiple H1 on one page (SEO flag)
- Breadcrumb showing wrong category confuses Google's understanding of page hierarchy
- Both are "previously found, still present" in the SEO audit — high priority to fix

## Success Criteria
- [ ] Gender is never stored in a cookie; always derived from URL
- [ ] After woman→man navigation, pressing Back shows woman content with woman breadcrumbs
- [ ] After product→related→Back navigation, only one H1 appears in DOM
- [ ] Gender switcher correctly updates URL and all dependent UI without cookie
- [ ] No stale navigation context after any back navigation sequence
