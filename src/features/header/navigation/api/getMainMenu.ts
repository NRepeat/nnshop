'use server'
import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetMainMenuQuery } from '@shared/lib/shopify/types/storefront.generated';
// import { cacheLife } from 'next/cache';
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
                          items{
                             title
                             url
                             resourceId
                             items {
                                 title
                                 url
                                 resourceId
                             }
                          }           }
       }
     }
   }
`;

export const getMainMenu = async ({
  locale,
}: {
  locale: string;
}) => {
  // 'use cache'
  // cacheLife("default")
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
    responce.menu?.items.map((item) => ({
      id: item.resourceId,
      title: item.title,
      url: `/collection/${item.url?.split('/').pop()}`,
      items:
        item.items?.map((subItem) => ({
          id: subItem.resourceId,
          title: subItem.title,
          url: `/collection/${subItem.url?.split('/').pop()}`,
          items:
            subItem.items?.map((subItem) => ({
              id: subItem.resourceId,
              title: subItem.title,
              url: `/collection/${subItem.url?.split('/').pop()}`,
            })) || [],
        })) || [],
    })) || [];

  return mainMenu;
};
