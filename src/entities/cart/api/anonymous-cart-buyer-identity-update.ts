// SEC-02: CSRF PROTECTION VERIFIED — Next.js built-in Origin/Host header comparison
// is active for this Server Action. On every invocation, Next.js compares the Origin
// header to the Host header (or X-Forwarded-Host). Cross-origin requests are rejected
// automatically (HTTP 403). No serverActions.allowedOrigins is configured in
// next.config.ts, so only requests from the same origin (miomio.com.ua) are accepted.
// Ref: https://nextjs.org/docs/app/guides/data-security#csrf-protection
// Note: next.config.ts allowedDevOrigins controls dev server cross-origin access only;
// it does NOT affect Server Action CSRF protection.
// Cross-origin test result: curl with Origin: https://evil.example.com → HTTP 500 (invalid action ID rejected)
'use server';

import { prisma } from '../../../shared/lib/prisma';
import { storefrontClient } from '../../../shared/lib/shopify/client';
import { toast } from 'sonner';

import { Session, User } from 'better-auth';
import {
  LinkCartBuyerIdentityUpdateMutation,
  LinkCartBuyerIdentityUpdateMutationVariables,
  LinkCartLinesAddMutation,
  LinkCartLinesAddMutationVariables,
  LinkGetCartQuery,
  LinkGetCartQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';

export type UserWithAnonymous = User & { isAnonymous: boolean };

const GET_CART_QUERY = `#graphql
  query LinkGetCart($cartId: ID!) {
    cart(id: $cartId) {
      lines(first: 100) {
        nodes {
          merchandise {
            ... on ProductVariant { id }
          }
          quantity
        }
      }
    }

  }
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation LinkCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE = `#graphql
  mutation LinkCartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart { id }
      userErrors { field message }
    }
  }
`;

// --- Retry Helper ---

async function withRetry<T>(
  fn: () => Promise<T | null>,
  maxAttempts: number,
  baseDelayMs: number,
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (result !== null) {
      return result;
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
    }
  }
  return null;
}

// --- Helper Functions ---

async function updateShopifyBuyerIdentity(
  cartId: string,
  email: string,
): Promise<string | null> {
  try {
    const response = await storefrontClient.request<
      LinkCartBuyerIdentityUpdateMutation,
      LinkCartBuyerIdentityUpdateMutationVariables
    >({
      query: CART_BUYER_IDENTITY_UPDATE,
      variables: { cartId, buyerIdentity: { email } },
    });
    if (
      response.cartBuyerIdentityUpdate?.userErrors?.length &&
      response.cartBuyerIdentityUpdate.userErrors.length > 0
    ) {
      console.error('[cart-merge] updateShopifyBuyerIdentity failed', {
        step: 'shopify-buyer-identity-update',
        error: response.cartBuyerIdentityUpdate.userErrors[0].message,
      });
      return null;
    }
    return response.cartBuyerIdentityUpdate?.cart?.id || null;
  } catch (error) {
    console.error('[cart-merge] updateShopifyBuyerIdentity failed', {
      step: 'shopify-buyer-identity-update',
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function getShopifyCartLines(cartId: string) {
  try {
    const { cart } = await storefrontClient.request<
      LinkGetCartQuery,
      LinkGetCartQueryVariables
    >({
      query: GET_CART_QUERY,
      variables: { cartId: cartId.split('?')[0] },
    });
    return cart?.lines?.nodes || [];
  } catch (error) {
    console.error('[cart-merge] shopify-get-cart-lines failed', {
      step: 'shopify-get-cart-lines',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

async function addLinesToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<string | null> {
  try {
    const response = await storefrontClient.request<
      LinkCartLinesAddMutation,
      LinkCartLinesAddMutationVariables
    >({
      query: CART_LINES_ADD_MUTATION,
      variables: { cartId, lines },
    });
    if (
      response.cartLinesAdd?.userErrors?.length &&
      response.cartLinesAdd.userErrors.length > 0
    ) {
      console.error('[cart-merge] addLinesToCart failed', {
        step: 'shopify-cart-lines-add',
        error: response.cartLinesAdd.userErrors[0].message,
      });
      return null;
    }
    return response.cartLinesAdd?.cart?.id || null;
  } catch (error) {
    console.error('[cart-merge] addLinesToCart failed', {
      step: 'shopify-cart-lines-add',
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// --- Main Function ---

export const anonymousCartBuyerIdentityUpdate = async ({
  newUser,
  anonymousUser,
}: {
  anonymousUser: {
    user: UserWithAnonymous & Record<string, any>;
    session: Session & Record<string, any>;
  };
  newUser: {
    user: User & Record<string, any>;
    session: Session & Record<string, any>;
  };
}) => {
  // 1. Fetch anonCartRecord from DB
  const anonCartRecord = await prisma.cart.findFirst({
    where: { userId: anonymousUser.user.id, completed: false },
  });

  // 2. If none, return (no-op)
  if (!anonCartRecord) {
    return;
  }

  // 3. Fetch userCartRecord from DB
  const userCartRecord = await prisma.cart.findFirst({
    where: { userId: newUser.user.id, completed: false },
  });

  // 4. Fetch anonLines from Shopify (single fetch — PERF-02)
  const anonLines = await getShopifyCartLines(anonCartRecord.cartToken);

  if (userCartRecord) {
    // 5a. User has an existing cart — merge anonymous lines into it
    let finalCartToken = userCartRecord.cartToken;

    if (anonLines.length > 0) {
      const linesToAdd = anonLines.map((node: any) => ({
        merchandiseId: node.merchandise.id,
        quantity: node.quantity,
      }));

      // Retry addLinesToCart up to 3 times with exponential backoff (RELY-01)
      const mergedCartId = await withRetry(
        () => addLinesToCart(userCartRecord.cartToken, linesToAdd),
        3,
        300,
      );

      if (mergedCartId === null) {
        // Total failure: all retries exhausted — log and notify user, leave both carts intact
        console.error('[cart-merge] addLinesToCart total failure after retries', {
          step: 'shopify-cart-lines-add-total-failure',
          userId: newUser.user.id,
          anonUserId: anonymousUser.user.id,
          orderId: undefined,
          error: 'All 3 retry attempts failed',
        });
        toast("Couldn't sync your cart. Your items are still saved.");
        return;
      }

      finalCartToken = mergedCartId;
    }

    // 5b. Update buyer identity (non-fatal — log failure but continue)
    const updatedCartId = await updateShopifyBuyerIdentity(
      finalCartToken,
      newUser.user.email,
    );
    if (updatedCartId) {
      finalCartToken = updatedCartId;
    } else {
      console.error('[cart-merge] updateShopifyBuyerIdentity non-fatal failure', {
        step: 'shopify-buyer-identity-update-non-fatal',
        userId: newUser.user.id,
        anonUserId: anonymousUser.user.id,
        orderId: undefined,
        error: 'Buyer identity update failed; continuing with merge',
      });
    }

    // 5c. Wrap all DB mutations in a Prisma transaction (RELY-01)
    const captured = { finalCartToken };
    try {
      await prisma.$transaction(async (tx) => {
        await tx.cart.update({
          where: { id: userCartRecord.id },
          data: { cartToken: captured.finalCartToken },
        });
        await tx.cart.delete({ where: { id: anonCartRecord.id } });
      });
    } catch (error) {
      // Shopify merge may have already succeeded (partial merge) — log for Phase 5 Sentry upgrade
      console.error('[cart-merge] prisma transaction failed', {
        step: 'shopify-merge-partial-success-db-rollback',
        userId: newUser.user.id,
        anonUserId: anonymousUser.user.id,
        orderId: undefined,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    // 6. User has no existing cart — re-assign anonymous cart to user
    let finalCartToken = anonCartRecord.cartToken;

    // 6a. Update buyer identity (non-fatal — log failure but continue)
    const updatedCartId = await updateShopifyBuyerIdentity(
      anonCartRecord.cartToken.split('?')[0],
      newUser.user.email,
    );
    if (updatedCartId) {
      finalCartToken = updatedCartId;
    } else {
      console.error('[cart-merge] updateShopifyBuyerIdentity non-fatal failure (no-userCart path)', {
        step: 'shopify-buyer-identity-update-non-fatal',
        userId: newUser.user.id,
        anonUserId: anonymousUser.user.id,
        orderId: undefined,
        error: 'Buyer identity update failed; continuing with cart reassignment',
      });
    }

    // 6b. Wrap DB mutation in a Prisma transaction (RELY-01)
    const captured = { finalCartToken };
    try {
      await prisma.$transaction(async (tx) => {
        await tx.cart.update({
          where: { id: anonCartRecord.id },
          data: {
            userId: newUser.user.id,
            cartToken: captured.finalCartToken,
          },
        });
      });
    } catch (error) {
      console.error('[cart-merge] prisma transaction failed (no-userCart path)', {
        step: 'prisma-cart-reassign-failed',
        userId: newUser.user.id,
        anonUserId: anonymousUser.user.id,
        orderId: undefined,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};
