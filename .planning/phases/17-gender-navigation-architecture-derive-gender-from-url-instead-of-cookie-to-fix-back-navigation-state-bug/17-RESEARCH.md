# Phase 17: Gender Navigation Architecture - Research

**Researched:** 2024-03-24
**Domain:** Gender State Management & Navigation
**Confidence:** HIGH

## Summary

The current architecture relies on a `gender` cookie to track whether the user is browsing the "man" or "woman" version of the store. This state is frequently out of sync with the URL during back-navigation because the browser's bfcache restores the page state without re-running middleware or cookie-check effects.

**Primary recommendation:** Eliminate the `gender` cookie entirely. Every component (Server and Client) must derive gender from the URL path segment (e.g., `/[locale]/[gender]/...`) or from props passed down from the layout.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace cookie-based gender state with URL-derived gender.
- Gender should be read directly from the URL segment (`params.gender`).
- Remove cookie writes on gender switch.

### the agent's Discretion
- Implementation details of how to pass gender to deeply nested client components (props vs. `useParams`).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Framework | App Router provides `params` to layouts and pages. |
| next-intl | 3.x | I18n & Routing | Handles locale-based routing which is intertwined with gender segments. |

## Architecture Patterns

### Current Cookie-Dependent Flow
1. **Middleware (`proxy.ts`)**: Detects gender from URL or cookie. Sets `x-gender` header for server components and updates the `gender` cookie.
2. **Switcher (`NavButton.tsx`)**: On click, sets `document.cookie` and pushes the new URL.
3. **Consumption**: Components like `Navigation.tsx`, `ProductView.tsx`, and `LogoLink.tsx` call `cookies().get('gender')` or read `x-gender` header.

### Recommended URL-First Flow
1. **Middleware**: Stop setting/reading `gender` cookie. Only ensure URL structure is correct (e.g., redirect `/uk` to `/uk/woman`).
2. **Layouts**: Every layout in `[gender]` segment receives `params.gender`. Pass this down as a prop to widgets.
3. **Client Components**: Use `useParams()` from `next/navigation` to get the current gender segment.
4. **Switcher**: Just a `Link` to the alternative gender path. No cookie logic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gender Detection | Custom state sync | `useParams()` / `params` | URL is the single source of truth; Next.js handles this natively. |
| Navigation | `window.location` | `next-intl/navigation` | Preserves locale and handles relative paths correctly. |

## Common Pitfalls

### Pitfall 1: Middleware Loops
**What goes wrong:** Redirecting to `/uk/woman` when no gender is present, but the redirect doesn't account for other system paths (e.g., `/api`).
**How to avoid:** Use the existing `reservedSystemPaths` check in `proxy.ts`.

### Pitfall 2: Client-Side Stale State
**What goes wrong:** Client components using a local `useState` for gender that doesn't update when the URL changes via back-button.
**How to avoid:** Always use `useParams()` or reactive props.

## Code Examples

### Reading Gender in Server Component
```typescript
// src/app/[locale]/[gender]/layout.tsx
export default async function GenderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  return <div data-gender={gender}>{children}</div>;
}
```

### Reading Gender in Client Component
```typescript
'use client';
import { useParams } from 'next/navigation';

export function MyComponent() {
  const params = useParams();
  const gender = params.gender; // 'man' or 'woman'
  // ...
}
```

## Open Questions

1. **Brand Pages**: Brand URLs currently use a `_gender` search param in some cases (`/brand/slug?_gender=man`). Should these be moved to a segment like `/uk/man/brand/slug`?
   - *Recommendation:* Keep as is for now but ensure they also use URL params exclusively, not cookies.

2. **Root Redirects**: If a user hits the homepage `/uk`, where should they go?
   - *Recommendation:* Existing middleware redirects to `/uk/woman` by default. This should remain but without setting a cookie.

## Sources

### Primary (HIGH confidence)
- `proxy.ts`: Contains the main gender detection and cookie setting logic.
- `src/features/header/navigation/ui/NavButton.tsx`: The actual gender switcher implementation.
- `src/widgets/product-view/ui/ProductView.tsx`: Example of a component reading gender from cookies.
