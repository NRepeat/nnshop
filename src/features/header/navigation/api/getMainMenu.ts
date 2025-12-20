import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetMainMenuQuery } from '@shared/lib/shopify/types/storefront.generated';
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
  gender,
  locale,
}: {
  gender: string;
  locale: string;
  signal?: AbortSignal;
}) => {
  'use cache';
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
  const genderMap = {
    man: 'gid://shopify/Collection/323100639394',
    woman: 'gid://shopify/Collection/323100967074',
  };
  let mainMenu;
  if (genderMap[gender as keyof typeof genderMap]) {
    mainMenu =
      responce.menu?.items
        .filter(
          (item) =>
            item.resourceId === genderMap[gender as keyof typeof genderMap],
        )
        .map((item) => ({
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
  } else {
    mainMenu =
      responce.menu?.items
        .filter((item) => item.resourceId === genderMap['woman'])
        .map((item) => ({
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
  }

  return mainMenu;
};
