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
        Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
      >;
    }
  >;
};

interface GeneratedQueryTypes {
  '#graphql\n  query GetMainMenu {\n    menu(handle: "main-menu") {\n      handle\n      items {\n        title\n        url\n        resourceId\n      }\n    }\n  }\n': {
    return: GetMainMenuQuery;
    variables: GetMainMenuQueryVariables;
  };
}

interface GeneratedMutationTypes {}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
