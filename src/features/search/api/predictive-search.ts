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
import {
  PREDICTIVE_SEARCH_QUERY,
  DEFAULT_PREDICTIVE_LIMIT,
  SEARCHABLE_FIELDS,
} from '../lib/queries';

export async function predictiveSearch(args: {
  query: string;
  locale?: string;
  limit?: number;
  searchableFields?: readonly SearchableField[];
}) {
  const { query, locale, limit, searchableFields } = args;
  const response = await storefrontClient.request<
    PredictiveSearchQuery,
    PredictiveSearchQueryVariables
  >({
    query: PREDICTIVE_SEARCH_QUERY,
    language: (locale?.toUpperCase() as StorefrontLanguageCode) || 'UK',
    variables: {
      limit: limit ?? DEFAULT_PREDICTIVE_LIMIT,
      limitScope: 'EACH' as PredictiveSearchLimitScope,
      query,
      searchableFields:
        (searchableFields as SearchableField[]) ??
        (SEARCHABLE_FIELDS as unknown as SearchableField[]),
    },
  });
  return response.predictiveSearch;
}
