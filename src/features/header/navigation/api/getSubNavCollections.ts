import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetSubMenuQuery } from '@shared/lib/shopify/types/storefront.generated';
import { getLocale } from 'next-intl/server';

const query = `#graphql
  query GetSubMenu ($handle: String!) {
    menu(handle: $handle) {
      handle
      items {
        title
        url
        resourceId
      }
    }
  }
`;

export const getSubNavCollections = async ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  const locale = await getLocale();

  const responce = await storefrontClient.request<
    GetSubMenuQuery,
    {
      handle: string;
    }
  >({
    query,
    variables: {
      handle: params.slug,
    },
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
};
