# Phase 9: ФРОНТ - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Frontend fixes and features: remove delivery from checkout, fix Nova Poshta geolocation widget, order status badge colors in personal cabinet, cancelled order status update, show cart on add-to-cart, quick order default country code, related products by same SKU, discount application, phone number update + Viber icon, navigation menu, brand logos (GHOUD, AGL), test "стежити за ціною" feature.

</domain>

<decisions>
## Implementation Decisions

### Checkout
- Remove delivery/shipping selection step or section from checkout entirely

### Nova Poshta widget
- Check and fix the NP geolocation widget — it should function correctly (specific bug to verify in code)

### Order status badges (personal cabinet)
- "Оброблено" → green badge
- "Скасовано" → red badge
- "Відмова від отримання" → red badge
- "Отменен" / "Скасовано" status update logic — ensure cancellation status is handled correctly

### Cart behavior on add
- When a product is added to cart, display/open the cart (cart sheet or drawer)

### Quick order form
- Add default country code (+38 or UA) to the phone field by default

### Related products
- Link related products by matching SKU — products with the same SKU slug are shown as related

### Discount
- Apply discount code to order — needs discount input field in checkout or order flow

### Contact info
- Phone number: change to 097 217 92 92
- Add Viber icon/link next to the phone number

### Navigation menu
- Update navigation menu (exact changes to be determined from current CMS/code state)

### Brand logos
- Add logos for brands GHOUD and AGL (in Sanity CMS brand/collection schema or dedicated brands section)

### Price tracking test
- Test the "стежити за ціною" (watch price / price alert) feature — verify it works end-to-end

### Claude's Discretion
- Cart display implementation detail: auto-open sheet vs trigger — use existing cart sheet open mechanism
- Navigation menu exact changes: investigate current state and apply needed fixes
- Viber icon: use existing Viber icon pattern from AnnouncementBar if available, otherwise add inline SVG
- Brand logo display location: check existing brand/isBrand collection structure from Phase quick task

</decisions>

<specifics>
## Specific Ideas

- Phone: 097 217 92 92 (replace existing phone number across header/footer/contact)
- Brand logos specifically for GHOUD and AGL (these are brands already in Shopify collections with isBrand flag)
- Related products matching: same `sku` field on product variants

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 09-sku-097-217-92-92-ghoud-agl*
*Context gathered: 2026-03-04*
