'use server';
import { toFilterSlug } from '@shared/lib/filterSlug';
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';

import {
  GetCollectionQuery,
  GetCollectionFiltersQuery,
  GetCollectionsHandlesQuery,
  GetCollectionsHandlesQueryVariables,
  GetCollectionFiltersQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';
import { ProductFilter } from '@shared/lib/shopify/types/storefront.types';
import { cacheLife, cacheTag } from 'next/cache';
import { GetCollectionWithProducts } from './query';

const GetCollectionFilters = `
#graphql
query GetCollectionFilters($handle: String!, $filters: [ProductFilter!]) {
    collection(handle: $handle) {
        products(first: 1, filters: $filters){
            filters {
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
        }
    }
}
`;

const GET_COLLECTION_SLUGS = `
  #graphql
  query GetCollectionsHandles{
    collections(first:250) {
    	edges{
        node{
          handle
        }
      }
    }
  }
  `;
export const getProxyCollectionSlugs = async () => {
  const handlesSet = new Set<string>();
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    const [ruCollection, ukCollection] = await Promise.all(
      locales.map((language) =>
        storefrontClient.request<
          GetCollectionsHandlesQuery,
          GetCollectionsHandlesQueryVariables
        >({
          query: GET_COLLECTION_SLUGS,
          language,
        }),
      ),
    );

    if (!ruCollection || !ukCollection) {
      throw new Error('No collections found');
    }

    ruCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );
    ukCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );

    return Array.from(handlesSet);
  } catch (error) {
    console.error('Error fetching collection slugs:', error);
    throw new Error("Can't fetch collection slugs");
  }
};
export const getCollectionSlugs = async () => {
  'use cache';
  cacheLife('max');
  cacheTag('collections');

  const handlesSet = new Set<string>();
  const locales: StorefrontLanguageCode[] = ['RU', 'UK'];
  try {
    const [ruCollection, ukCollection] = await Promise.all(
      locales.map((language) =>
        storefrontClient.request<
          GetCollectionsHandlesQuery,
          GetCollectionsHandlesQueryVariables
        >({
          query: GET_COLLECTION_SLUGS,
          language,
        }),
      ),
    );

    if (!ruCollection || !ukCollection) {
      throw new Error('No collections found');
    }

    ruCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );
    ukCollection.collections.edges.forEach((edge) =>
      handlesSet.add(edge.node.handle),
    );

    return Array.from(handlesSet);
  } catch (error) {
    console.error('Error fetching collection slugs:', error);
    throw new Error("Can't fetch collection slugs");
  }
};

export const getCollectionFilters = async ({
  handle,
  locale,
  filters = [{ available: true }],
}: {
  handle: string;
  locale: string;
  filters?: ProductFilter[];
}) => {
  'use cache';
  cacheLife('max');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);
  const collection = await storefrontClient.request<
    GetCollectionFiltersQuery,
    GetCollectionFiltersQueryVariables
  >({
    query: GetCollectionFilters,
    variables: { handle, filters },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  return collection.collection?.products.filters;
};

export const getCollection = async ({
  handle,
  searchParams,
  first,
  after,
  last,
  before,
  locale,
}: {
  handle: string;
  searchParams?: { [key: string]: string | string[] | undefined };
  first?: number;
  after?: string;
  last?: number;
  before?: string;
  locale: string;
}) => {
  'use cache';
  cacheLife('max');
  cacheTag(`collection:${handle}`);
  cacheTag(handle);

  if (!locale) throw new Error('getCollection: locale is required');
  if (!handle) throw new Error('getCollection: handle is required');

  const filters: ProductFilter[] = [{ available: true }];
  if (searchParams) {
    const filterDefinitions = await getCollectionFilters({ handle, locale });
    if (filterDefinitions) {
      for (const [key, value] of Object.entries(searchParams)) {
        if (key === 'minPrice' || key === 'maxPrice' || key === 'sort')
          continue;

        const definition = filterDefinitions.find((f) => {
          const segment = f.id.split('.').pop() || '';
          return toFilterSlug(segment) === key || f.id.endsWith(`.${key}`);
        });
        if (definition) {
          const values = Array.isArray(value)
            ? value
            : (value as string).split(';');
          values.forEach((v) => {
            const filterValue = definition.values.find(
              (def) => toFilterSlug(def.label) === v,
            );
            if (filterValue) filters.push(JSON.parse(filterValue.input));
          });
        }
      }
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      const priceFilter: ProductFilter = { price: {} };
      if (searchParams.minPrice)
        priceFilter.price!.min = parseFloat(searchParams.minPrice as string);
      if (searchParams.maxPrice)
        priceFilter.price!.max = parseFloat(searchParams.maxPrice as string);
      filters.push(priceFilter);
    }
  }

  const sort = searchParams?.sort as string | undefined;

  let sortKey: string | undefined = undefined;
  let reverse = false;
  switch (sort) {
    case 'price-asc':
      sortKey = 'PRICE';
      reverse = false;
      break;
    case 'price-desc':
      sortKey = 'PRICE';
      reverse = true;
      break;
    case 'created-desc':
      sortKey = 'CREATED';
      reverse = true;
      break;
  }

  const collection = await storefrontClient.request<
    GetCollectionQuery,
    {
      handle: string;
      filters?: ProductFilter[];
      first?: number;
      after?: string;
      last?: number;
      before?: string;
      sortKey?: string;
      reverse?: boolean;
    }
  >({
    query: GetCollectionWithProducts,
    variables: {
      handle,
      filters,
      first,
      after,
      last,
      before,
      sortKey,
      reverse,
    },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });

  const collectionId = collection.collection?.id;
  if (!collectionId) {
    return { collection, alternateHandle: '' };
  }

  const targetLocale = locale === 'ru' ? 'UK' : 'RU';

  const alternateRequest = await storefrontClient.request<
    { collection: { handle: string } },
    { id: string }
  >({
    query: `#graphql
      query getCollectionHandleById($id: ID!) {
        collection(id: $id) {
          handle
        }
      }`,
    variables: { id: collectionId },
    language: targetLocale as StorefrontLanguageCode,
  });

  return {
    collection,
    alternateHandle: alternateRequest.collection?.handle ?? '',
  };
};
