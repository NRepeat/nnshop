import { storefrontClient } from '@shared/lib/shopify/client';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { GetProductByHandleQuery } from '@shared/lib/shopify/types/storefront.generated';
import { cacheLife, cacheTag } from 'next/cache';
import { DISCOUNT_METAFIELD_KEY } from '@shared/config/shop';

export const PRODUCT_METAFIELDS_FRAGMENT = `#graphql
  fragment ProductMetafields on Product {
    metafields(
      identifiers: [
        {key: "recommended_products", namespace: "custom"},
        {key: "bound-products", namespace: "custom"},
        {key: "attributes", namespace: "custom"},
        {key: "${DISCOUNT_METAFIELD_KEY}", namespace: "custom"},
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
        {key: "gender", namespace: "custom"},
        {key: "atr-material", namespace: "custom"},
        {key: "atr-sclad", namespace: "custom"},
        {key: "atr-pidkladka", namespace: "custom"},
        {key: "atr-sezon", namespace: "custom"},
        {key: "atr-pidoshva", namespace: "custom"},
        {key: "atr-cabluk", namespace: "custom"},
        {key: "atr-visota-pidoshva", namespace: "custom"},
        {key: "atr-carian-brendy", namespace: "custom"},
        {key: "atr-kraina-virobniztva", namespace: "custom"},
        {key: "atr-osoblivosty", namespace: "custom"}
      ]
    ) {
      id
      key
      value
    }
  }
`;
export const GET_PROXY_PRODUCT_QUERY = `#graphql
  query getProductByHandle($handle: String!, $variant: ID) {
  
    product(handle: $handle, id: $variant) {
      id
      title
      handle
    }
  }`;
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
      
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      genderMetafield: metafield(namespace: "custom", key: "gender") {
        value
        references(first: 5) {
          edges {
            node {
              ... on Metaobject {
                handle
              }
            }
          }
        }
      }

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
            sku
            quantityAvailable
            currentlyNotInStock
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
  'use cache';
  cacheLife('max');
  cacheTag(`product:${handle}`);
  cacheTag(handle);
  try {
    const targetLocale = locale === 'ru' ? 'UK' : 'RU';
    const product = await storefrontClient.request<
      GetProductByHandleQuery,
      { handle: string }
    >({
      query: GET_PRODUCT_QUERY,
      variables: { handle },
      language: locale.toUpperCase() as StorefrontLanguageCode,
    });
    if (!product.product) {
      console.warn(`Product not found: ${handle}`);
      return {
        originProduct: null,
        alternateHandle: null,
      };
    }

    // The returned handle must match the requested handle exactly.
    // If they differ, the requested handle belongs to another locale —
    // this URL should 404 for the current locale.
    if (product.product.handle !== handle) {
      return {
        originProduct: null,
        alternateHandle: product.product.handle,
      };
    }
    const alternateRequest = storefrontClient.request<
      {
        product: { handle: string };
      },
      { id: string }
    >({
      query: `#graphql
        query getHandleById($id: ID!) {
          product(id: $id) {
            handle
          }
        }`,
      variables: { id: product.product.id },
      language: targetLocale as StorefrontLanguageCode,
    });

    const alternateData = await alternateRequest;
    return {
      originProduct: product.product,
      alternateHandle: alternateData.product?.handle,
    };
  } catch (error) {
    console.error(`Failed to fetch product ${handle}:`, error);
    return {
      originProduct: null,
      alternateHandle: null,
    };
  }
};
