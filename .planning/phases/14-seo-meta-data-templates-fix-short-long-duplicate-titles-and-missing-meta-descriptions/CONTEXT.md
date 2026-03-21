# Phase 14 Context: SEO Meta Data Templates

Source: SEO audit `.planning/seo audit/Повний аудит сайту https___www.miomio.com.ua_.md`

## Issues

### Title Problems
- **Short titles (<30 chars)** — CSV: `03-2026 ... - Title коротший 30 (seo).csv`
- **Long titles (>60 chars)** — CSV: `03-2026 ... - Занадто довгі title (seo).csv`
- **Duplicate titles** — CSV: `03-2026 ... - Дублікати title (seo).csv`
  - UK and RU versions of the same page have identical titles (no language differentiation)
- **Title = H1** — titles duplicate H1 verbatim; title should extend/complement H1, not copy it

### Meta Description Problems
- Short descriptions (<70 chars) — many pages
- Duplicate descriptions — same description across multiple pages
- Missing descriptions — some pages have no description at all
- Meta description outside `<head>` — same structural bug as title/canonical

## Where Templates Live
Meta data is generated in `generateMetadata()` functions. Based on Phase 10 work, commercial templates were added to:
- Product pages: `src/app/[locale]/(frontend)/(product)/product/[slug]/`
- Collection pages: `src/app/[locale]/(frontend)/(home)/[gender]/(collection)/[slug]/`
- Brand pages: relevant brand route

The core template file is likely `src/shared/lib/generateMetadata.ts` or similar (check Phase 10 plan `10-01-PLAN.md`).

## What to Fix

### Titles
1. Ensure all page types have a title template that produces ≥30 and ≤60 chars
2. For UK vs RU pages: append language context to differentiate (e.g. add "| Купити в Україні" for uk, "| Купить в Украине" for ru) OR use different keyword phrasing per locale
3. Title should not be a verbatim copy of H1 — add brand, page type, or location context

### Meta Descriptions
1. All indexed pages must have a unique description ≥70 chars
2. Description template should use product/category name + key commercial details (free delivery, return policy, etc.)
3. Fix any description rendered outside `<head>` (same root cause as title outside head bug from Phase 12)

## Success Criteria
- [ ] No indexed page has title shorter than 30 chars
- [ ] No indexed page has title longer than 60 chars
- [ ] UK and RU versions of same page have different titles
- [ ] No indexed page has title identical to its H1
- [ ] All indexed pages have a meta description ≥70 chars
- [ ] No duplicate descriptions between indexed pages
- [ ] Meta description always rendered inside `<head>`
