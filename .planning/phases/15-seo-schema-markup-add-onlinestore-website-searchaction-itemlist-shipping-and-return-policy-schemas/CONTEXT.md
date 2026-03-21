# Phase 15 Context: SEO Schema Markup Expansion

Source: SEO audit `.planning/seo audit/Повний аудит сайту https___www.miomio.com.ua_.md`

## Current State
The site already has basic schema markup:
- `Product` + `Offer` + `Brand` — on product pages
- `BreadcrumbList` + `ListItem` — on category/product pages

## What to Add

### 1. Site-level schemas (add to root layout or home page)
- **`Organization` / `OnlineStore`**: name, logo URL, contactPoint, sameAs (links to social profiles)
- **`WebSite` + `SearchAction`**: enables Google sitelinks search box in SERP; requires the site's internal search URL pattern

```json
{
  "@type": "WebSite",
  "url": "https://www.miomio.com.ua/",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.miomio.com.ua/uk/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 2. Product page extensions
- **`MerchantReturnPolicy`** or **`ReturnPolicy`**: return window, return method (link to Sanity return policy page)
- **`OfferShippingDetails`** / **`ShippingDetails`**: shipping service, delivery time estimate, shipping destination (UA)

### 3. Collection/category pages
- **`ItemList`**: wraps the list of products shown on the page so Google understands this is a product listing page, not a text page

```json
{
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://..." },
    ...
  ]
}
```

### 4. Key page types
- **`WebPage`** on static pages (about, delivery, returns, contacts): helps Google classify page purpose

## Key Files
- Look at where existing schema is rendered (search for `application/ld+json` in the codebase)
- Likely in product page template and/or a shared `JsonLd` component
- Site-level schemas should go in `app/[locale]/layout.tsx` or a dedicated `<SiteSchemas>` component

## Success Criteria
- [ ] `Organization`/`OnlineStore` schema present on all pages (via layout)
- [ ] `WebSite` + `SearchAction` schema present (verify in Google Rich Results Test)
- [ ] Product pages include `MerchantReturnPolicy` and `OfferShippingDetails`
- [ ] Collection pages include `ItemList` with product URLs
- [ ] Static pages include `WebPage` schema
- [ ] All schemas validate without errors in Google Rich Results Test
