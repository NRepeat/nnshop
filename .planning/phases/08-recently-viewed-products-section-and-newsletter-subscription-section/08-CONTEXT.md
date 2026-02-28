# Phase 8: Recently Viewed Products & Newsletter Subscription - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Two new reusable frontend sections — no Sanity CMS integration for now:

1. **"Нещодавно переглянуті" (Recently Viewed Products)** — horizontal product carousel showing products the current session has viewed. Backed by a new Prisma DB model. Works for both anonymous and authenticated users via better-auth sessions.

2. **Newsletter subscription section** — "Приєднуйтесь до нас і отримайте доступ до закритих розпродажів" with gender radio (Для неї / Для нього), email input, and a dark submit button. Static hardcoded text (no Sanity). Email + gender stored in DB for now (eSputnik integration deferred).

</domain>

<decisions>
## Implementation Decisions

### Recently Viewed — Carousel Display
- Horizontal scrollable carousel using existing `ProductCard` component
- Show up to ~10 most recently viewed products
- Screenshot shows large product cards — likely 2–3 visible at a time on desktop with scroll arrows, full-width on mobile
- Section title: "Нещодавно переглянуті" (matching screenshot exactly)
- **Hide the section entirely when the user has zero recently viewed products** — no placeholder, no skeleton
- Uses same card style as the rest of the site (discount badge, favorite heart, brand name, price with strike-through)

### Recently Viewed — Tracking Rules
- A product is recorded when the user **visits a product page** (not just hover/quick-view)
- If the same product is viewed again, **move it to the front** (update `viewedAt`) rather than duplicate
- Maximum **20 records per session** in DB; UI shows the most recent 10
- Works for **both anonymous (sessionId) and authenticated (userId) users** — session ID from better-auth anonymous session, upgrades to userId on sign-in (merge handled by better-auth's existing anonymous merge)
- Prisma model: `RecentlyViewed` with `sessionId`, `productHandle`, `viewedAt`; Prisma client at `generated/prisma`

### Recently Viewed — Placement
- Appears on **home page** (below hero/carousels) and **product detail page** (below product info / above footer)
- Reusable component so it can be dropped into any page

### Newsletter — Form Behaviour
- Gender radio defaults to **"Для неї"** (for her) on load
- On submit: inline success state replaces the form ("Дякуємо! Ви підписані") — no redirect, no page reload
- Basic validation: email format required; empty email shows inline error
- Duplicate email: treat as success silently (no error shown to user)
- Store `{ email, gender, subscribedAt }` in a new `NewsletterSubscriber` Prisma model

### Newsletter — Placement & Styling
- Full-width section, light background (matching screenshot — off-white/grey)
- Submit button: **black background, white text** (matching screenshot "Підписатися")
- Gender radio uses custom-styled radio inputs matching the screenshot (dark outline on selected)
- Appears on the **home page** — exact position above footer (between last content section and footer)
- Also reusable so it can be used on other pages in future

### Claude's Discretion
- Exact carousel scroll arrow design (left/right nav buttons)
- Loading state for the recently viewed carousel (can use skeleton or suppress during SSR)
- Exact Prisma migration naming
- Server Action file structure for recording viewed products and newsletter signup
- Whether to use `useEffect` client-side trigger for recording views or a server action on page load

</decisions>

<specifics>
## Specific Ideas

- The screenshots show a minimal, clean aesthetic — product cards with large images, small text below
- "Нещодавно переглянуті" heading matches the same style as other section headings (bold, centered or left-aligned)
- Newsletter section from screenshot: centered layout, radio buttons side by side, email input as underline-only (no box border), black "Підписатися" button to the right of the input
- The recently viewed carousel on product page should appear **after** the main product content so it doesn't distract from the primary CTA

</specifics>

<deferred>
## Deferred Ideas

- eSputnik API integration for newsletter signups — add to roadmap backlog (store in DB for now)
- Quick-view modal triggering a recently viewed record — separate decision, defer to future
- Sanity CMS control for newsletter text/heading — deferred (hardcoded for now)
- "You may also like" recommendations section — separate phase

</deferred>

---

*Phase: 08-recently-viewed-products-section-and-newsletter-subscription-section*
*Context gathered: 2026-02-28*
