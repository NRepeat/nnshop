'use server';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { prisma } from '@shared/lib/prisma';
import { captureServerError } from '@shared/lib/posthog/posthog-server';

const ORDER_CANCEL_MUTATION = `
  mutation orderCancel($orderId: ID!, $notifyCustomer: Boolean, $reason: OrderCancelReason!, $restock: Boolean!) {
    orderCancel(orderId: $orderId, notifyCustomer: $notifyCustomer, reason: $reason, restock: $restock) {
      orderCancelUserErrors { field message }
      userErrors { field message }
    }
  }
`;

/**
 * Cancels a Shopify order and removes the local DB record.
 * Called when the thank-you page detects a draft order (user abandoned / cancelled LiqPay payment).
 * notifyCustomer: false — no cancellation email is sent.
 */
export async function cancelShopifyOrder(prismaOrderId: string, shopifyOrderId: string) {
  console.log('[cancelShopifyOrder] start — prismaOrderId:', prismaOrderId, 'shopifyOrderId:', shopifyOrderId);
  try {
    console.log('[cancelShopifyOrder] sending orderCancel mutation to Shopify...');
    const result = await adminClient.client.request<
      {
        orderCancel: {
          orderCancelUserErrors: Array<{ field: string; message: string }>;
          userErrors: Array<{ field: string; message: string }>;
        };
      },
      { orderId: string; notifyCustomer: boolean; reason: string; restock: boolean }
    >({
      query: ORDER_CANCEL_MUTATION,
      variables: { orderId: shopifyOrderId, notifyCustomer: false, reason: 'DECLINED', restock: true },
    });

    console.log('[cancelShopifyOrder] raw Shopify response:', JSON.stringify(result));

    const errors = [
      ...(result?.orderCancel?.orderCancelUserErrors ?? []),
      ...(result?.orderCancel?.userErrors ?? []),
    ];

    if (errors.length > 0) {
      const messages = errors.map((e) => e.message).join(', ');
      console.error('[cancelShopifyOrder] orderCancel errors:', messages);
      // "already cancelled" is not a real error — the order is already in the desired state
      if (!messages.toLowerCase().includes('cancel')) {
        return;
      }
      console.log('[cancelShopifyOrder] order was already cancelled, proceeding to DB cleanup');
    } else {
      console.log('[cancelShopifyOrder] order cancelled in Shopify:', shopifyOrderId);
    }

    // Remove the local DB record so re-visits to the success page redirect cleanly
    await prisma.order.delete({ where: { id: prismaOrderId } });
    console.log('[cancelShopifyOrder] DB record deleted:', prismaOrderId);
  } catch (err) {
    console.error('[cancelShopifyOrder] unexpected error:', err);
    await captureServerError(err, {
      service: 'checkout',
      action: 'cancel_shopify_order',
      extra: { shopifyOrderId, prismaOrderId },
    });
  }
}
