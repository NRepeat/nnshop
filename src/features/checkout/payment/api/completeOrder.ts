'use server';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';
import { Order } from '@shared/lib/shopify/types/storefront.types';

const DRAFT_ORDER_COMPLITE_MUTATION = `
  mutation draftOrderComplete($id: ID!) {
    draftOrderComplete(id: $id) {
      draftOrder {
        id
        order {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const completeOrder = async (orderId: string) => {
  try {
    const orderResponse = await adminClient.client.request<{
      draftOrderComplete: {
        userErrors: Array<{ field: string; message: string }>;
        draftOrder: {
          id: string;
          order: {
            id: string;
          };
        };
      };
    }>({
      query: DRAFT_ORDER_COMPLITE_MUTATION,
      variables: { id: orderId },
    });

    if (orderResponse.draftOrderComplete?.userErrors.length > 0) {
      throw new Error(orderResponse.draftOrderComplete.userErrors[0].message);
    }

    const complitedOrderId =
      orderResponse.draftOrderComplete.draftOrder.order.id;
    return prisma.order.update({
      where: { shopifyDraftOrderId: orderId },
      data: {
        shopifyOrderId: complitedOrderId,
        draft: false,
      },
    });
  } catch (e) {
    console.error(e);
    throw new Error('Failed to complete order');
  }
};
