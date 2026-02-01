'use server';
import { prisma } from '@shared/lib/prisma';
import { adminClient } from '@shared/lib/shopify/admin-client';

const DRAFT_ORDER_COMPLETE_MUTATION = `
  mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
    draftOrderComplete(id: $id, paymentPending: $paymentPending) {
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

export const completeOrder = async (orderId: string, paymentPending: boolean = false) => {
  try {
    const orderResponse = await adminClient.client.request<
      {
        draftOrderComplete: {
          userErrors: Array<{ field: string; message: string }>;
          draftOrder: {
            id: string;
            order: {
              id: string;
            };
          };
        };
      },
      { id: string; paymentPending?: boolean }
    >({
      query: DRAFT_ORDER_COMPLETE_MUTATION,
      variables: {
        id: orderId,
        paymentPending: paymentPending
      },
    });

    if (orderResponse.draftOrderComplete?.userErrors.length > 0) {
      throw new Error(orderResponse.draftOrderComplete.userErrors[0].message);
    }

    const completedOrderId =
      orderResponse.draftOrderComplete.draftOrder.order.id;
    return prisma.order.update({
      where: { shopifyDraftOrderId: orderId },
      data: {
        shopifyOrderId: completedOrderId,
        draft: false,
      },
    });
  } catch (e) {
    console.error(e);
    throw new Error('Failed to complete order');
  }
};
