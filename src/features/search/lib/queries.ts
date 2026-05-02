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

export const SEARCH_QUERY = `#graphql
  query SearchProducts(
    $query: String!
    $first: Int
    $after: String
    $productFilters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
  ) {
    search(
      query: $query
      first: $first
      after: $after
      productFilters: $productFilters
      sortKey: $sortKey
      reverse: $reverse
      types: [PRODUCT]
      prefix: LAST
      unavailableProducts: HIDE
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      productFilters {
        id
        label
        type
        values {
          id
          label
          count
          input
        }
      }
      edges {
        cursor
        node {
          __typename
          ... on Product {
            id
            title
            handle
            availableForSale
            productType
            vendor
            totalInventory
            tags
            createdAt
            metafield(namespace: "custom", key: "znizka") {
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
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  selectedOptions { name value }
                }
              }
            }
            options {
              name
              optionValues { name }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            featuredImage {
              url
              altText
              width
              height
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
          }
        }
      }
    }
  }
`;

export const DEFAULT_SEARCH_PAGE_SIZE = 24;
