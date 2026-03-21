# Phase 12 Context: SEO Technical Bugs

Source: SEO audit `.planning/seo audit/Повний аудит сайту https___www.miomio.com.ua_.md`

## Issues to Fix

### 1. Repetitive Path URLs Return 200 (should be 404)
CSV: `.planning/seo audit/03-2026 Додаток до аудиту _ https___www.miomio.com.ua_ - Repetitive path (dev).csv`

URLs like `/uk/woman/woman` and `/ru/woman/woman` return 200 OK with noindex instead of 404.
Any URL with a repeated path segment (e.g. `/woman/woman`, `/man/man`) is not a valid page.
The fix: return 404 for all such URLs. Check breadcrumb generation, canonical logic, and collection templates to find what generates these links.

### 2. Search Pages Not Properly Blocked from Indexation
Current robots.txt blocks `/search`, `/uk/search`, `/ru/search` but does NOT block `?q=` pattern. Some search URLs (e.g. `/uk/search?q=...`) return 200 and are marked indexable.

Fix:
- Add `<meta name="robots" content="noindex, follow">` to all search page templates
- Update robots.txt to add: `Disallow: /*?q=`
- Verify no search URLs appear in any sitemap

### 3. Title Tag Outside `<head>` Section
CSV: `.planning/seo audit/03-2026 Додаток до аудиту _ https___www.miomio.com.ua_ - Title поза секцією head (dev).csv`

Screaming Frog detected `<title>` tags rendered outside the `<head>` section on some pages. This is a Next.js rendering bug — likely from a component rendering a `<title>` in its JSX body instead of using `generateMetadata`. Find affected templates and fix.

### 4. Canonical Tag Outside `<head>` Section
CSV: `.planning/seo audit/03-2026 Додаток до аудиту _ https___www.miomio.com.ua_ - Canonical поза секцією head (dev).csv`

Same class of bug as title — `<link rel="canonical">` rendered outside `<head>`. This makes the canonical signal unreliable. Find where canonical is being rendered in JSX body and move to `generateMetadata` / `alternates.canonical`.

## Success Criteria
- [ ] No URL with repeated path segment (e.g. `/woman/woman`) returns 200; all return 404
- [ ] All search page templates have `noindex, follow` in meta robots
- [ ] robots.txt includes `Disallow: /*?q=`
- [ ] No search URLs appear in any sitemap output
- [ ] `<title>` and `<link rel="canonical">` only appear inside `<head>` on all pages (verified with view-source)
