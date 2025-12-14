import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetMainMenuQuery } from '@shared/lib/shopify/types/storefront.generated';
import { getLocale } from 'next-intl/server';
const query = `#graphql
  query GetMainMenu {
    menu(handle: "shop-main-menu") {
      handle
      items {
        title
        url
        resourceId
          items {
            title
            url
            resourceId
          }
      }
    }
  }
`;

export const getMainMenu = async () => {
  const locale = await getLocale();
  const responce = await storefrontClient.request<
    GetMainMenuQuery,
    {
      handle: string;
      language: StorefrontLanguageCode;
    }
  >({
    query,
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });
  const mainMenu =
    responce.menu?.items.reverse().map((item) => ({
      id: item.resourceId,
      title: item.title,
      url: `/collection/${item.url?.split('/').pop()}`,
      items: item.items?.map((subItem) => ({
        id: subItem.resourceId,
        title: subItem.title,
        url: `/collection/${subItem.url?.split('/').pop()}`,
      })),
    })) || [];
  return mainMenu;
};
