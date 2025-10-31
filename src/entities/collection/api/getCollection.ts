import { storefrontClient } from '@shared/lib/shopify/client';
import { GetCollectionQuery } from '@shared/lib/shopify/types/storefront.generated';

const query = `#graphql
  query GetCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            productType
            options{
              name
              optionValues{
                name
              }
            }
            vendor
            priceRange{
              maxVariantPrice{
                amount
                currencyCode
              }

            }
            featuredImage {
              altText
              height
              width
              url
            }
          }
        }
      }
      image {
        url
        altText
      }
    }
  }
`;

export const getCollection = async ({ handle }: { handle: string }) => {
  const collection = await storefrontClient.request<GetCollectionQuery>({
    query,
    variables: { handle, first: 10 },
  });
  return collection;
};
