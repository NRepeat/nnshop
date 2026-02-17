import { StorefrontLanguageCode } from '@shared/lib/clients/types';
import { storefrontClient } from '@shared/lib/shopify/client';
import { GetMainMenuQuery } from '@shared/lib/shopify/types/storefront.generated';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
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

export const getMainMenu = async ({ locale }: { locale: string }) => {
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
      title: decodeHtmlEntities(item.title),
      url: `/${item.url?.split('/').pop()}`,
      items:
        item.items?.map((subItem) => ({
          id: subItem.resourceId,
          title: decodeHtmlEntities(subItem.title),
          url: `/${subItem.url?.split('/').pop()}`,
          items:
            subItem.items?.map((subItem) => ({
              id: subItem.resourceId,
              title: decodeHtmlEntities(subItem.title),
              url: `/${subItem.url?.split('/').pop()}`,
            })) || [],
        })) || [],
    })) || [];

  return mainMenu;
};
