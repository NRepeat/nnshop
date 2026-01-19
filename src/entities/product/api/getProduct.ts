import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { getLocale } from 'next-intl/server';
import { GetProductByHandleQuery } from '@shared/lib/shopify/types/storefront.generated';

export const PRODUCT_METAFIELDS_FRAGMENT = `#graphql
  fragment ProductMetafields on Product {
    metafields(
      identifiers: [
        {key: "recommended_products", namespace: "custom"},
        {key: "bound-products", namespace: "custom"},
        {key: "attributes", namespace: "custom"},
        {key: "znizka", namespace: "custom"},
        {key: "color", namespace: "custom"},
        {key: "kolektsiya", namespace: "custom"},
        {key: "styl", namespace: "custom"},
        {key: "krayina", namespace: "custom"},
        {key: "pidoshva", namespace: "custom"},
        {key: "posadka", namespace: "custom"},
        {key: "osoblyvosti", namespace: "custom"},
        {key: "tip", namespace: "custom"},
        {key: "kategorija", namespace: "custom"},
        {key: "vysota-pidoshvy", namespace: "custom"},
        {key: "zastibka", namespace: "custom"},
        {key: "kabluk", namespace: "custom"},
        {key: "napovnjuvach", namespace: "custom"},
        {key: "sostav", namespace: "custom"},
        {key: "material", namespace: "custom"},
        {key: "rozmir", namespace: "custom"},
        {key: "sezon", namespace: "custom"},
        {key: "pidkladka", namespace: "custom"},
        {key: "gender", namespace: "custom"}
      ]
    ) {
      id
      key
      value
    }
  }
`;

export const GET_PRODUCT_QUERY = `#graphql
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
      options(first: 250) {
        id
        name
        values
      }
      ...ProductMetafields
      variants(first: 250) {
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
            metafields(identifiers: {key: "at_the_fitting", namespace: "custom"}) {
              id
              key
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
      images(first: 250) {
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
  ${PRODUCT_METAFIELDS_FRAGMENT}
`;
export const getProduct = async ({
  handle,
  locale,
}: {
  handle: string;
  locale: string;
}) => {
  const product = await storefrontClient.request<
    GetProductByHandleQuery,
    { handle: string }
  >({
    query: GET_PRODUCT_QUERY,
    variables: { handle },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  if (!product.product) throw new Error('Product not found');
  return product;
};
