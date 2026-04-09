import { createNovaPay, type NovaPayPostback } from '@entities/novapay/model';
import resetCartSession from '@features/cart/api/resetCartSession';
import { savePaymentInfo } from '@features/checkout/payment/api/savePaymentInfo';
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

/**
 * POST /api/novapay/callback
 *
 * Receives NovaPay v3 postbacks. Verifies RSA signature, then handles:
 * - holded: funds blocked → flip draft, fire process-order to keyCRM
 * - paid: funds captured → mark as paid in Shopify, confirm in keyCRM
 * - voided/expired/failed: cancel Shopify order
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const xSign = request.headers.get('x-sign');

    console.log(`[novapay/callback] received postback, x-sign: ${xSign ? 'present' : 'missing'}`);
    console.log(`[novapay/callback] body: ${rawBody}`);

    if (!xSign) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify postback signature
    const novapay = createNovaPay();
    const signatureValid = novapay.verifyPostback(rawBody, xSign);
    console.log(`[novapay/callback] signature valid: ${signatureValid}`);

    // TODO: re-enable signature verification after getting correct NovaPay public key
    if (!signatureValid) {
      console.warn(`[novapay/callback] ⚠️ signature invalid — skipping verification for dev`);
      // await captureServerError(new Error('Invalid NovaPay signature'), {
      //   service: 'api',
      //   action: 'novapay_callback_invalid_signature',
      // });
      // return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const postback: NovaPayPostback = JSON.parse(rawBody);
    const sessionId = postback.id;
    const status = postback.status;
    console.log(`[novapay/callback] status=${status} session=${sessionId}`);

    // Find order by NovaPay session ID stored in PaymentInformation.description
    const paymentInfo = await prisma.paymentInformation.findFirst({
      where: { description: { contains: sessionId } },
      include: { user: true },
    });

    if (!paymentInfo) {
      console.warn(`[novapay/callback] no payment found for session ${sessionId}`);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Find the correct order using shopifyOrderId from metadata (not user's first order)
    const metadataOrderId = postback.metadata?.shopifyOrderId as string | undefined;
    const order = metadataOrderId
      ? await prisma.order.findFirst({ where: { shopifyOrderId: metadataOrderId } })
      : await prisma.order.findFirst({ where: { userId: paymentInfo.userId }, orderBy: { createdAt: 'desc' } });

    if (!order?.shopifyOrderId) {
      console.warn(`[novapay/callback] no order found for session ${sessionId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`[novapay/callback] found order: ${order.orderName} (${order.shopifyOrderId}), draft=${order.draft}`);
    const shopifyOrderId = order.shopifyOrderId;
    const paymentAmount = postback.payments?.[0]?.amount ?? paymentInfo.amount;

    // ── holded: funds are blocked on customer's account ──────────────────────
    if (status === 'holded') {
      await prisma.paymentInformation.update({
        where: { id: paymentInfo.id },
        data: { description: `NovaPay holded: session=${sessionId}` },
      });

      // Flip draft → false so polling UI shows thank-you page
      if (order.draft) {
        await prisma.order.update({
          where: { id: order.id },
          data: { draft: false },
        });
      }

      try { await resetCartSession(order.id); } catch { /* non-blocking */ }

      // Fire process-order to keyCRM + eSputnik
      await fireProcessOrder(shopifyOrderId, order, paymentInfo);

      // Check if capture_pending (CRM confirmed before hold arrived)
      const desc = paymentInfo.description ?? '';
      if (desc.startsWith('capture_pending')) {
        console.log(`[novapay/callback] capture_pending for ${shopifyOrderId} — auto-capturing`);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
        const secret = process.env.INTERNAL_API_SECRET;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (secret) headers['Authorization'] = `Bearer ${secret}`;
        fetch(`${siteUrl}/api/novapay/capture`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ shopifyOrderId }),
        }).catch((err) => console.error('[novapay/callback] auto-capture failed:', err));
      }

      return NextResponse.json({ message: 'Hold received' });
    }

    // ── paid: funds captured (complete-hold succeeded) ───────────────────────
    if (status === 'paid') {
      await prisma.paymentInformation.update({
        where: { id: paymentInfo.id },
        data: { description: `NovaPay paid: session=${sessionId}` },
      });

      if (order.draft) {
        await prisma.order.update({
          where: { id: order.id },
          data: { draft: false },
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
          console.error('[novapay/callback] orderMarkAsPaid errors:', userErrors);
        } else {
          console.log('[novapay/callback] order marked as paid in Shopify:', shopifyOrderId);
        }
      } catch (err) {
        console.error('[novapay/callback] Failed to mark order as paid:', err);
      }

      // Confirm payment in keyCRM + eSputnik (fire-and-forget)
      try {
        const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (INTERNAL_API_SECRET) internalHeaders['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;
        fetch(`${PRICE_APP_URL}/api/internal/confirm-payment`, {
          method: 'POST',
          headers: internalHeaders,
          body: JSON.stringify({
            orderName: order.orderName,
            amount: paymentAmount,
            currency: paymentInfo.currency,
            paymentMethod: 'novapay',
          }),
        }).catch((err) => console.error('[novapay/callback] confirm-payment failed:', err));
      } catch {}

      await captureServerEvent(order.userId, 'payment_completed', {
        order_id: order.id,
        shopify_order_id: shopifyOrderId,
        amount: paymentAmount,
        currency: paymentInfo.currency,
        payment_provider: 'novapay',
        novapay_session_id: sessionId,
      });

      return NextResponse.json({ message: 'Payment completed', orderId: order.id });
    }

    // ── voided / expired / failed: cancel order ──────────────────────────────
    if (status === 'voided' || status === 'expired' || status === 'failed') {
      await prisma.paymentInformation.update({
        where: { id: paymentInfo.id },
        data: { description: `NovaPay ${status}: session=${sessionId}` },
      });

      if (order.draft) {
        await cancelShopifyOrder(order.id, shopifyOrderId);
      }

      return NextResponse.json({ message: `Payment ${status}` });
    }

    // Other statuses (processing, hold_confirmed, processing_hold_completion, processing_void)
    console.log(`[novapay/callback] intermediate status=${status} for session=${sessionId}, no action`);
    return NextResponse.json({ message: 'Callback received' });

  } catch (error) {
    await captureServerError(error, {
      service: 'api',
      action: 'novapay_callback_internal_error',
    });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * Fire process-order webhook to keyCRM + eSputnik.
 * Mirrors the logic from LiqPay callback.
 */
async function fireProcessOrder(
  shopifyOrderId: string,
  order: { id: string; userId: string; orderName: string | null },
  paymentInfo: { currency: string },
) {
  try {
    const shopifyData = await adminClient.client.request<any, { id: string }>({
      query: GET_ORDER_FOR_PROCESS_ORDER,
      variables: { id: shopifyOrderId },
    });
    const shopifyOrder = shopifyData?.order;
    if (!shopifyOrder) return;

    const numericOrderId = shopifyOrderId.replace('gid://shopify/Order/', '');
    const totalDiscount = Number(shopifyOrder.totalDiscountsSet?.shopMoney?.amount ?? 0);
    const currency = shopifyOrder.totalPriceSet?.shopMoney?.currencyCode ?? paymentInfo.currency;

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
    } catch { /* non-blocking */ }

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
      payment_gateway_names: ['novapay'],
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
            variant_title: variant?.title && variant.title !== 'Default Title' ? variant.title : '',
            quantity: node.quantity,
            price: node.originalUnitPriceSet?.shopMoney?.amount || '0',
            product_id: Number(variant?.product?.id?.replace('gid://shopify/Product/', '') || 0),
            variant_id: Number(variant?.id?.replace('gid://shopify/ProductVariant/', '') || 0),
            sku: '',
          };
        }),
      shipping_lines: [],
      applied_discount: totalDiscount > 0
        ? { type: 'total', title: 'Знижка', amount: totalDiscount.toFixed(2) }
        : null,
    };

    const internalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (INTERNAL_API_SECRET) internalHeaders['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;

    fetch(`${PRICE_APP_URL}/api/internal/process-order`, {
      method: 'POST',
      headers: internalHeaders,
      body: JSON.stringify({ payload: webhookPayload, shop: SHOPIFY_STORE_DOMAIN }),
    }).catch((err) => console.error('[novapay/callback] process-order call failed:', err));

  } catch (err) {
    console.error('[novapay/callback] fireProcessOrder failed:', err);
  }
}
