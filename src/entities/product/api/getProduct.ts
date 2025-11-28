import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { getLocale } from 'next-intl/server';
import { GetProductByHandleQuery } from '@shared/lib/shopify/types/storefront.generated';

const query = `#graphql
  query getProductByHandle($handle: String!, $variant: ID) {
    product(handle: $handle, id: $variant) {
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
`;

export const getProduct = async ({ handle }: { handle: string }) => {
  const locale = await getLocale();
  const product = await storefrontClient.request<GetProductByHandleQuery>({
    query,
    variables: { handle },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  if (!product.product) throw new Error('Product not found');
  return product;
};
