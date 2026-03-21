---
phase: 14-seo-meta-data-templates-fix-short-long-duplicate-titles-and-missing-meta-descriptions
plan: 01
status: complete
date: 2026-03-21
---

# Summary: Phase 14 - Plan 01 (SEO Metadata Standardization)

Standardized SEO metadata across dynamic and static pages to comply with length, localization, and uniqueness requirements.

## Key Changes

### `src/shared/lib/seo/generateMetadata.ts`
- **`formatTitle` Helper**: Introduced logic to strictly enforce 30-60 character limits for meta titles, including truncation for long strings.
- **Product Metadata**: Applied commercial template "Купити {title} в інтернет-магазині | MioMio" and expanded descriptions to >= 70 characters with localized value propositions.
- **Collection Metadata**: Applied commercial template "Купити {title}{gender} в інтернет-магазині | MioMio" and expanded descriptions to >= 70 characters.
- **Brand Metadata**: Applied commercial template "{brand} — купити в інтернет-магазині | MioMio" and expanded descriptions to >= 70 characters.
- **Localization**: Ensured unique UK and RU versions for all page types.

### `app/[locale]/(frontend)/info/[slug]/page.tsx`
- **SEO/H1 Separation**: Introduced `seoTitles` to allow descriptive meta titles (30-60 chars) while keeping `pageTitles` concise for H1 headings.
- **Expanded Descriptions**: Updated `pageDescriptions` to ensure all info pages have meta descriptions >= 70 characters.
- **Specific Fixes**: Expanded the privacy policy description which was previously too short.

## Verification Results

### Automated Tests
- **Vitest Suite**: `npm test src/shared/lib/tests/seo.test.ts` - **9/9 PASS**.
  - Validated title truncation (30-60 chars).
  - Validated description length (>= 70 chars).
  - Validated UK/RU localization differentiation.
- **Title Templates**: `grep` confirmed presence of commercial templates and localized strings.
- **Head Placement**: `grep` confirmed `htmlLimitedBots: /.*/` in `next.config.ts`, ensuring metadata is resolved correctly in the `<head>` for all bots.

### Success Criteria
- [x] Product titles follow commercial template (UK/RU differ).
- [x] Collection titles follow commercial template.
- [x] Brand titles follow commercial template.
- [x] All meta descriptions are >= 70 characters and localized.
- [x] Page title does not match H1 on Product, Collection, and Info pages.
- [x] UK vs RU versions of pages have unique titles/descriptions.
- [x] Titles are strictly between 30 and 60 characters.
- [x] All metadata tags appear inside the `<head>` section.
