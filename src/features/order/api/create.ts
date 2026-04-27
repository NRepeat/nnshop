// SEC-02: CSRF PROTECTION VERIFIED — Next.js built-in Origin/Host header comparison
// is active for this Server Action. On every invocation, Next.js compares the Origin
// header to the Host header (or X-Forwarded-Host). Cross-origin requests are rejected
// automatically (HTTP 403). No serverActions.allowedOrigins is configured in
// next.config.ts, so only requests from the same origin (miomio.com.ua) are accepted.
// Ref: https://nextjs.org/docs/app/guides/data-security#csrf-protection
// Note: next.config.ts allowedDevOrigins controls dev server cross-origin access only;
// it does NOT affect Server Action CSRF protection.
'use server';
import { getCart } from '@entities/cart/api/get';
import {
  DISCOUNT_METAFIELD_KEY,
  DEFAULT_CURRENCY_CODE,
  DEFAULT_COUNTRY_CODE,
  PRICE_APP_URL,
  SHOPIFY_STORE_DOMAIN,
  INTERNAL_API_SECRET,
} from '@shared/config/shop';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';
import {
  captureServerEvent,
  captureServerError,
} from '@shared/lib/posthog/posthog-server';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { formatPhoneForShopify } from '@features/checkout/schema/contactInfoSchema';
import { getPickupPoint } from '@features/checkout/delivery/lib/pickup-points';

type OrderResult = {
  id: string;
  name: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  lineItems: {
    edges: {
      node: {
        id: string;
        title: string;
        quantity: number;
      };
    }[];
  };
};

const ORDER_CREATE_MUTATION = `
  mutation orderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order {
        id
        name
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 10) {
          edges {
            node {
              id
              title
              quantity
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createOrder(
  completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null,
  locale: string = 'uk',
  sendReceipt: boolean = false,
  paymentMethod?: string,
  options: {
    skipProcessOrder?: boolean;
    draftInDb?: boolean;
    paymentGatewayName?: string;
    bonusSpend?: number;
  } = {},
): Promise<{
  success: boolean;
  order?: OrderResult;
  errors?: string[];
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      await captureServerError(
        new Error('Session not found during order creation'),
        {
          service: 'checkout',
          action: 'create_order_no_session',
        },
      );
      return {
        success: false,
        errors: ['Session not found'],
      };
    }

    const result = (await getCart({
      userId: session.user.id,
      locale,
    })) as GetCartQuery | null;
    if (!result || !result.cart) {
      await captureServerError(
        new Error('Cart not found during order creation'),
        {
          service: 'checkout',
          action: 'create_order_no_cart',
          userId: session.user.id,
        },
      );
      return {
        success: false,
        errors: ['Cart  NOT FOUND'],
      };
    }
    const cart = result.cart;
    if (!cart.lines || !cart.lines.edges.length) {
      await captureServerError(new Error('Cart empty during order creation'), {
        service: 'checkout',
        action: 'create_order_empty_cart',
        userId: session.user.id,
      });
      return {
        success: false,
        errors: ['Cart has no items'],
      };
    }

    const currencyCode =
      cart.cost.totalAmount.currencyCode || DEFAULT_CURRENCY_CODE;

    // Calculate znizka-discounted subtotal (same logic as Payment.tsx)
    let localTotal = 0;
    let shopifySubtotal = 0;
    for (const edge of cart.lines.edges as any[]) {
      const line = edge.node;
      const price = parseFloat(line.cost.amountPerQuantity.amount);
      const sale =
        Number(
          line.merchandise.product.metafields?.find(
            (m: any) => m?.key === DISCOUNT_METAFIELD_KEY,
          )?.value || '0',
        ) || 0;
      const discountedPrice = sale > 0 ? price * (1 - sale / 100) : price;
      localTotal += discountedPrice * line.quantity;
      shopifySubtotal += price * line.quantity;
    }

    const applicableDiscounts = (cart.discountCodes ?? []).filter(
      (d) => d.applicable,
    );
    const _hasApplicableDiscount = applicableDiscounts.length > 0;
    // Sum cart-level + line-level discountAllocations to capture both order-level and
    // product-level automatic discounts (automatic line discounts only appear at line level)
    const cartDiscountTotal = [
      ...((cart as any).discountAllocations || []),
      ...cart.lines.edges.flatMap(
        (e: any) => (e.node.discountAllocations as any[]) || [],
      ),
    ].reduce(
      (sum: number, d: any) => sum + Number(d.discountedAmount.amount),
      0,
    );
    // Shopify calculates the discount on original prices; derive rate and apply to sale subtotal
    const discountRate =
      cartDiscountTotal > 0 && shopifySubtotal > 0
        ? cartDiscountTotal / shopifySubtotal
        : 0;
    const goodsTotal = localTotal * (1 - discountRate);
    // Discount amount = difference between znizka subtotal and final amount after cart discount
    let orderDiscountAmount = localTotal - goodsTotal;

    // Apply bonus points spend as an additional discount
    const bonusSpend = options.bonusSpend || 0;
    if (bonusSpend > 0) {
      orderDiscountAmount += bonusSpend;
    }

    const lineItems = cart.lines.edges
      .map((edge: any) => {
        const lineItem = edge.node;
        if (lineItem.quantity === 0) {
          return null;
        }

        const product = lineItem.merchandise.product as any;
        const amountPerQuantity = parseFloat(
          lineItem.cost.amountPerQuantity.amount,
        );

        // Get discount percentage from metafield
        const sale =
          Number(
            product.metafields?.find(
              (m: any) => m?.key === DISCOUNT_METAFIELD_KEY,
            )?.value || '0',
          ) || 0;

        const item: any = {
          variantId: lineItem.merchandise.id,
          quantity: lineItem.quantity,
        };

        // Line item price = znizka only; cart discount applied at order level via discountCode
        const basePrice =
          sale > 0 ? amountPerQuantity * (1 - sale / 100) : amountPerQuantity;
        item.priceSet = {
          shopMoney: {
            amount: basePrice.toFixed(2),
            currencyCode,
          },
        };

        return item;
      })
      .filter((item) => item !== null);

    const order: any = {
      lineItems: lineItems,
      currency: currencyCode,
      financialStatus: 'PENDING',
    };

    // Apply cart/automatic discount + bonusSpend at order level via discountCode
    if (orderDiscountAmount > 0) {
      const discountTitle =
        bonusSpend > 0
          ? applicableDiscounts.length > 0
            ? `${applicableDiscounts[0].code} + BONUS`
            : 'BONUS'
          : applicableDiscounts.length > 0
            ? applicableDiscounts[0].code
            : 'AUTOMATIC';

      order.discountCode = {
        itemFixedDiscountCode: {
          code: discountTitle,
          amountSet: {
            shopMoney: {
              amount: orderDiscountAmount.toFixed(2),
              currencyCode,
            },
          },
        },
      };
    }

    if (!completeCheckoutData) {
      throw new Error('Checkout data is missing');
    }
    if (completeCheckoutData.contactInfo.email) {
      order.email = completeCheckoutData.contactInfo.email;
    }

    // Format phone number for Shopify (E.164 format)
    const formattedPhone = completeCheckoutData.contactInfo.phone
      ? formatPhoneForShopify(
          completeCheckoutData.contactInfo.phone,
          completeCheckoutData.contactInfo.countryCode,
        )
      : '';

    if (formattedPhone) {
      order.phone = formattedPhone;
    }

    const selectedDelivery = cart.delivery?.addresses?.find(
      (a) => a.selected,
    )?.address;

    // For self-pickup, build address from DB delivery info (cart address may lag)
    const deliveryMethod = completeCheckoutData.deliveryInfo?.deliveryMethod;
    let shippingAddress: any;
    if (deliveryMethod === 'selfPickup') {
      const point = completeCheckoutData.deliveryInfo?.selfPickupPoint
        ? getPickupPoint(completeCheckoutData.deliveryInfo.selfPickupPoint)
        : null;
      shippingAddress = {
        address1: point
          ? `Самовивіз: ${point.name}, ${point.address}`
          : 'Самовивіз',
        city: point?.city || 'Запоріжжя',
        country: DEFAULT_COUNTRY_CODE,
        firstName: completeCheckoutData.contactInfo.name || '',
        lastName: completeCheckoutData.contactInfo.lastName || '',
        phone: formattedPhone,
        zip: '69000',
      };
    } else if (deliveryMethod === 'novaPoshta') {
      // Prefer DB department data — more reliable than cart sync
      const dept = completeCheckoutData.deliveryInfo?.novaPoshtaDepartment;
      const npAddress2 =
        dept?.addressParts?.street && dept?.addressParts?.building
          ? `${dept.addressParts.street}, ${dept.addressParts.building}`
          : selectedDelivery?.address2 || undefined;
      shippingAddress = {
        address1: dept?.shortName || selectedDelivery?.address1 || '',
        city: dept?.addressParts?.city || selectedDelivery?.city || '',
        country: DEFAULT_COUNTRY_CODE,
        firstName: completeCheckoutData.contactInfo.name || '',
        lastName: completeCheckoutData.contactInfo.lastName || '',
        phone: formattedPhone,
        zip: '00000',
        address2: npAddress2,
      };
    } else {
      // ukrPoshta — use cart-synced address
      shippingAddress = {
        address1: selectedDelivery?.address1 || '',
        city: selectedDelivery?.city || '',
        country: selectedDelivery?.countryCode || '',
        firstName: completeCheckoutData.contactInfo.name || '',
        lastName: completeCheckoutData.contactInfo.lastName || '',
        phone: formattedPhone,
        zip: selectedDelivery?.zip || '',
        address2: selectedDelivery?.address2 || undefined,
      };
    }
    order.shippingAddress = shippingAddress;

    // Build order note
    const noteLines: string[] = [];
    if (cart.note) {
      noteLines.push(cart.note);
    }

    if (applicableDiscounts.length > 0) {
      noteLines.push(
        `Промокод: ${applicableDiscounts.map((d) => d.code).join(', ')}`,
      );
    }
    if (bonusSpend > 0) {
      noteLines.push(`Списано бонусів: -${bonusSpend} ${currencyCode}`);
    }

    if (deliveryMethod === 'selfPickup') {
      const point = completeCheckoutData.deliveryInfo?.selfPickupPoint
        ? getPickupPoint(completeCheckoutData.deliveryInfo.selfPickupPoint)
        : null;
      const pickupLabel = point
        ? `${point.name} — ${point.fullAddress}`
        : 'Самовивіз';
      noteLines.push(`🏪 Самовивіз: ${pickupLabel}`);
    }

    if (paymentMethod) {
      const paymentLabel =
        paymentMethod === 'after-delivered'
          ? 'Оплата при отриманні'
          : paymentMethod === 'pay-now'
            ? 'За реквізитами'
            : paymentMethod;
      noteLines.push(`Метод оплати: ${paymentLabel}`);
    }
    if (completeCheckoutData.contactInfo.preferViber) {
      noteLines.push('⚠️ Не телефонуйте, надішліть повідомлення у Viber');
    }
    if (noteLines.length > 0) {
      order.note = noteLines.join('\n');
    }

    const orderResponse = await adminClient.client.request<
      {
        orderCreate: {
          order: OrderResult | null;
          userErrors: Array<{ field: string; message: string }>;
        };
      },
      {
        order: any;
        options: { sendReceipt: boolean; inventoryBehaviour: string };
      }
    >({
      query: ORDER_CREATE_MUTATION,
      variables: {
        order,
        options: {
          sendReceipt,
          inventoryBehaviour: 'DECREMENT_IGNORING_POLICY',
        },
      },
    });

    const createdOrder = orderResponse.orderCreate.order;
    const userErrors = orderResponse.orderCreate.userErrors;

    if (userErrors.length > 0) {
      await captureServerError(
        new Error('Shopify Order Creation Failed (Admin API)'),
        {
          service: 'checkout',
          action: 'create_order_shopify_error',
          userId: session.user.id,
          extra: { userErrors },
        },
      );
      return {
        success: false,
        errors: userErrors.map((error) => error.message),
      };
    }

    if (!createdOrder) {
      await captureServerError(
        new Error('Shopify Order Creation Failed - No Order (Admin API)'),
        {
          service: 'checkout',
          action: 'create_order_no_order',
          userId: session.user.id,
        },
      );
      return {
        success: false,
        errors: ['Failed to create order - no order returned'],
      };
    }

    // DB save is best-effort — Shopify order already exists and is confirmed
    try {
      // Delete any existing draft orders for this user
      await prisma.order.deleteMany({
        where: { userId: session.user.id, draft: true },
      });

      const dbOrder = await prisma.order.create({
        data: {
          shopifyOrderId: createdOrder.id,
          orderName: createdOrder.name,
          userId: session.user.id,
          draft: options.draftInDb ?? false,
          usedDiscountCodes: [
            ...applicableDiscounts.map((d) => d.code.toUpperCase()),
            ...(bonusSpend > 0 ? ['BONUS'] : []),
          ],
        },
      });

      // Record bonus spend in DB
      if (bonusSpend > 0) {
        const { triggerBonus } = await import('@shared/lib/bonus');
        triggerBonus(dbOrder.id, 'SPEND', bonusSpend).catch((err) =>
          console.error('[createOrder] triggerBonus SPEND failed:', err),
        );
      }

      // Ensure loyalty card exists
      try {
        const existingCard = await prisma.loyaltyCards.findFirst({
          where: { userId: session.user.id },
        });

        if (!existingCard) {
          const phone = completeCheckoutData.contactInfo.phone;
          const name =
            `${completeCheckoutData.contactInfo.name} ${completeCheckoutData.contactInfo.lastName}`.trim();

          // Double check if phone is already taken by another card
          const cardWithPhone = await prisma.loyaltyCards.findUnique({
            where: { phone },
          });

          if (!cardWithPhone) {
            await prisma.loyaltyCards.create({
              data: {
                id: crypto.randomUUID(),
                userId: session.user.id,
                phone,
                name,
                bonusBalance: 0,
              },
            });
            console.log(
              `[createOrder] Loyalty card created for user ${session.user.id}`,
            );
          }
        }
      } catch (cardError) {
        console.error(
          '[createOrder] Failed to ensure loyalty card:',
          cardError,
        );
      }
    } catch (dbError) {
      await captureServerError(dbError, {
        service: 'checkout',
        action: 'create_order_db_save_error',
        userId: session.user.id,
        extra: { orderId: createdOrder.id },
      });
      // Do NOT re-throw — Shopify order exists; user must see success state
    }

    // Trigger KeyCRM + eSputnik immediately (bypasses slow Shopify webhook)
    // Fire-and-forget — order already exists in Shopify, don't block the user
    // Skipped for LiqPay orders: process-order is fired after hold_wait callback instead,
    // so CRM entry + email are only created once payment is actually confirmed.
    if (options.skipProcessOrder) {
      return { success: true, order: createdOrder };
    }
    try {
      const numericOrderId = createdOrder.id.replace(
        'gid://shopify/Order/',
        '',
      );
      const webhookPayload = {
        id: Number(numericOrderId),
        name: createdOrder.name,
        email: order.email || '',
        phone: order.phone || '',
        created_at: new Date().toISOString(),
        currency: currencyCode,
        financial_status: 'pending',
        note: order.note || '',
        note_attributes: [],
        payment_gateway_names: [
          options.paymentGatewayName ||
            (paymentMethod === 'pay-now' ? 'liqpay' : 'manual'),
        ],
        customer: {
          first_name: completeCheckoutData.contactInfo.name || '',
          last_name: completeCheckoutData.contactInfo.lastName || '',
          email: completeCheckoutData.contactInfo.email || '',
          phone: order.phone || '',
        },
        shipping_address: order.shippingAddress
          ? {
              first_name: order.shippingAddress.firstName || '',
              last_name: order.shippingAddress.lastName || '',
              address1: order.shippingAddress.address1 || '',
              address2: order.shippingAddress.address2 || null,
              city: order.shippingAddress.city || '',
              country: order.shippingAddress.country || '',
              zip: order.shippingAddress.zip || '',
              phone: order.shippingAddress.phone || '',
            }
          : null,
        line_items: cart.lines.edges
          .filter((edge: any) => edge.node.quantity > 0)
          .map((edge: any) => {
            const line = edge.node;
            const variant = line.merchandise;
            const product = variant.product;
            return {
              title: product.title || '',
              variant_title:
                variant.title !== 'Default Title' ? variant.title : '',
              quantity: line.quantity,
              price: line.cost.amountPerQuantity.amount,
              product_id: Number(
                product.id?.replace('gid://shopify/Product/', '') || 0,
              ),
              variant_id: Number(
                variant.id?.replace('gid://shopify/ProductVariant/', '') || 0,
              ),
              sku: '',
            };
          }),
        shipping_lines: [],
        // Pre-calculated discount — itali-shop-app uses this instead of parsing note + Shopify API
        applied_discount:
          orderDiscountAmount > 0
            ? {
                type:
                  applicableDiscounts.length > 0
                    ? 'discount_code'
                    : 'automatic',
                title:
                  applicableDiscounts.length > 0
                    ? applicableDiscounts.map((d) => d.code).join(', ')
                    : 'Автоматична знижка',
                amount: orderDiscountAmount.toFixed(2),
              }
            : null,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (INTERNAL_API_SECRET)
        headers['Authorization'] = `Bearer ${INTERNAL_API_SECRET}`;

      fetch(`${PRICE_APP_URL}/api/internal/process-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          payload: webhookPayload,
          shop: SHOPIFY_STORE_DOMAIN,
        }),
      }).catch((err) => {
        console.error('[createOrder] internal process-order call failed:', err);
      });
    } catch (internalErr) {
      console.error(
        '[createOrder] failed to build internal process-order payload:',
        internalErr,
      );
    }

    await captureServerEvent(session.user.id, 'order_placed', {
      order_id: createdOrder.id,
      order_name: createdOrder.name,
      amount: createdOrder.totalPriceSet.shopMoney.amount,
      currency: createdOrder.totalPriceSet.shopMoney.currencyCode,
      payment_method: paymentMethod ?? 'cod',
      items_count: cart.lines.edges.length,
    });

    return {
      success: true,
      order: createdOrder,
    };
  } catch (error) {
    const session = await auth.api.getSession({ headers: await headers() });
    await captureServerError(error, {
      service: 'checkout',
      action: 'create_order_unexpected_error',
      userId: session?.user?.id,
    });
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to create order with Admin API',
      ],
    };
  }
}
