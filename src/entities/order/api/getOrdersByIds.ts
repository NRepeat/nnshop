'use server';

import { adminClient } from '@shared/lib/shopify/admin-client';
import { Order } from '@shared/lib/shopify/types/storefront.types';

const GET_ORDERS_PAGINATED_BY_ID = `
  query GetOrdersByIds($query: String!, $first: Int!, $after: String) {
    orders(first: $first, query: $query, after: $after) {
      edges {
        cursor
        node {
          id
          name
          createdAt
          displayFulfillmentStatus
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 5) {
            edges {
              node {
                title
                image {
                  url
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

interface PaginatedOrdersResponse {
  orders: {
    edges: {
      cursor: string;
      node: Order;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

const ID_BATCH_SIZE = 50;

export const fetchAllOrdersByIDs = async (
  numericIDs: string[],
): Promise<Order[]> => {
  let allOrders: Order[] = [];
  let remainingIDs = [...numericIDs];

  while (remainingIDs.length > 0) {
    const batchIDs = remainingIDs.splice(0, ID_BATCH_SIZE);

    const searchQuery = batchIDs.map((id) => `id:${id}`).join(' OR ');

    let hasNextPage = true;
    let cursor: string | null = null;
    const first = 50;

    while (hasNextPage) {
      try {
        const response: PaginatedOrdersResponse =
          await adminClient.client.request<
            PaginatedOrdersResponse,
            { query: string; first: number; after: string | null }
          >({
            query: GET_ORDERS_PAGINATED_BY_ID,
            variables: {
              query: searchQuery,
              first: first,
              after: cursor,
            },
          });

        const ordersData = response.orders;

        if (ordersData && ordersData.edges) {
          allOrders.push(...ordersData.edges.map((edge) => edge.node));
          hasNextPage = ordersData.pageInfo.hasNextPage;
          cursor = ordersData.pageInfo.endCursor;

          if (!hasNextPage) break;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error(
          'Shopify Admin API batch request failed during pagination:',
          error,
        );
        hasNextPage = false;
      }
    }
  }
  return allOrders;
};
