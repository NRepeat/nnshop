import { storefrontClient } from '@shared/lib/shopify/client';
import {
  PredictiveSearchQuery,
  PredictiveSearchQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import {
  PredictiveSearchLimitScope,
  SearchableField,
} from '@shared/lib/shopify/types/storefront.types';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';

import { NextRequest, NextResponse } from 'next/server';

const PREDICTIVE_SEARCH_QUERY = `#graphql
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
        featuredImage {
          url
        }
        metafields(identifiers: [
        {key: "znizka", namespace: "custom"}]){
          key
          value
        }
          priceRange {
             maxVariantPrice{
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

export async function POST(req: NextRequest) {
  const { query, locale } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await storefrontClient.request<
      PredictiveSearchQuery,
      PredictiveSearchQueryVariables
    >({
      query: PREDICTIVE_SEARCH_QUERY,
      language: (locale?.toUpperCase() as StorefrontLanguageCode) || 'UK',
      variables: {
        limit: 10,
        limitScope: 'EACH' as PredictiveSearchLimitScope,
        query,
        searchableFields: [
          'TITLE',
          'VARIANTS_TITLE',
          'VARIANTS_SKU',
          'VENDOR',
          'PRODUCT_TYPE',
        ] as SearchableField[],
      },
    });
    return NextResponse.json(response.predictiveSearch);
  } catch (error) {
    console.error('Error fetching predictive search results:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
