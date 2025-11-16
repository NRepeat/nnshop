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

export type GetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;

export type GetProductByHandleQuery = {
  product?: StorefrontTypes.Maybe<
    Pick<
      StorefrontTypes.Product,
      | 'id'
      | 'title'
      | 'handle'
      | 'description'
      | 'descriptionHtml'
      | 'vendor'
      | 'productType'
    > & {
      priceRange: {
        maxVariantPrice: Pick<
          StorefrontTypes.MoneyV2,
          'amount' | 'currencyCode'
        >;
        minVariantPrice: Pick<
          StorefrontTypes.MoneyV2,
          'amount' | 'currencyCode'
        >;
      };
      options: Array<
        Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>
      >;
      variants: {
        edges: Array<{
          node: Pick<
            StorefrontTypes.ProductVariant,
            'id' | 'title' | 'availableForSale'
          > & {
            price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>;
            compareAtPrice?: StorefrontTypes.Maybe<
              Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>
            >;
            selectedOptions: Array<
              Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>
            >;
            image?: StorefrontTypes.Maybe<
              Pick<
                StorefrontTypes.Image,
                'url' | 'altText' | 'width' | 'height'
              >
            >;
          };
        }>;
      };
      images: {
        edges: Array<{
          node: Pick<
            StorefrontTypes.Image,
            'url' | 'altText' | 'width' | 'height'
          >;
        }>;
      };
      featuredImage?: StorefrontTypes.Maybe<
        Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>
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
  '#graphql\n  query getProductByHandle($handle: String!) {\n    product(handle: $handle) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      vendor\n      productType\n      priceRange {\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      options(first: 10) {\n        id\n        name\n        values\n      }\n      variants(first: 50) {\n        edges {\n          node {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            compareAtPrice {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n      images(first: 10) {\n        edges {\n          node {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      featuredImage {\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n': {
    return: GetProductByHandleQuery;
    variables: GetProductByHandleQueryVariables;
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
