<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into nnshop. Ten new business events were instrumented across 9 files, covering the full purchase funnel (add to cart → checkout → payment), user engagement actions (search, favorites, quick order, price alerts, newsletter), and a churn signal (sign out). All new events use `posthog-js/react`'s `usePostHog()` hook on the client and the existing `captureServerEvent` helper on the server, consistent with the codebase's existing patterns. Environment variables (`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`) were written to `.env.local`.

| Event | Description | File |
|---|---|---|
| `checkout_started` | User clicks checkout from the cart drawer | `src/features/header/cart/ui/CreateOrderButton.tsx` |
| `search_submitted` | User submits a search query | `src/features/header/search/ui/search-client.tsx` |
| `newsletter_subscribed` | User signs up for the newsletter in the footer | `src/widgets/footer/ui/FooterNewsletterForm.tsx` |
| `payment_provider_selected` | User selects a payment provider during checkout | `src/features/checkout/payment/ui/PaymentProviderButton.tsx` |
| `price_alert_subscribed` | User subscribes to price change alerts for a product | `src/features/product/ui/PriceSubscribeModal.tsx` |
| `quick_order_opened` | User opens the quick order modal on a product page | `src/widgets/product-view/ui/ProductInfo.tsx` |
| `product_favorited` | User adds a product to favorites (server action) | `src/features/product/api/toggle-favorite.ts` |
| `product_unfavorited` | User removes a product from favorites (server action) | `src/features/product/api/toggle-favorite.ts` |
| `payment_completed` | LiqPay webhook confirms a successful payment | `app/api/liqpay/callback/route.ts` |
| `sign_out` | User signs out (also calls `posthog.reset()`) | `src/features/header/account/ui/SignOutButton.tsx` |

Previously instrumented events (`add_to_cart`, `remove_from_cart`, `$pageview`) were left intact.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/335373/dashboard/1341564
- **Purchase Conversion Funnel** (add_to_cart → checkout_started → payment_completed): https://us.posthog.com/project/335373/insights/E6tYEpzr
- **Cart Activity (Adds vs Removes)**: https://us.posthog.com/project/335373/insights/ikB9c5EM
- **Search & Quick Order Usage**: https://us.posthog.com/project/335373/insights/a7SDfwie
- **Product Favorites Activity**: https://us.posthog.com/project/335373/insights/8K8EhjIv
- **Engagement Events (Newsletter, Price Alerts, Sign Outs)**: https://us.posthog.com/project/335373/insights/7F0TPROZ

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
