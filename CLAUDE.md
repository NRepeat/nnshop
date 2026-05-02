# nnshop

Next.js 15 storefront for italishop. Reads Shopify Storefront API, renders product/collection pages, JSON-LD SEO, locale routing (uk/ru), checkout flow.

## Sister project: backend

Shopify Remix backend lives at `/Users/mnmac/Development/itali-shop-app`. Owns KeyCRM order sync, eSputnik emails, Google Merchant feed, NovaPay/NovaPoshta, product sync, webhook publisher for cache revalidation.

When changing product/availability/pricing/SEO logic, check sister repo first — feed and storefront must stay aligned or Google Merchant flags mismatches.

Known cross-repo invariants:
- **Availability**: storefront JSON-LD (`src/shared/lib/seo/jsonld/product.ts`) and feed (`itali-shop-app/app/service/google-merchant/*`) must produce same value. Currently both use `availableForSale` only (no qty check). Storefront emits product-level — if per-variant accuracy needed, switch to per-variant Offer array.
- **Discount**: `znizka` metafield drives sale price in both feed and ProductCardSPP.
- **Revalidation**: Shopify webhooks from itali-shop-app invalidate Next.js cache here.
