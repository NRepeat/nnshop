import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { getLocale } from 'next-intl/server';
const query = `#graphql
  query GetMainMenu {
    menu(handle: "main-menu") {
      handle
      items {
        title
        url
        resourceId
      }
    }
  }
`;

export const getMainMenu = async () => {
  const locale = await getLocale();

  const responce = await storefrontClient.request({
    query,
    language: locale.toUpperCase() as StorefrontLanguageCode,
  });

  const mainMenu = responce.menu.items.map((item) => ({
    id: item.resourceId,
    title: item.title,
    url: item.url,
  }));
  return mainMenu;
};
