# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- PascalCase for React components: `ProductCard.tsx`, `OrderDetails.tsx`, `CheckoutStepper.tsx`
- camelCase for utilities and API functions: `resolveLink.ts`, `getCollectionProducts.ts`, `create-customer.ts`
- kebab-case for utility files and smaller components: `use-fav-store.ts`, `user-nav.tsx`, `search-session.tsx`
- Files with `'use client'` directive typically named with `Client` suffix or lowercase: `ClientGrid.tsx`, `NavigationTriggerClient.tsx`, `search-client.tsx`
- Server action files often have lowercase names: `action.ts`
- Index files: `index.ts` for barrel exports from feature/entity slices

**Functions:**
- camelCase for all function names
- Async functions return Promises: `async function getCart(...): Promise<...>`
- Hook functions start with `use`: `useDotButton`, `usePathname`, `useCallback`
- Factory/creator functions: `createOrder`, `createShopifyCustomer`, `createLiqPay`
- Handler functions use `on` or `handle` prefix: `onDepartmentSelect`, `onDotButtonClick`, `onSignInSubmit`
- Fetch/retrieval functions use `get` prefix: `getCart`, `getUser`, `getCollection`, `getAvailableLocales`

**Variables:**
- camelCase for all variables and constants
- UPPER_SNAKE_CASE for module-level constants: `CART_TAGS`, `ORDER_CREATE_MUTATION`, `HEADER_QUERY`
- Boolean variables often prefixed with `is` or `has`: `isFav`, `preferViber`, `applicable`, `hasSymbols`
- State-related objects with descriptive names: `selectedVariant`, `selectedIndex`, `selectedDelivery`
- Unused/spread variables with underscore: Standard destructuring patterns

**Types & Interfaces:**
- PascalCase for type and interface names: `SelectedDepartment`, `NovaPoshtaButtonProps`, `OrderResult`, `PaymentInfo`
- Suffix conventions:
  - Props types end with `Props`: `NovaPoshtaButtonProps`, `ContainerHeaderProps`
  - Schema validation types inferred with `z.infer`: `ContactInfo = z.infer<typeof contactInfoSchema>`
  - Result types use `Result` suffix: `OrderResult`
  - Query types use `Query` suffix: `GetCartQuery`

**Exports:**
- Named exports for reusable components and utilities
- Barrel file pattern in `index.ts` files: `export * from './ui/Feature'` (from `src/entities/feature/index.ts`)
- Default exports for page components (Next.js convention)

## Code Style

**Formatting:**
- Tool: Prettier v3.6.2
- Key settings:
  - Single quotes for strings: `'use client'`
  - Trailing commas for multi-line: `array,` (trailing comma style: "all")
  - Print width: 80 characters
  - Tab width: 2 spaces
  - Semicolons: Always included
  - Arrow function parens: Always: `(arg) => {}`
  - Bracket spacing: True: `{ key: value }`
  - JSX single quotes: False (use double quotes in JSX)

**Linting:**
- Tool: ESLint v9.39.1 with flat config (`eslint.config.mjs`)
- Parser: TypeScript ESLint parser
- Extends:
  - Next.js recommended rules (@next/eslint-plugin-next)
  - Next.js Core Web Vitals rules
  - TypeScript ESLint recommended rules
- Custom rule disables:
  - `@typescript-eslint/no-explicit-any`: off (allows use of `any` type)
  - `@typescript-eslint/ban-ts-comment`: off (allows `@ts-ignore` comments)
- Plugins active:
  - `@typescript-eslint` for TS-specific linting
  - `react-hooks` for Hook Rules of Hooks enforcement
  - `@next/next` for Next.js specific rules
- ESLint prettier integration: ESLint and Prettier configured together (eslint-config-prettier)
- Ignored paths: `node_modules/`, `.next/`, `out/`, `build/`, `next-env.d.ts`, `./src/shared/lib/shopify/types`

**TypeScript:**
- Strict mode: Enabled
- Target: ES2017
- JSX mode: `preserve` (Next.js handles JSX transformation)
- Import resolution: bundler mode for monorepo/turbopack support
- Path aliases configured in `tsconfig.paths.json`:
  - `@entities/*` → `src/entities/*`
  - `@features/*` → `src/features/*`
  - `@widgets/*` → `src/widgets/*`
  - `@shared/*` → `src/shared/*`
  - `@/*` → `src/*`
  - `~/*` → `./*`

## Import Organization

**Order:**
1. External packages: `import React from 'react'`, `import { Button } from '@radix-ui/react-button'`
2. Next.js packages: `import { cookies } from 'next/headers'`, `import Link from 'next/link'`
3. Internal path aliases: `import { ProductCard } from '@entities/product/ui/ProductCard'`
4. Relative imports: `import ContactInfoForm from './ContactInfoForm'`
5. Type imports: `import type { SelectedDepartment } from '../model/types'`

**Path Aliases:**
Use path aliases consistently throughout the codebase:
- `@entities/*` for entity layer imports
- `@features/*` for feature layer imports
- `@widgets/*` for widget/composite component imports
- `@shared/*` for shared utilities, hooks, UI components, types
- `@/` for root `src/` imports (used occasionally)

**Example from `src/features/order/api/create.ts`:**
```typescript
import { getCart } from '@entities/cart/api/get';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';
```

## Error Handling

**Patterns:**
- Try-catch blocks for async operations and user-facing actions
- Explicit error state checking: `if (result.error) { ... }`
- Throw custom errors with descriptive messages: `throw new Error('Collection not found')`
- Error instance checking: `error instanceof Error ? error.message : 'Unknown error'`
- Toast notifications for user errors (Sonner library): `toast.error(message)`
- Console logging for server-side errors: `console.error(message, data)`
- Graceful fallback returns on error (especially in API functions):
  ```typescript
  return {
    success: false,
    errors: [...],
  }
  ```

**Error Response Pattern (Server Actions):**
```typescript
export async function createOrder(...): Promise<{
  success: boolean;
  order?: OrderResult;
  errors?: string[];
}> {
  try {
    // ... operation
    return { success: true, order };
  } catch (error) {
    console.error('Error:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
```

**Client-Side Error Handling:**
```typescript
try {
  const result = await client.signIn.email({...});
  if (result.error) {
    toast.error(result.error.message);
    return;
  }
  toast.success('Welcome back!');
} catch (error) {
  console.error('Sign in error:', error);
  toast.error('An unexpected error occurred');
}
```

## Logging

**Framework:** `console` object (no structured logging library)

**Patterns:**
- `console.log()` for informational logs: `console.log('[createOrder] Order saved:', createdOrder.name)`
- `console.error()` for errors: `console.error('SESSION NOT FOUND')`
- `console.warn()` for warnings: `console.warn('Повідомлення з невідомого джерела:', event.origin)`
- Contextual prefixes in log messages: `[functionName]` format
- Logging validation failures with context:
  ```typescript
  console.error('ADMIN API USER ERRORS:', JSON.stringify(userErrors, null, 2));
  userErrors.forEach((error) => {
    console.error(`Field: ${error.field}, Message: ${error.message}`);
  });
  ```
- All console logging is present in production code (no structured logging)

## Comments

**When to Comment:**
- Explain non-obvious business logic or domain-specific reasoning
- Document workarounds or temporary solutions
- Explain complex conditional logic: `// Try to format using libphonenumber-js first`
- JSDoc-style comments for complex utilities and configuration
- Comments on specific error scenarios or fallback behavior

**JSDoc/TSDoc:**
Used selectively for:
- Utility functions: `/** Cached fetch wrapper that supports Next.js cache tags */`
- Configuration/setup functions: In Sanity schema definitions
- Complex parameter explanations
Not heavily used throughout the codebase - comments are minimal and pragmatic

**Example from `src/shared/lib/locale.ts`:**
```typescript
/**
 * Get all available locales from Sanity
 */
export async function getAvailableLocales(): Promise<SanityLocale[]> {
```

## Function Design

**Size:** Functions are generally concise (40-80 lines for complex API operations, 20-40 for utilities)

**Parameters:**
- Destructured objects for multiple parameters: `{ products, isFav }`
- Optional parameters default to undefined unless specified: `gender?: string`
- Explicit parameter typing with TypeScript

**Return Values:**
- Promise-based returns for async functions
- Structured result objects for API functions: `{ success: boolean; data?: T; errors?: string[] }`
- Typed return values: `Promise<T>`
- Null/undefined for missing data (not throwing on client reads)

**Async Patterns:**
- `'use server'` directive at top of file for Server Actions
- `'use client'` directive for client-side code
- `'use cache'` directive for cache-enabled functions (Next.js experimental)
- Suspense boundaries for async components
- Direct data fetching in Server Components without client-side queries

## Module Design

**Exports:**
- Named exports preferred for utilities and components
- Re-exports from index.ts files for public APIs:
  ```typescript
  // src/entities/hero/index.ts
  export * from './ui/Hero';
  ```
- Default exports for page components (Next.js convention)

**Barrel Files:**
Index files expose component or module groups:
```typescript
// src/features/novaPoshta/index.ts
export * from './model/types';
export * from './ui/NovaPoshtaButton';
```

**File Organization per FSD Pattern:**
- `ui/` - React components
- `api/` - Data fetching, server actions
- `model/` - State stores (Zustand), type definitions
- `schema/` - Zod validation schemas
- `lib/` - Utility functions

## Formatting Consistency

**Spacing:**
- 2-space indentation (configured in tsconfig)
- Blank lines between logical sections
- Consistent spacing around operators and parameters

**Destructuring:**
- Prefer destructuring for imports and function parameters
- Multi-line destructuring for better readability

**Object/Array Literals:**
- Trailing commas on multi-line structures
- Bracket spacing enabled: `{ key: value }`

---

*Convention analysis: 2026-02-23*
