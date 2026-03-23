import LiqPay from '@entities/liqpay/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
import { cancelShopifyOrder } from '@features/order/api/cancelShopifyOrder';
import { PaymentInfo } from '@features/checkout/payment/schema/paymentSchema';
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
 * Fetches Shopify order details needed to build the process-order payload.
 * Called from hold_wait to fire keyCRM + eSputnik after payment is confirmed.
 */
// PII fields (email, phone, shippingAddress) are omitted — fetched separately
// via itali-shop-app /api/customer to avoid Shopify plan PII restrictions.
const GET_ORDER_FOR_PROCESS_ORDER = `
  query getOrderForProcessOrder($id: ID!) {
    order(id: $id) {
      id
      name
      note
      totalDiscountsSet { shopMoney { amount } }
      totalPriceSet { shopMoney { currencyCode } }
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            originalUnitPriceSet { shopMoney { amount } }
            variant {
              id
              title
              product { id }
            }
          }
        }
      }
    }
  }
`;

if (!process.env.LIQPAY_PUBLIC_KEY || !process.env.LIQPAY_PRIVATE_KEY) {
  throw new Error('LIQPAY_PUBLIC_KEY and LIQPAY_PRIVATE_KEY must be set');
}

const liqpay = new LiqPay(
  process.env.LIQPAY_PUBLIC_KEY!,
  process.env.LIQPAY_PRIVATE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const signature = formData.get('signature') as string;
    if (!liqpay.verifyCallback(data, signature)) {
      await captureServerError(new Error('Invalid LiqPay signature'), {
        service: 'api',
        action: 'liqpay_callback_invalid_signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    const paymentData = liqpay.decodeData(data);
    console.log(paymentData, 'paymentData');

    // wait_secure — bank is processing the hold; funds not yet blocked.
    // Flips draft → false so the thank-you page shows, fires process-order to keyCRM + eSputnik.
    // Capture will be triggered later when hold_wait arrives.
    if (paymentData.status === 'wait_secure') {
      const rawOrderId = paymentData.order_id;
      if (rawOrderId) {
        const shopifyOrderId = rawOrderId.includes('gid://')
          ? rawOrderId
          : `gid://shopify/Order/${rawOrderId}`;

        const order = await prisma.order.findUnique({ where: { shopifyOrderId } });
        if (order) {
          const paymentInfo: PaymentInfo = {
            amount: paymentData.amount,
            currency: paymentData.currency,
            paymentMethod: 'pay-now',
            paymentProvider: 'bank-transfer',
            description: `LiqPay hold: status=${paymentData.status}, liqpayOrderId=${paymentData.payment_id || ''}`,
            orderId: order.id,
          };
          await savePaymentInfo(paymentInfo, shopifyOrderId);

          // Flip draft → false so polling UI shows the thank-you page
          await prisma.order.update({
            where: { id: order.id },
            data: { draft: false },
          });

          try {
            await resetCartSession(order.id);
          } catch {
            // Cart may already be cleared — non-blocking
          }

          // Fire process-order to keyCRM + eSputnik (first time order enters CRM)
          try {
            const shopifyData = await adminClient.client.request<any, { id: string }>({
              query: GET_ORDER_FOR_PROCESS_ORDER,
              variables: { id: shopifyOrderId },
            });
            const shopifyOrder = shopifyData?.order;
            if (shopifyOrder) {
              const numericOrderId = shopifyOrderId.replace('gid://shopify/Order/', '');
              const totalDiscount = Number(shopifyOrder.totalDiscountsSet?.shopMoney?.amount ?? 0);
              const currency = shopifyOrder.totalPriceSet?.shopMoney?.currencyCode ?? paymentData.currency;

              let customerEmail = '';
              let customerPhone = '';
              let shippingAddr: Record<string, string | null> | null = null;
              try {
                const [contactInfo, deliveryInfo] = await Promise.all([
                  prisma.contactInformation.findUnique({ where: { userId: order.userId } }),
                  prisma.deliveryInformation.findUnique({
                    where: { userId: order.userId },
                    include: { novaPoshtaDepartment: true },
                  }),
                ]);
                if (contactInfo) {
                  customerEmail = contactInfo.email;
                  customerPhone = contactInfo.phone;
                  const address = deliveryInfo?.address ||
                    deliveryInfo?.novaPoshtaDepartment?.shortName || '';
                  const city = deliveryInfo?.city ||
                    deliveryInfo?.novaPoshtaDepartment?.city || '';
                  shippingAddr = {
                    first_name: contactInfo.name,
                    last_name: contactInfo.lastName,
                    address1: address,
                    address2: null,
                    city,
                    country: contactInfo.countryCode || 'UA',
                    zip: deliveryInfo?.postalCode || '',
                    phone: contactInfo.phone,
                  };
                }
              } catch {
                // non-blocking — proceed with empty customer info
              }

              const webhookPayload = {
                id: Number(numericOrderId),
                name: shopifyOrder.name,
                email: customerEmail,
                phone: customerPhone,
                created_at: new Date().toISOString(),
                currency,
                financial_status: 'pending',
                note: shopifyOrder.note || '',
                note_attributes: [],
                payment_gateway_names: ['liqpay'],
                customer: {
                  first_name: shippingAddr?.first_name || '',
                  last_name: shippingAddr?.last_name || '',
                  email: customerEmail,
                  phone: customerPhone,
                },
                shipping_address: shippingAddr,
                line_items: (shopifyOrder.lineItems?.edges ?? [])
                  .filter((e: any) => e.node.quantity > 0)
                  .map((e: any) => {
                    const node = e.node;
                    const variant = node.variant;
                    return {
                      title: node.title,
                      variant_title:
                        variant?.title && variant.title !== 'Default Title' ? variant.title : '',
                      quantity: node.quantity,
                      price: node.originalUnitPriceSet?.shopMoney?.amount || '0',
                      product_id: Number(
                        variant?.product?.id?.replace('gid://shopify/Product/', '') || 0,
                      ),
                      variant_id: Number(
                        variant?.id?.replace('gid://shopify/ProductVariant/', '') || 0,
                      ),
                      sku: '',
                    };
                  }),
                shipping_lines: [],
                applied_discount:
                  totalDiscount > 0
                    ? { type: 'total', title: 'Знижка', amount: totalDiscount.toFixed(2) }
                    : null,
              };

              const internalHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
              };
              if (INTERNAL_API_SECRET)
                internalHeaders['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;

              fetch(`${PRICE_APP_URL}/api/internal/process-order`, {
                method: 'POST',
                headers: internalHeaders,
                body: JSON.stringify({ payload: webhookPayload, shop: SHOPIFY_STORE_DOMAIN }),
              }).catch((err) => {
                console.error('[LiqPay callback] process-order call failed:', err);
              });
            }
          } catch (fetchErr) {
            console.error('[LiqPay callback] failed to fetch order for process-order:', fetchErr);
          }
        }
      }
      return NextResponse.json({ message: 'Wait secure received' });
    }

    // hold_wait / sandbox_hold_wait — funds are blocked and ready to capture.
    // 1. Flip draft → false if still in draft (sandbox or skipped wait_secure).
    // 2. If CRM already confirmed the order (capture_pending flag), auto-trigger capture now.
    if (
      paymentData.status === 'hold_wait' ||
      paymentData.status === 'sandbox_hold_wait'
    ) {
      const rawOrderId = paymentData.order_id;
      if (rawOrderId) {
        const shopifyOrderId = rawOrderId.includes('gid://')
          ? rawOrderId
          : `gid://shopify/Order/${rawOrderId}`;

        const order = await prisma.order.findUnique({
          where: { shopifyOrderId },
          include: { user: { include: { paymentInformation: true } } },
        });

        if (order && order.draft) {
          // Ensure draft is flipped (in case wait_secure was skipped, e.g. sandbox)
          const paymentInfo: PaymentInfo = {
            amount: paymentData.amount,
            currency: paymentData.currency,
            paymentMethod: 'pay-now',
            paymentProvider: 'bank-transfer',
            description: `LiqPay hold: status=${paymentData.status}, liqpayOrderId=${paymentData.payment_id || ''}`,
            orderId: order.id,
          };
          await savePaymentInfo(paymentInfo, shopifyOrderId);
          await prisma.order.update({ where: { id: order.id }, data: { draft: false } });
          try { await resetCartSession(order.id); } catch { /* non-blocking */ }
        }

        // If CRM confirmed the order while payment was still in wait_secure,
        // the capture endpoint marked it capture_pending. Trigger capture now.
        if (order) {
          const desc = order.user?.paymentInformation?.description ?? '';
          if (desc.startsWith('capture_pending')) {
            console.log(`[callback hold_wait] capture_pending detected for ${shopifyOrderId} — triggering auto-capture`);
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
            const secret = process.env.INTERNAL_API_SECRET;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (secret) headers['Authorization'] = `Bearer ${secret}`;
            fetch(`${siteUrl}/api/liqpay/capture`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ shopifyOrderId }),
            })
              .then((r) => console.log(`[callback hold_wait] auto-capture response: ${r.status}`))
              .catch((err) => console.error('[callback hold_wait] auto-capture failed:', err));
          }
        }
      }
      return NextResponse.json({ message: 'Hold received' });
    }

    if (paymentData.status === 'success' || paymentData.status === 'sandbox') {
      const rawOrderId = paymentData.order_id;
      if (!rawOrderId) {
        await captureServerError(new Error('LiqPay callback missing order_id'), {
          service: 'api',
          action: 'liqpay_callback_no_order_id',
          extra: { paymentData },
        });
        return NextResponse.json(
          { error: 'Invalid order id' },
          { status: 400 },
        );
      }

      // order_id may be numeric (e.g. "7949482229922") or full GID
      const shopifyOrderId = rawOrderId.includes('gid://')
        ? rawOrderId
        : `gid://shopify/Order/${rawOrderId}`;

      // Find the order in prisma by shopifyOrderId
      const order = await prisma.order.findUnique({
        where: { shopifyOrderId },
      });
      if (!order) {
        await captureServerError(new Error('LiqPay callback order not found in DB'), {
          service: 'api',
          action: 'liqpay_callback_order_not_found',
          extra: { shopifyOrderId },
        });
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const paymentInfo: PaymentInfo = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: 'pay-now',
        paymentProvider: 'bank-transfer',
        description: `LiqPay payment: status=${paymentData.status}, liqpayOrderId=${paymentData.payment_id || ''}`,
        orderId: order.id,
      };
      await savePaymentInfo(paymentInfo, shopifyOrderId);

      // Flip draft → false in case hold_wait was skipped (sandbox / direct charge)
      if (order.draft) {
        await prisma.order.update({ where: { id: order.id }, data: { draft: false } });
      }

      try {
        await resetCartSession(order.id);
      } catch {
        // Cart may already be cleared from hold_wait — non-blocking
      }

      // Mark order as paid in Shopify so orders/paid webhook fires
      try {
        const result = await adminClient.client.request<
          {
            orderMarkAsPaid: {
              order: { id: string } | null;
              userErrors: Array<{ field: string; message: string }>;
            };
          },
          { input: { id: string } }
        >({
          query: ORDER_MARK_AS_PAID_MUTATION,
          variables: { input: { id: shopifyOrderId } },
        });
        const userErrors = result?.orderMarkAsPaid?.userErrors || [];
        if (userErrors.length > 0) {
          console.error('[LiqPay callback] orderMarkAsPaid errors:', userErrors);
        } else {
          console.log('[LiqPay callback] order marked as paid in Shopify:', shopifyOrderId);
        }
      } catch (markError) {
        console.error('[LiqPay callback] Failed to mark order as paid in Shopify:', markError);
      }

      // Confirm payment in keyCRM + send eSputnik CONFIRMED (fire-and-forget)
      try {
        const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (INTERNAL_API_SECRET) internalHeaders['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
        fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
          method: 'POST',
          headers: internalHeaders,
          body: JSON.stringify({
            orderName: order.orderName,
            amount: paymentData.amount,
            currency: paymentData.currency,
            paymentMethod: 'liqpay',
          }),
        }).catch((err) => {
          console.error('[LiqPay callback] confirm-payment call failed:', err);
        });
      } catch (err) {
        console.error('[LiqPay callback] failed to call confirm-payment:', err);
      }

      await captureServerEvent(order.userId, 'payment_completed', {
        order_id: order.id,
        shopify_order_id: shopifyOrderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        payment_provider: 'liqpay',
        liqpay_payment_id: paymentData.payment_id,
      });
      return NextResponse.json(
        {
          message: 'Payment processed successfully',
          orderId: order.id,
        },
        { status: 200 },
      );
    }
    // Payment failed / cancelled by user — cancel the pending Shopify order immediately
    // so the polling UI detects notFound and redirects back to payment without waiting.
    if (
      paymentData.status === 'failure' ||
      paymentData.status === 'error' ||
      paymentData.status === 'reversed' ||
      paymentData.status === 'expired'
    ) {
      const rawOrderId = paymentData.order_id;
      if (rawOrderId) {
        const shopifyOrderId = rawOrderId.includes('gid://')
          ? rawOrderId
          : `gid://shopify/Order/${rawOrderId}`;
        const order = await prisma.order.findUnique({ where: { shopifyOrderId } });
        if (order?.draft) {
          await cancelShopifyOrder(order.id, shopifyOrderId);
        }
      }
      return NextResponse.json({ message: 'Payment cancelled' });
    }

    return NextResponse.json({ message: 'Callback received' });
  } catch (error) {
    await captureServerError(error, {
      service: 'api',
      action: 'liqpay_callback_internal_error',
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
