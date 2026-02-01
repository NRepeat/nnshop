import { storefrontClient } from '@shared/lib/shopify/client';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

export const GET_PRODUCTS_BY_IDS = `#graphql
  query getProductsByIds($query: String!, $first: Int!, $after: String) {
    products(first: $first, query: $query, after: $after) {
      edges {
        cursor
        
         node {
            id
            title
            handle
            availableForSale
            productType
            vendor
            totalInventory
            tags
            metafield(namespace:"custom",key:"znizka"){
                       value
                       namespace
                       key
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }

                }
              }
            }
            options {
              name
              optionValues {
                name
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              url
              altText
              width
              height
            }
            media(first:20){
                    edges{
                      node{

                            previewImage{
                              url
                              width
                              height
                              altText
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
// ${PRODUCT_METAFIELDS_FRAGMENT}

interface PaginatedProductsResponse {
  products: {
    edges: {
      cursor: string;
      node: Product;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

const ID_BATCH_SIZE = 50;

export const getProductsByIds = async (
  ids: string[],
  locale: string,
): Promise<Product[]> => {
  let allProducts: Product[] = [];
  let remainingIDs = [...ids];

  while (remainingIDs.length > 0) {
    const batchIDs = remainingIDs.splice(0, ID_BATCH_SIZE);
    const formated = batchIDs
      .map((item) => {
        if (!item) return null;
        const match = item.match(/\/(\d+)$/);
        return match ? match[1] : item;
      })
      .filter((i) => i !== null);
    let searchQuery = formated.map((id) => `id:${id}`).join(' OR ');
    if (formated.length === 1) {
      searchQuery = searchQuery + ' OR';
    }
    let hasNextPage = true;
    let cursor: string | null = null;
    const first = 50;
    while (hasNextPage) {
      try {
        const response: PaginatedProductsResponse =
          await storefrontClient.request<
            PaginatedProductsResponse,
            { query: string; first: number; after: string | null }
          >({
            query: GET_PRODUCTS_BY_IDS,
            variables: {
              query: searchQuery,
              first,
              after: cursor,
            },
            language: locale.toUpperCase() as StorefrontLanguageCode,
          });
        const productsData = response.products;

        if (productsData && productsData.edges) {
          allProducts.push(...productsData.edges.map((edge) => edge.node));
          hasNextPage = productsData.pageInfo.hasNextPage;
          cursor = productsData.pageInfo.endCursor;
        } else {
          hasNextPage = false;
        }
      } catch (error) {
        console.error('Shopify Storefront API request failed:', error);
        hasNextPage = false;
      }
    }
  }

  return allProducts;
};
