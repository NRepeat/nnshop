/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type GetMainMenuQueryVariables = StorefrontTypes.Exact<{
  [key: string]: never;
}>;

export type GetMainMenuQuery = {
  menu?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Menu, 'handle'> & {
      items: Array<
        Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'> & {
          items: Array<
            Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
          >;
        }
      >;
    }
  >;
};

export type GetSubMenuQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;

export type GetSubMenuQuery = {
  menu?: StorefrontTypes.Maybe<
    Pick<StorefrontTypes.Menu, 'handle'> & {
      items: Array<
        Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
      >;
    }
  >;
};

interface GeneratedQueryTypes {
  '#graphql\n  query GetMainMenu {\n    menu(handle: "main-menu") {\n      handle\n      items {\n        title\n        url\n        resourceId\n          items {\n            title\n            url\n            resourceId\n          }\n      }\n    }\n  }\n': {
    return: GetMainMenuQuery;
    variables: GetMainMenuQueryVariables;
  };
  '#graphql\n  query GetSubMenu ($handle: String!) {\n    menu(handle: $handle) {\n      handle\n      items {\n        title\n        url\n        resourceId\n      }\n    }\n  }\n': {
    return: GetSubMenuQuery;
    variables: GetSubMenuQueryVariables;
  };
}

interface GeneratedMutationTypes {}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
