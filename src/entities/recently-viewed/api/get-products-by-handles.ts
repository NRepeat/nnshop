import { storefrontClient } from '@shared/lib/shopify/client';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

const PRODUCT_FIELDS = `
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
  sortOrder: metafield(namespace:"custom",key:"sort_order"){
    value
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
`;

export const getProductsByHandles = async (
  handles: string[],
  locale: string,
): Promise<Product[]> => {
  if (handles.length === 0) return [];

  const queryArgs = handles.map((_, i) => `$h${i}: String!`).join(', ');
  const queryBody = handles
    .map((_, i) => `p${i}: product(handle: $h${i}) { ${PRODUCT_FIELDS} }`)
    .join('\n');
  const query = `#graphql\n  query getProductsByHandles(${queryArgs}) {\n    ${queryBody}\n  }`;

  const variables = Object.fromEntries(handles.map((h, i) => [`h${i}`, h]));

  try {
    const response = await storefrontClient.request<
      Record<string, Product | null>,
      typeof variables
    >({
      query,
      variables,
      language: locale.toUpperCase() as StorefrontLanguageCode,
      cache: 'no-store',
    });
   
    return handles
      .map((_, i) => (response[`p${i}`]))
      .filter((p) => !!p)
  } catch (error) {
    console.error('[getProductsByHandles] failed', {
      step: 'shopify-by-handles',
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
};
