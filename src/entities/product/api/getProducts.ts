import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { getLocale } from 'next-intl/server';
import { GetProductsQuery } from '@shared/lib/shopify/types/storefront.generated';

const query = `#graphql
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          priceRange {
            maxVariantPrice {
              amount
              currencyCode
            }
            minVariantPrice {
              amount
              currencyCode
            }
          }
          options(first: 10) {
            id
            name
            values
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
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
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
                width
                height
              }
            }
          }
          featuredImage {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const getProducts = async ({ first }: { first: number }) => {
  const locale = await getLocale();
  const products = await storefrontClient.request<
    GetProductsQuery,
    { first: number }
  >({
    query,
    variables: { first },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return products;
};
