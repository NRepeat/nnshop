# Phase 15 UAT: SEO Schema Markup

## Objective
Validate that all implemented SEO schemas (Organization, WebSite, ItemList, WebPage, Product) are correctly rendered in the HTML source of their respective pages and contain accurate, enriched data.

## Implementation Details
- Organization schema in global layout (all pages)
- WebSite schema with SearchAction in global layout
- ItemList schema in CollectionGrid
- WebPage schema in Info pages
- Refined Product schema with shipping and return policies

## Test Cases

| ID | Test Case | Expected Result | Status | Feedback |
|----|-----------|-----------------|--------|----------|
| 1 | Organization Schema | Contains phone +380972179292, info@miomio.com.ua, and sameAs links | passed | Verified in home page source |
| 2 | WebSite SearchAction | SearchAction target template is correct for locale | passed | Verified in home page source |
| 3 | ItemList Schema | Category pages list products with position and URL | passed | Verified in collection page source |
| 4 | WebPage Schema | Info pages contain WebPage type with title/description | passed | Verified in info page source |
| 5 | Product Policies | Product schema includes returnPolicy (14 days) and free shipping details | passed | Verified in product page source |

## Verdicts
- [x] Passed
- [ ] Failed
- [ ] Blocked
