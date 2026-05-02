export const PREDICTIVE_SEARCH_QUERY = `#graphql
  query predictiveSearch(
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $query: String!
    $searchableFields: [SearchableField!]
    $types: [PredictiveSearchType!]
  ) {
    predictiveSearch(
      limit: $limit
      limitScope: $limitScope
      query: $query
      searchableFields: $searchableFields
      types: $types
    ) {
      products {
        id
        title
        handle
        metafields(identifiers: [{ key: "znizka", namespace: "custom" }]) {
          key
          value
        }
        priceRange {
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
        tags
        vendor
        options {
          name
          optionValues {
            name
          }
        }
        media(first: 20) {
          edges {
            node {
              previewImage {
                url
                width
                height
                altText
              }
            }
          }
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
      }
    }
  }
`;

export const DEFAULT_PREDICTIVE_LIMIT = 10;

export const SEARCHABLE_FIELDS = [
  'TITLE',
  'VARIANTS_TITLE',
  'VARIANTS_SKU',
  'VENDOR',
  'PRODUCT_TYPE',
] as const;
