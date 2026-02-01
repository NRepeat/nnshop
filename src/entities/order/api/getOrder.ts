import { adminClient } from '@shared/lib/shopify/admin-client';
import { Order } from '../model/types';

const GET_ORDER_BY_ID_QUERY = `
  query orderByIdentifier($id: ID!) {
    order(id: $id) {
    id name processedAt displayFulfillmentStatus   lineItems(first: 10) { edges { node { title quantity variant { price title } image { url } } } } subtotalPriceSet { presentmentMoney { amount currencyCode } } totalPriceSet { presentmentMoney { amount currencyCode } }
    }
  }
`;

export const getOrder = async (orderId: string): Promise<Order> => {
  const response = await adminClient.client.request<
    { order: Order },
    { id: string }
  >({
    query: GET_ORDER_BY_ID_QUERY,
    variables: { id: `${orderId}` },
  });
  return response.order;
};
