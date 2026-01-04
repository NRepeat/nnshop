import { storefrontClient } from './client';
import { StorefrontLanguageCode } from '../clients/types';
import { ResolveLinkQuery } from './types/storefront.generated';
const queries = {
  collection: {
    query: `#graphql
      query ResolveLink($id: ID!) @inContext(language: RU) { collection(id: $id) { handle ,title,image{url} } }`,
    variables: { id: 'gid://shopify/Collection/' },
  },
};

export const resolveShopifyLink = async (
  sybPath: keyof typeof queries,
  path: string,
  locale: string,
) => {
  const res = (await storefrontClient.request({
    query: queries[sybPath].query,
    variables: { id: queries[sybPath].variables.id + path },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  })) as ResolveLinkQuery;

  return { ...res.collection, locale };
};
