# Phase 16: SEO Image Alt Text - Research

**Researched:** 2024-03-21
**Domain:** SEO / Accessibility / Image Optimization
**Confidence:** HIGH

## Summary
The investigation into Phase 16 reveals that while the infrastructure for alt text exists in many parts of the codebase, it is inconsistently implemented across Shopify-sourced product images and Sanity-managed content. 

Key findings:
- **Shopify Products:** The `Gallery.tsx` component currently uses `image.altText || ''`. If Shopify data lacks alt text, it falls back to an empty string, which is suboptimal for SEO.
- **Sanity CMS:** Some schemas (like `postType` and `blockContent`) already include `alt` fields, but others (like `heroType`) are missing them.
- **Next.js Image Usage:** Over 20 components use `<Image />` and require an audit to ensure `alt` props are meaningfully populated rather than defaulted to empty strings or placeholders.

**Primary recommendation:** Implement a hierarchical fallback for product images (Product Title > Variant Title > Brand) and enforce `alt` fields in all Sanity image objects via schema validation.

## User Constraints (from CONTEXT.md)
### Locked Decisions
- Skip image size optimization (1500+ oversized images are Shopify CDN managed). This phase is **alt text only**.
- Product images should use Product title + Variant info (e.g., `alt="Чорні шкіряні черевики AGL жіночі"`).
- Decorative images must explicitly use `alt=""`.

### the agent's Discretion
- Determine how to handle missing alt text in Sanity (schema vs. context).
- Identify which components need `alt` attribute updates.

## Standard Stack
### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.0.0-canary | Image Rendering | Native `<Image />` component handles lazy loading and optimization. |
| Sanity | v4 | Content Management | Flexible schema allows for custom `alt` fields. |
| Shopify Storefront API | Latest | Product Data | Source of truth for product images and titles. |

## Architecture Patterns
### Recommended Pattern: Descriptive Alt Generation
For product images where `altText` is missing from Shopify:
```typescript
const altText = image.altText || `${product.title} ${variant.title || ''} ${brand.name}`.trim();
```

### Sanity Schema Enforcement
Update all image fields to include an `alt` field with validation:
```typescript
defineField({
  name: 'alt',
  type: 'string',
  title: 'Alt Text',
  validation: Rule => Rule.required().warning('Missing alt text hurts SEO.')
})
```

## Don't Hand-Roll
| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image Processing | Custom resizing/cropping | Shopify CDN / Sanity Image Pipeline | Built-in tools are faster and handle edge cases (WebP conversion, etc.). |

## Common Pitfalls
- **Redundant Alt Text:** Avoid "Image of..." or "Photo of...". Screen readers already announce images as such.
- **Missing GROQ Projections:** Adding a field to Sanity schema without updating the GROQ query results in `undefined` at runtime.
- **Empty Alt vs Missing Alt:** `alt=""` tells screen readers to skip decorative images. Missing `alt` causes screen readers to read the file URL, which is a poor experience.

## Open Questions
1. **Fallback Language:** Since the site is multi-lingual (`uk`, `ru`), should the fallback alt text be localized? 
   - *Recommendation:* Yes, use the current `locale` and `messages.json` to construct the fallback.
2. **Bulk Update:** Should we backfill Shopify `altText` via Admin API?
   - *Recommendation:* Out of scope for this code-focused phase; handle via frontend fallbacks.

## Validation Architecture
### Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| ALT-01 | Product images have non-empty alt | E2E | `npm run test:e2e` (Check `img[alt]` presence) |
| ALT-02 | Sanity images fetch `alt` field | Integration | Verify GROQ results in logs |

---
**Note:** This research was finalized based on an interrupted investigation. All critical schema locations and primary rendering components were identified.
