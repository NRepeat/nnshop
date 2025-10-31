/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type GetCollectionQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
}>;

export type GetCollectionQuery = {
  collection?: StorefrontTypes.Maybe<
    Pick<
      StorefrontTypes.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      products: {
        edges: Array<{
          node: Pick<
            StorefrontTypes.Product,
            'id' | 'title' | 'handle' | 'productType' | 'vendor'
          > & {
            options: Array<
              Pick<StorefrontTypes.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontTypes.ProductOptionValue, 'name'>
                >;
              }
            >;
            priceRange: {
              maxVariantPrice: Pick<
                StorefrontTypes.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            featuredImage?: StorefrontTypes.Maybe<
              Pick<
                StorefrontTypes.Image,
                'altText' | 'height' | 'width' | 'url'
              >
            >;
          };
        }>;
      };
      image?: StorefrontTypes.Maybe<
        Pick<StorefrontTypes.Image, 'url' | 'altText'>
      >;
    }
  >;
};

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
  '#graphql\n  query GetCollection($handle: String!, $first: Int!) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      description\n      products(first: $first) {\n        edges {\n          node {\n            id\n            title\n            handle\n            productType\n            options{\n              name\n              optionValues{\n                name\n              }\n            }\n            vendor\n            priceRange{\n              maxVariantPrice{\n                amount\n                currencyCode\n              }\n\n            }\n            featuredImage {\n              altText\n              height\n              width\n              url\n            }\n          }\n        }\n      }\n      image {\n        url\n        altText\n      }\n    }\n  }\n': {
    return: GetCollectionQuery;
    variables: GetCollectionQueryVariables;
  };
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
