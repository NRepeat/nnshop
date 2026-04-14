import { createPayParts, type PayPartsCallback } from '@entities/payparts/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { cancelShopifyOrder } from '@features/order/api/cancelShopifyOrder';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { captureServerEvent, captureServerError } from '@shared/lib/posthog/posthog-server';
import { PRICE_APP_URL, INTERNAL_API_SECRET, SHOPIFY_STORE_DOMAIN } from '@shared/config/shop';
import { NextRequest, NextResponse } from 'next/server';

const ORDER_MARK_AS_PAID_MUTATION = `
  mutation orderMarkAsPaid($input: OrderMarkAsPaidInput!) {
    orderMarkAsPaid(input: $input) {
      order { id }
      userErrors { field message }
    }
  }
`;

/**
 * POST /api/payparts/callback
 *
 * Receives PrivatBank "Оплата частинами" callbacks.
 * KeyCRM order is already created at checkout time.
 * This handler:
 *  - LOCKED: flips draft, resets cart (hold confirmed by client)
 *  - SUCCESS: marks paid in Shopify, confirms in KeyCRM, sends eSputnik
 *  - FAIL/CANCELED: cancels Shopify order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback: PayPartsCallback = body;

    console.log(`[payparts/callback] state=${callback.paymentState} orderId=${callback.orderId}`);

    // Verify signature
    const payparts = createPayParts();
    if (!payparts.verifyCallback(callback)) {
      console.error('[payparts/callback] invalid signature');
      await captureServerError(new Error('Invalid PayParts signature'), {
        service: 'api',
        action: 'payparts_callback_invalid_signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const shopifyOrderId = `gid://shopify/Order/${callback.orderId}`;

    // Find order
    const order = await prisma.order.findFirst({
      where: { shopifyOrderId },
      include: { user: { include: { paymentInformation: true } } },
    });

    if (!order) {
      console.warn(`[payparts/callback] order not found for ${callback.orderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const paymentInfo = order.user?.paymentInformation;

    // ── LOCKED: hold confirmed by client, awaiting shop confirmation ──
    if (callback.paymentState === 'LOCKED') {
      if (order.draft) {
        await prisma.order.update({
          where: { id: order.id },
          data: { draft: false },
        });
      }

      if (paymentInfo) {
        await prisma.paymentInformation.update({
          where: { id: paymentInfo.id },
          data: { description: `PayParts LOCKED: orderId=${callback.orderId}` },
        });
      }

      try { await resetCartSession(order.id); } catch { /* non-blocking */ }

      return NextResponse.json({ message: 'Payment locked, awaiting confirmation' });
    }

    // ── SUCCESS: payment complete (direct charge or after hold confirm) ──
    if (callback.paymentState === 'SUCCESS') {
      if (order.draft) {
        await prisma.order.update({
          where: { id: order.id },
          data: { draft: false },
        });
      }

      if (paymentInfo) {
        await prisma.paymentInformation.update({
          where: { id: paymentInfo.id },
          data: { description: `PayParts paid: orderId=${callback.orderId}` },
        });
      }

      try { await resetCartSession(order.id); } catch { /* non-blocking */ }

      // Mark as paid in Shopify
      try {
        const result = await adminClient.client.request<any, any>({
          query: ORDER_MARK_AS_PAID_MUTATION,
          variables: { input: { id: shopifyOrderId } },
        });
        const userErrors = result?.orderMarkAsPaid?.userErrors || [];
        if (userErrors.length > 0) {
          console.error('[payparts/callback] orderMarkAsPaid errors:', userErrors);
        } else {
          console.log('[payparts/callback] order marked as paid:', shopifyOrderId);
        }
      } catch (err) {
        console.error('[payparts/callback] orderMarkAsPaid failed:', err);
      }

      // Confirm payment in KeyCRM + queue eSputnik (backend builds payload)
      try {
        const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (INTERNAL_API_SECRET) internalHeaders['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
        fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
          method: 'POST',
          headers: internalHeaders,
          body: JSON.stringify({
            orderName: order.orderName,
            shopifyOrderId,
            amount: paymentInfo?.amount,
            currency: paymentInfo?.currency ?? 'UAH',
            paymentMethod: 'payparts',
            shop: SHOPIFY_STORE_DOMAIN,
          }),
        }).catch((err) => console.error('[payparts/callback] confirm-payment failed:', err));
      } catch {}

      await captureServerEvent(order.userId, 'payment_completed', {
        order_id: order.id,
        shopify_order_id: shopifyOrderId,
        amount: paymentInfo?.amount,
        currency: paymentInfo?.currency ?? 'UAH',
        payment_provider: 'payparts',
      });

      return NextResponse.json({ message: 'Payment completed' });
    }

    // ── FAIL / CANCELED ────────────────────────────────────────────────
    if (callback.paymentState === 'FAIL' || callback.paymentState === 'CANCELED') {
      if (paymentInfo) {
        await prisma.paymentInformation.update({
          where: { id: paymentInfo.id },
          data: { description: `PayParts ${callback.paymentState}: ${callback.message || ''}` },
        });
      }

      if (order.draft) {
        await cancelShopifyOrder(order.id, shopifyOrderId);
      }

      return NextResponse.json({ message: `Payment ${callback.paymentState}` });
    }

    // Other statuses (CREATED, CLIENT_WAIT, OTP_WAITING, PP_CREATION, WAIT_LIQPAY)
    console.log(`[payparts/callback] intermediate state=${callback.paymentState}`);
    return NextResponse.json({ message: 'Callback received' });

  } catch (error) {
    await captureServerError(error, {
      service: 'api',
      action: 'payparts_callback_internal_error',
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
