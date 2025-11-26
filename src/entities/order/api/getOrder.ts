import { adminClient } from '@shared/lib/shopify/admin-client';
import { Order } from '../model/types';

const GET_ORDER_BY_ID_QUERY = `
  query orderByIdentifier($id: ID!) {
    order(id: $id) {
      id
      name
      lineItems(first: 10) {
        edges {
          node {
            title
            quantity
            variant {
              price
            }
            image {
              url
            }
          }
        }
      }
      subtotalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      totalShippingPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      totalTaxSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await adminClient.client.request<{ order: Order }>({
    query: GET_ORDER_BY_ID_QUERY,
    variables: { id: `${orderId}` },
  });
  return response.order;
};
