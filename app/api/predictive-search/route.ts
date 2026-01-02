import { storefrontClient } from '@shared/lib/shopify/client';
import { PredictiveSearchQuery } from '@shared/lib/shopify/types/storefront.generated';
import { NextRequest, NextResponse } from 'next/server';

const PREDICTIVE_SEARCH_QUERY = `#graphql
  query predictiveSearch(
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $query: String!
    $searchableFields: [SearchableField!]
  ) {
    predictiveSearch(
      limit: $limit
      limitScope: $limitScope
      query: $query
      searchableFields: $searchableFields
    ) {
      products {
        id
        title
        featuredImage {
          url
        }
        variants(first: 1) {
          edges {
            node {
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const response = await storefrontClient.request<PredictiveSearchQuery>(
      PREDICTIVE_SEARCH_QUERY,
      {
        variables: {
          limit: 10,
          limitScope: 'PRODUCT',
          query,
          searchableFields: ['TITLE'],
        },
      },
    );
    return NextResponse.json(response.predictiveSearch);
  } catch (error) {
    console.error('Error fetching predictive search results:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
