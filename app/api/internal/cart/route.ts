import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@features/auth/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';

const LOAD_TEST_SECRET = process.env.LOAD_TEST_SECRET;

const CART_LINES_FOR_VARIANT = `#graphql
  query CartLinesForVariant($id: ID!) {
    cart(id: $id) {
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant { id }
            }
          }
        }
      }
    }
  }
`;

const CART_LINES_UPDATE = `#graphql
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD = `#graphql
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

const CART_CREATE = `#graphql
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { id totalQuantity }
      userErrors { field message }
    }
  }
`;

export async function POST(req: NextRequest) {
  if (!LOAD_TEST_SECRET || req.headers.get('x-load-test-key') !== LOAD_TEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { variantId } = await req.json();
  if (!variantId) {
    return NextResponse.json({ error: 'variantId required' }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const sessionCart = await prisma.cart.findFirst({
    where: { userId: session.user.id, completed: false },
  });

  if (sessionCart) {
    const cartData = await storefrontClient.request<any, any>({
      query: CART_LINES_FOR_VARIANT,
      variables: { id: sessionCart.cartToken },
      cache: 'no-store',
    });
    const existingLine = cartData?.cart?.lines?.edges?.find(
      (e: any) => e.node.merchandise?.id === variantId,
    );

    if (existingLine) {
      const updated = await storefrontClient.request<any, any>({
        query: CART_LINES_UPDATE,
        variables: {
          cartId: sessionCart.cartToken,
          lines: [{ id: existingLine.node.id, quantity: existingLine.node.quantity + 1 }],
        },
      });
      if (updated?.cartLinesUpdate?.userErrors?.length) {
        return NextResponse.json({ error: updated.cartLinesUpdate.userErrors[0].message }, { status: 400 });
      }
      return NextResponse.json({ success: true, cart: updated.cartLinesUpdate.cart });
    }

    const added = await storefrontClient.request<any, any>({
      query: CART_LINES_ADD,
      variables: { cartId: sessionCart.cartToken, lines: [{ merchandiseId: variantId, quantity: 1 }] },
    });
    if (added?.cartLinesAdd?.userErrors?.length) {
      return NextResponse.json({ error: added.cartLinesAdd.userErrors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: true, cart: added.cartLinesAdd.cart });
  }

  const created = await storefrontClient.request<any, any>({
    query: CART_CREATE,
    variables: {
      input: {
        lines: [{ merchandiseId: variantId, quantity: 1 }],
        buyerIdentity: { email: session.user.email },
      },
    },
  });
  if (created?.cartCreate?.userErrors?.length) {
    return NextResponse.json({ error: created.cartCreate.userErrors[0].message }, { status: 400 });
  }

  await prisma.cart.create({
    data: { cartToken: created.cartCreate.cart.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true, cart: created.cartCreate.cart });
}
