# Phase 16 Context: SEO Image Alt Text

Source: SEO audit `.planning/seo audit/Повний аудит сайту https___www.miomio.com.ua_.md`

## Problem
Many images across the site have empty or missing `alt` attributes. This:
- Loses SEO signal from Google Images
- Fails accessibility (screen readers)
- Reduces page relevance signals

Note: The 1500+ oversized images (>100KB) are Shopify CDN product images — **cannot optimize from Next.js code**. Skip image size optimization. This phase is **alt text only**.

## What to Fix

### Product images
Product images are fetched from Shopify and rendered via the `<Image>` component. The alt text should use:
- Product title (already available from Shopify product data)
- Variant info if applicable (color, material)
- Example: `alt="Чорні шкіряні черевики AGL жіночі"`

### Sanity content images
Blog posts, hero sections, CMS pages may have Sanity image fields. Sanity images support `alt` field in the schema. Check if:
1. Sanity image schemas include an `alt` field
2. The GROQ queries fetch the `alt` field
3. The components pass `alt` to `<Image>`

### Category/collection images
If collection pages show a banner or cover image, ensure alt uses the collection name.

### Brand logo images
Brand logos should have alt = brand name.

### Decorative images
Pure decorative images (backgrounds, dividers) should have `alt=""` explicitly.

## Key Files to Check
- Product image rendering: search for `<Image` in product components
- Sanity image blocks: check `image` schema fields for `alt` field presence
- Any `alt=""` or `alt={undefined}` patterns in product/collection templates

## Success Criteria
- [ ] All product images have alt text using product title + key descriptor
- [ ] Sanity image schemas include `alt` field (or images are given alt from surrounding context)
- [ ] GROQ queries fetch `alt` from Sanity image objects
- [ ] No `<Image>` component renders without an `alt` attribute
- [ ] Decorative images explicitly have `alt=""`
