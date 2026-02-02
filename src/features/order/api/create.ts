'use server';
import { getCart } from '@entities/cart/api/get';
import { auth } from '@features/auth/lib/auth';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { headers } from 'next/headers';
import { CheckoutData } from '@features/checkout/schema/checkoutDataSchema';
import { GetCartQuery } from '@shared/lib/shopify/types/storefront.generated';
import { formatPhoneForShopify } from '@features/checkout/schema/contactInfoSchema';

type DrafOrder = {
  id: string;
  name: string;
  totalPrice: number;
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

const DRAFT_ORDER_CREATE_MUTATION = `
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        totalPrice
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

const DRAFT_ORDER_UPDATE_MUTATION = `
  mutation draftOrderUpdate($id: ID!, $input: DraftOrderInput!) {
    draftOrderUpdate(id: $id, input: $input) {
      draftOrder {
        id
        name
        totalPrice
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

export async function createDraftOrder(
  completeCheckoutData: Omit<CheckoutData, 'paymentInfo'> | null,
  locale: string = 'uk',
): Promise<{
  success: boolean;
  order?: DrafOrder;
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
    // const cartId = await prisma.cart.findFirst({
    //   where: { userId: session.user.id, completed: false },
    // });
    const existDraftOrder = await prisma.order.findFirst({
      where: { userId: session.user.id, draft: true },
    });

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
    const lineItems = cart.lines.edges
      .map((edge: any) => {
        const lineItem = edge.node;
        if (lineItem.quantity === 0) {
          return null;
        }

        const product = lineItem.merchandise.product;

        // Get discount percentage from metafield
        const sale = Number(
          product.metafields?.find((m: any) => m?.key === 'znizka')?.value || '0'
        ) || 0;

        const item: any = {
          variantId: lineItem.merchandise.id,
          quantity: lineItem.quantity,
        };

        // Apply discount if exists
        if (sale > 0) {
          item.appliedDiscount = {
            valueType: 'PERCENTAGE',
            value: parseFloat(sale.toString()),
            description: `${sale}% discount`,
          };
        }

        return item;
      })
      .filter((item) => item !== null);
    const input: any = {
      lineItems: lineItems,
    };

    // Add note from cart if present
    if (cart.note) {
      input.note = cart.note;
    }

    // Add discount codes from cart if present
    if (cart.discountCodes && cart.discountCodes.length > 0) {
      const applicableDiscounts = cart.discountCodes.filter((d) => d.applicable);
      if (applicableDiscounts.length > 0) {
        // Calculate discount amount from cart cost
        const subtotal = parseFloat(cart.cost.subtotalAmount.amount);
        const total = parseFloat(cart.cost.totalAmount.amount);
        const discountAmount = subtotal - total;

        // Apply discount to draft order if there's a difference
        if (discountAmount > 0) {
          input.appliedDiscount = {
            valueType: 'FIXED_AMOUNT',
            value: discountAmount,
            description: `Discount code: ${applicableDiscounts.map(d => d.code).join(', ')}`,
            title: applicableDiscounts[0].code,
          };
        }

        // Also save discount codes as custom attributes for reference
        if (!input.customAttributes) {
          input.customAttributes = [];
        }
        applicableDiscounts.forEach((discount, index) => {
          input.customAttributes.push({
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
      input.email = completeCheckoutData.contactInfo.email;
    }

    // Format phone number for Shopify (E.164 format)
    const formattedPhone = completeCheckoutData.contactInfo.phone
      ? formatPhoneForShopify(
          completeCheckoutData.contactInfo.phone,
          completeCheckoutData.contactInfo.countryCode
        )
      : '';

    if (formattedPhone) {
      input.phone = formattedPhone;
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
    input.shippingAddress = shippingAddress;

    let draftOrder: DrafOrder | null = null;
    let userErrors: Array<{ field: string; message: string }> = [];

    if (existDraftOrder?.shopifyDraftOrderId) {
      const variables = {
        id: existDraftOrder.shopifyDraftOrderId,
        input: input,
      };
      const orderResponse = await adminClient.client.request<
        {
          draftOrderUpdate: {
            draftOrder: DrafOrder | null;
            userErrors: Array<{ field: string; message: string }>;
          };
        },
        {
          id: string;
          input: any;
        }
      >({
        query: DRAFT_ORDER_UPDATE_MUTATION,
        variables,
      });

      draftOrder = orderResponse.draftOrderUpdate.draftOrder;
      userErrors = orderResponse.draftOrderUpdate.userErrors;
    } else {
      const orderResponse = await adminClient.client.request<
        {
          draftOrderCreate: {
            draftOrder: DrafOrder | null;
            userErrors: Array<{ field: string; message: string }>;
          };
        },
        {
          input: any;
        }
      >({
        query: DRAFT_ORDER_CREATE_MUTATION,
        variables: { input },
      });
      draftOrder = orderResponse.draftOrderCreate.draftOrder;
      userErrors = orderResponse.draftOrderCreate.userErrors;
    }

    if (userErrors.length > 0) {
      console.error(' ADMIN API USER ERRORS:', JSON.stringify(userErrors, null, 2));
      userErrors.forEach(error => {
        console.error(`Field: ${error.field}, Message: ${error.message}`);
      });
      return {
        success: false,
        errors: userErrors.map((error) => error.message),
      };
    }

    if (!draftOrder) {
      console.error(' NO DRAFT ORDER RETURNED FROM ADMIN API');
      return {
        success: false,
        errors: ['Failed to create/update draft order - no order returned'],
      };
    }

    if (!existDraftOrder) {
      await prisma.order.create({
        data: {
          shopifyDraftOrderId: draftOrder.id,
          userId: session.user.id,
          draft: true,
        },
      });
    }

    return {
      success: true,
      order: draftOrder,
    };
  } catch (error) {
    console.error(
      ' ERROR CREATING/UPDATING DRAFT ORDER WITH ADMIN API:',
      error,
    );
    console.error(' ERROR DETAILS:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cartId: '', // Consider adding cartId here for better debugging
    });
    return {
      success: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'Failed to create/update draft order with Admin API',
      ],
    };
  }
}
