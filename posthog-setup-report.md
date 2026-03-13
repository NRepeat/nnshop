<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into nnshop. Six new events were added across client-side and server-side code, complementing the existing PostHog setup (provider, pageview, and user identification).

## New events added

| Event | Location | Type | Properties |
|---|---|---|---|
| `user_signed_in` | `src/features/auth/ui/action.ts` | client | `method` |
| `user_signed_up` | `src/features/auth/ui/action.ts` | client | `method` |
| `contact_form_submitted` | `src/features/contact/ui/ContactForm.tsx` | client | — |
| `checkout_contact_info_saved` | `src/features/checkout/contact-info/ui/ContactInfoForm.tsx` | client | `$current_url` |
| `checkout_delivery_saved` | `src/features/checkout/delivery/ui/DeliveryForm.tsx` | client | `delivery_method`, `$current_url` |
| `quick_order_placed` (server) | `src/features/product/quick-buy/api/create-quick-order.ts` | server | `order_id`, `order_name`, `product_title`, `variant_id`, `price`, `currency`, `amount` |

## Pre-existing events (unchanged)

| Event | Location |
|---|---|
| `$pageview` | `src/shared/lib/posthog/PostHogPageView.tsx` |
| `checkout_started` | `src/features/checkout/contact-info/ui/ContactInfoForm.tsx` |
| `quick_order_placed` (client) | `src/features/product/quick-buy/ui/QuickBuyModal.tsx` |

## Dashboard

**Analytics basics** — https://us.posthog.com/project/335373/dashboard/1341578

### Insights on the dashboard

- **Checkout Funnel** — 5-step funnel tracking users from `checkout_started` → `checkout_contact_info_saved` → `checkout_delivery_saved` → `payment_initiated` → `order_placed`
- **User Signups & Sign-ins** — daily trend of `user_signed_up` and `user_signed_in`
- **Orders: Add to Cart vs Order Placed vs Quick Orders** — trend comparing `add_to_cart`, `order_placed`, `quick_order_placed`
- **Product Engagement: Favorites & Price Alerts** — trend for `product_favorited` and `price_alert_subscribed`

## Agent skill

Skill used: `integration/nextjs-app-router`
</wizard-report>
