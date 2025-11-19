import { storefrontClient } from '@shared/lib/shopify/client';
import { GetCollectionsQuery } from '@shared/lib/shopify/types/storefront.generated';

const query = `#graphql
  query GetCollections {
    collections(first: 250) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export const getCollections = async () => {
  const collections = await storefrontClient.request<GetCollectionsQuery>({
    query,
  });
  return collections;
};
