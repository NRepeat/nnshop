# Phase 11: Analyze project and prepare for production — integrate PostHog monitoring - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Production readiness audit of the codebase (security + code quality) with direct fixes applied, plus PostHog analytics/monitoring integration. Deployment target is Vercel. Phase does NOT include performance optimization, search, or new features.

</domain>

<decisions>
## Implementation Decisions

### Audit output
- Fix issues directly — no separate report file. Findings get fixed inline.
- Audit covers: Security + Code quality + Environment variables
- Target: fix everything found, not just production-critical items

### Security audit scope
- Scan for exposed secrets / env vars that should not be NEXT_PUBLIC_
- Check server actions for missing auth guards
- Review XSS and injection risks at system boundaries (user input, external APIs)
- Verify Shopify Storefront API token is not exposed to client bundle

### Code quality audit scope
- Remove all console.log / console.error left in production code paths (Phase 1 rule)
- Fix TypeScript `any` casts and `@ts-ignore` / `@ts-expect-error` where avoidable
- Remove dead code, unused imports, TODO comments that are blocking
- Clean up any `// @ts-ignore` patterns introduced during rapid development

### Environment variables audit
- Document all env vars in use across the codebase
- Verify NEXT_PUBLIC_ prefix is only on vars that must be client-accessible
- Confirm no sensitive keys (Shopify Admin token, DB URL, LiqPay private key, Resend API key) are exposed via NEXT_PUBLIC_ or leaked to client bundles

### PostHog events — checkout funnel (primary focus)
- Track the full checkout funnel: product_viewed → add_to_cart → checkout_started → payment_initiated → order_placed
- Cart abandonment is tracked via funnel drop-off analysis between add_to_cart and order_placed (no separate event needed — PostHog funnel reports handle this)

### PostHog events — cart interactions
- `add_to_cart` event: product id, variant id, price, quantity
- `remove_from_cart` event: product id, variant id

### PostHog user identification
- Call `posthog.identify(userId, { email })` when user signs in (better-auth session)
- Anonymous events before sign-in merge automatically on identify
- On sign-out call `posthog.reset()`

### Error tracking
- PostHog exception autocapture enabled (client-side only)
- Sentry is NOT added in this phase — PostHog exception capture is sufficient to start
- Previous Phase 1 decision to use Sentry is superseded by this decision

### Production checklist — build
- `npm run build` must pass with zero TypeScript errors
- ESLint must pass clean (`npm run lint`)
- `prisma generate` must run cleanly as part of the build (already in build script)

### Production checklist — config
- `next.config.ts` review: security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), image domains, CSP if feasible
- Verify `robots.txt` exists and is correct for production domain (allow crawlers, block /studio, /api, /uk/auth)
- Verify `sitemap.xml` is generated and accessible at /sitemap.xml

### Deployment target
- Vercel — env vars managed in Vercel dashboard
- No changes to server infrastructure in this phase

### Claude's Discretion
- Exact security header values (Claude selects safe defaults compatible with Shopify embeds and LiqPay iframe)
- robots.txt exact rules (Claude derives from route structure)
- Whether to add a `.env.example` file documenting all required vars

</decisions>

<specifics>
## Specific Ideas

- PostHog free tier (1M events/month) is the target — no paid plan needed to start
- Exception autocapture should be enabled in the PostHog JS config (`autocapture: true`, `capture_exceptions: true`)
- PostHog should be initialized in a client-side Provider component (wrapping the app), not in `layout.tsx` directly, to avoid SSR issues

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-analyze-project-and-prepare-for-production-integrate-posthog-monitoring*
*Context gathered: 2026-03-08*
