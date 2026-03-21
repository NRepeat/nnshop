# Phase 13 Context: SEO Redirect Architecture

Source: SEO audit `.planning/seo audit/Повний аудит сайту https___www.miomio.com.ua_.md`

CSV: `.planning/seo audit/03-2026 Додаток до аудиту _ https___www.miomio.com.ua_ - Архітектура URL і редиректів (dev).csv`

## Problem

The site has multi-step redirect chains where a single final destination is reached through 2–4 hops involving 307, 308, and 301 redirects mixed in one chain. This wastes crawl budget and slows indexation.

### Affected URL variants (all should → single 301 → canonical):
- `http://miomio.com.ua` → should go directly to `https://www.miomio.com.ua/uk/woman`
- `https://miomio.com.ua` → same
- `http://www.miomio.com.ua` → same
- URLs with trailing slash vs without should resolve consistently

### Language routing bug:
- `/uk` and `/uk/` → correctly goes to `/uk/woman`
- `/ru` and `/ru/` → **incorrectly** goes to `/uk/woman` instead of `/ru/woman`

The redirect logic is in `proxy.ts` at the project root (handles i18n routing) and potentially `next.config.ts` (Sanity-managed redirects).

## What to Fix

1. Audit the redirect chain for all variants in the CSV. Trace through `proxy.ts` and middleware to find where each hop occurs.
2. Collapse multi-hop chains into a single 301 where possible. No 307 (temporary) should be used for permanent structural redirects.
3. Fix `/ru` → `/ru/woman` routing (currently it resolves to `/uk/woman`).
4. Ensure http→https and www/non-www normalization happens in a single step (ideally at Vercel/CDN level rather than app middleware).

## Key Files
- `proxy.ts` (root) — main routing logic
- `next.config.ts` — Sanity-based redirects loaded at build time
- Vercel project settings — may handle http→https and www redirect more efficiently

## Success Criteria
- [ ] All non-canonical domain variants reach final destination in ≤ 1 hop (301)
- [ ] `/ru` and `/ru/` redirect to `/ru/woman`
- [ ] `/uk` and `/uk/` redirect to `/uk/woman`
- [ ] No 307 redirects used in permanent structural routing
- [ ] Verified with redirect chain checker (e.g. httpstatus.io or Screaming Frog)
