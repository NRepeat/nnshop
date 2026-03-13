# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Status:** Not configured

**Current State:**
- No test framework installed (Jest, Vitest, etc.)
- No test runner configured
- No test files in the codebase (`*.test.ts`, `*.spec.ts`)
- Package.json has no test script defined
- CLAUDE.md explicitly states: "No test framework is configured"

**Implications:**
- All code is untested
- No automated quality assurance for changes
- No CI/CD testing pipeline in place
- Manual testing only

## Testing Approach Needed

Given the codebase structure and the lack of testing, here's the recommended approach if testing is added:

**Suggested Framework:**
- Vitest for unit/integration tests (modern, fast, Vite-native)
- Playwright or Cypress for E2E testing (Next.js compatible)

**Recommended Setup:**
- Test files co-located with source: `Component.test.tsx` or `Component.spec.ts`
- Separate test utilities directory: `src/shared/test/` for mocks and factories
- Fixtures in `src/shared/test/fixtures/` for mock data

## Test File Organization

**Proposed Location:**
- Unit tests: Co-located with source code
  - `src/entities/product/ui/ProductCard.test.tsx`
  - `src/features/auth/lib/auth.test.ts`
  - `src/shared/lib/validation/phone.test.ts`
- Integration tests: Grouped in feature directories
  - `src/features/checkout/__tests__/checkout-flow.test.ts`
- E2E tests: Separate from source tree
  - `e2e/checkout.spec.ts`
  - `e2e/auth.spec.ts`

**Naming:**
- Test files use `.test.ts` or `.test.tsx` suffix
- Descriptive names matching tested file: `resolveLink.test.ts` for `resolveLink.ts`
- Grouping by feature/entity with meaningful test descriptions

## Proposed Test Structure

Given the FSD architecture and codebase patterns, tests would follow this structure:

**Component Tests (React Testing Library pattern):**
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@entities/product/ui/ProductCard';

describe('ProductCard', () => {
  it('renders product title', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
  });

  it('displays favorite status', () => {
    render(<ProductCard product={mockProduct} isFav={true} />);
    expect(screen.getByRole('button', { name: /favorite/i })).toHaveClass('favorited');
  });
});
```

**Utility Function Tests (Jest-style assertions):**
```typescript
import { resolveLink } from '@features/blocks/split-image/lib/resolveLink';

describe('resolveLink', () => {
  it('returns product path for product link', () => {
    const result = resolveLink({
      _type: 'linkInternal',
      reference: { _type: 'product', slug: 'shoe-x' },
    });
    expect(result).toBe('/product/shoe-x');
  });

  it('returns undefined for null input', () => {
    expect(resolveLink(null)).toBeUndefined();
  });
});
```

**Validation Schema Tests (Zod pattern):**
```typescript
import { contactInfoSchema } from '@features/checkout/schema/contactInfoSchema';

describe('contactInfoSchema', () => {
  it('validates correct contact info', () => {
    const data = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+380501234567',
      countryCode: 'UA',
    };
    const result = contactInfoSchema.parse(data);
    expect(result.name).toBe('John');
  });

  it('rejects missing email', () => {
    const data = { name: 'John', lastName: 'Doe', phone: '+380501234567' };
    expect(() => contactInfoSchema.parse(data)).toThrow();
  });
});
```

**Server Action Tests (Promise-based):**
```typescript
import { createOrder } from '@features/order/api/create';

describe('createOrder', () => {
  it('returns success with order data', async () => {
    const result = await createOrder(mockCheckoutData, 'uk', false);
    expect(result.success).toBe(true);
    expect(result.order).toBeDefined();
  });

  it('returns error when session is missing', async () => {
    const result = await createOrder(null, 'uk', false);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Session not found');
  });
});
```

## Mocking

**Framework:** (Would be) Vitest's vi or Jest mocks

**Patterns to Follow:**

**External API Mocking:**
- Mock Shopify Storefront API responses
  ```typescript
  vi.mock('@shared/lib/shopify/client', () => ({
    storefrontClient: {
      request: vi.fn().mockResolvedValue(mockCartData),
    },
  }));
  ```
- Mock Prisma database calls
  ```typescript
  vi.mock('@shared/lib/prisma', () => ({
    prisma: {
      order: {
        create: vi.fn().mockResolvedValue(mockOrder),
      },
    },
  }));
  ```

**What to Mock:**
- External API clients (Shopify, Sanity)
- Database operations (Prisma)
- HTTP requests
- File system operations (if any)
- Third-party services (Resend, LiqPay)
- Browser APIs in unit tests (`window`, `localStorage`)

**What NOT to Mock:**
- Zod validation schemas (test actual validation)
- Utility functions (test real logic)
- React hooks (render with tests instead)
- Internal business logic (unless testing isolation)

**Mock Data Pattern:**
Would store fixtures in `src/shared/test/fixtures/`:
```typescript
// src/shared/test/fixtures/product.ts
export const mockProduct = {
  id: 'gid://shopify/Product/123',
  title: 'Test Product',
  handle: 'test-product',
  variants: {
    edges: [
      {
        node: {
          id: 'gid://shopify/ProductVariant/456',
          title: 'Default Title',
          priceV2: { amount: '99.99', currencyCode: 'UAH' },
        },
      },
    ],
  },
};
```

## Coverage

**Requirements:** Not currently enforced

**Recommended if Testing Added:**
- Unit tests: 80% coverage target for business logic
- Integration tests: Key user flows
- E2E tests: Critical checkout and auth paths
- No strict enforcement needed, but ~70% overall would be healthy

**Critical Areas to Test:**
1. Checkout flow (`src/features/checkout/`)
   - Form validation (contact info, delivery, payment)
   - Order creation and error states
2. Authentication (`src/features/auth/`)
   - Sign in, sign up flows
   - Token handling
3. Cart operations (`src/entities/cart/`)
   - Add/remove items
   - Discount code application
4. Product filtering and search
5. Payment provider integration

## Test Types

**Unit Tests (Proposed):**
- Scope: Individual functions and components in isolation
- Coverage: Utility functions, validation schemas, small components
- Approach: Test inputs/outputs, error handling
- Example: `resolveLink()` with various link types, `contactInfoSchema` validation

**Integration Tests (Proposed):**
- Scope: Feature-level workflows combining multiple components/functions
- Coverage: Checkout flow, auth flow, cart operations
- Approach: Test user interactions and data flow between layers
- Example: Adding product to cart, completing checkout

**E2E Tests (Proposed):**
- Framework: Playwright or Cypress
- Scope: Full user journeys in browser
- Coverage: Checkout (guest + authenticated), product browsing, order tracking
- Approach: Real browser navigation, interactions, assertions on rendered output

## Common Testing Patterns

**Async Testing (Proposed):**
```typescript
it('fetches cart data', async () => {
  const result = await getCart({ userId: 'user-1', locale: 'uk' });
  expect(result.cart).toBeDefined();
});

it('handles async errors', async () => {
  vi.mocked(storefrontClient.request).mockRejectedValue(new Error('Network error'));
  const result = await getCart({ userId: 'user-1', locale: 'uk' });
  expect(result).toBeNull();
});
```

**Error Testing (Proposed):**
```typescript
it('throws on missing collection', async () => {
  await expect(
    getCollectionProducts({ slug: 'invalid', locale: 'uk' })
  ).rejects.toThrow('Collection not found');
});

it('returns error object for invalid input', async () => {
  const result = await createOrder(null, 'uk', false);
  expect(result.success).toBe(false);
  expect(result.errors).toBeDefined();
});
```

**Form/Hook Testing (Proposed):**
```typescript
it('validates and submits form', async () => {
  const onSubmit = vi.fn();
  const { getByRole } = render(
    <ContactInfoForm onSubmit={onSubmit} />
  );

  const nameInput = getByRole('textbox', { name: /name/i });
  await userEvent.type(nameInput, 'John');

  await userEvent.click(getByRole('button', { name: /submit/i }));
  expect(onSubmit).toHaveBeenCalled();
});
```

## Current Testing Status & Gaps

**Complete Lack of Tests:**
- No unit tests for utility functions
- No validation tests for Zod schemas
- No component render tests
- No API/server action tests
- No E2E tests for critical flows
- No integration tests

**High-Risk Untested Areas:**
1. `src/features/order/api/create.ts` - Critical checkout logic (282 lines)
2. `src/features/checkout/` - Form validation and submission
3. `src/features/auth/` - Authentication flows
4. `src/entities/cart/` - Cart operations
5. Shopify client integrations

**Recommendations if Testing Added:**
- Start with unit tests for validation schemas (quick wins)
- Add API tests for order creation and checkout
- Add integration tests for auth flows
- Add E2E tests for complete checkout journey
- Test error handling paths (currently only logged)

---

*Testing analysis: 2026-02-23*
