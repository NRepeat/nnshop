'use server';
import { getCart } from '@entities/cart/api/get';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { formatPhoneForShopify } from '@features/checkout/schema/contactInfoSchema';

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
): Promise<{
  success: boolean;
  order?: OrderResult;
  errors?: string[];
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      console.error('SESSION NOT FOUND');
      return {
        success: false,
        errors: ['Session not found'],
      };
    }

    const result = (await getCart({
      userId: session.user.id,
      locale,
    })) as GetCartQuery | null;
    if (!result) {
      console.error('CART NOT FOUND');
      return {
        success: false,
        errors: ['Cart  NOT FOUND'],
      };
    }
    const cart = result.cart;
    if (!cart) {
      console.error('CART NOT FOUND');
      return {
        success: false,
        errors: ['Cart  NOT FOUND'],
      };
    }
    if (!cart.lines || !cart.lines.edges.length) {
      console.error('CART HAS NO ITEMS');
      return {
        success: false,
        errors: ['Cart has no items'],
      };
    }

    const currencyCode = cart.cost.totalAmount.currencyCode || 'UAH';

    const lineItems = cart.lines.edges
      .map((edge: any) => {
        const lineItem = edge.node;
        if (lineItem.quantity === 0) {
          return null;
        }

        const product = lineItem.merchandise.product;
        const amountPerQuantity = parseFloat(
          lineItem.cost.amountPerQuantity.amount,
        );

        // Get discount percentage from metafield
        const sale =
          Number(
            product.metafields?.find((m: any) => m?.key === 'znizka')?.value ||
              '0',
          ) || 0;

        const item: any = {
          variantId: lineItem.merchandise.id,
          quantity: lineItem.quantity,
        };

        // Apply discount via priceSet if exists
        if (sale > 0) {
          const discountedPrice = amountPerQuantity * (1 - sale / 100);
          item.priceSet = {
            shopMoney: {
              amount: discountedPrice.toFixed(2),
              currencyCode,
            },
          };
        } else {
          item.priceSet = {
            shopMoney: {
              amount: amountPerQuantity.toFixed(2),
              currencyCode,
            },
          };
        }

        return item;
      })
      .filter((item) => item !== null);

    const order: any = {
      lineItems: lineItems,
      currency: currencyCode,
      financialStatus: 'PENDING',
    };

    // Add discount codes from cart if present
    if (cart.discountCodes && cart.discountCodes.length > 0) {
      const applicableDiscounts = cart.discountCodes.filter(
        (d) => d.applicable,
      );
      if (applicableDiscounts.length > 0) {
        // Save discount codes as custom attributes for reference
        if (!order.customAttributes) {
          order.customAttributes = [];
        }
        applicableDiscounts.forEach((discount, index) => {
          order.customAttributes.push({
            key: `discount_code_${index + 1}`,
            value: discount.code,
          });
        });
      }
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

    const selectedDelivery = cart.delivery.addresses.find(
      (a) => a.selected,
    )?.address;
    const shippingAddress = {
      address1: selectedDelivery?.address1 || '',
      city: selectedDelivery?.city || '',
      country: selectedDelivery?.countryCode || '',
      firstName: completeCheckoutData.contactInfo.name || '',
      lastName: completeCheckoutData.contactInfo.lastName || '',
      phone: formattedPhone,
      zip: selectedDelivery?.zip || '',
      address2: selectedDelivery?.address2 || undefined,
    };
    order.shippingAddress = shippingAddress;

    // Build order note
    const noteLines: string[] = [];
    if (cart.note) {
      noteLines.push(cart.note);
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
      console.error(
        ' ADMIN API USER ERRORS:',
        JSON.stringify(userErrors, null, 2),
      );
      userErrors.forEach((error) => {
        console.error(`Field: ${error.field}, Message: ${error.message}`);
      });
      return {
        success: false,
        errors: userErrors.map((error) => error.message),
      };
    }

    if (!createdOrder) {
      console.error(' NO ORDER RETURNED FROM ADMIN API');
      return {
        success: false,
        errors: ['Failed to create order - no order returned'],
      };
    }

    // Delete any existing draft orders for this user
    await prisma.order.deleteMany({
      where: { userId: session.user.id, draft: true },
    });

    await prisma.order.create({
      data: {
        shopifyOrderId: createdOrder.id,
        orderName: createdOrder.name,
        userId: session.user.id,
        draft: false,
      },
    });
    console.log('[createOrder] Order saved:', createdOrder.name);

    return {
      success: true,
      order: createdOrder,
    };
  } catch (error) {
    console.error(' ERROR CREATING ORDER WITH ADMIN API:', error);
    console.error(' ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
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
