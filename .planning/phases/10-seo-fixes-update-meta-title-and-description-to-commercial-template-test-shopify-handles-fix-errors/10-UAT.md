---
status: testing
phase: 10-seo-fixes-update-meta-title-and-description-to-commercial-template-test-shopify-handles-fix-errors
source: [10-01-SUMMARY.md, 10-02-SUMMARY.md]
started: 2026-03-05T10:00:00Z
updated: 2026-03-05T10:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Product page meta title format
expected: |
  Open a product page (e.g. /uk/product/some-slug) and check the browser tab title or view-source.
  The <title> tag should read: {productType} {vendor} {title} | MioMio
  Example: "Черевики Bronx Women Ankle Boot | MioMio"
  (productType and vendor may be omitted if blank — e.g. if no productType it would be just "{vendor} {title} | MioMio")
awaiting: user response

## Tests

### 1. Product page meta title format
expected: Browser tab / page source <title> shows "{productType} {vendor} {title} | MioMio" — commercial title with type+vendor prefix and site suffix
result: [pending]

### 2. Product page meta description (commercial, not body copy)
expected: Viewing page source on a product page, the <meta name="description"> should show a fixed commercial description (e.g. "Купити {productType} {vendor} {title} в інтернет-магазині MioMio...") — NOT the raw Shopify product body HTML or first paragraph of description
result: [pending]

### 3. Collection page meta title (uk locale)
expected: On a collection page in Ukrainian (/uk/...), browser tab shows "Купити {collectionTitle} | MioMio" — e.g. "Купити Черевики | MioMio"
result: [pending]

### 4. Collection page meta title (ru locale)
expected: On a collection page in Russian (/ru/...), browser tab shows "Купить {collectionTitle} | MioMio" — e.g. "Купить Ботинки | MioMio"
result: [pending]

### 5. Brand page meta title
expected: On a brand page (/uk/brand/some-brand), browser tab shows "{BrandName} — купити онлайн | MioMio" — e.g. "Bronx — купити онлайн | MioMio"
result: [pending]

### 6. Brand page loads without error
expected: Navigating to a valid brand page (e.g. /uk/brand/bronx) renders the page normally — no 404, no error page. The null guard fix (checking collection.collection instead of collection) should prevent crashes for valid brands.
result: [pending]

### 7. Handle audit script syntax check
expected: Running `node --check scripts/test-handles.mjs` (or `node scripts/test-handles.mjs --help`) completes without syntax errors or missing module errors. The script exists at scripts/test-handles.mjs.
result: [pending]

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
