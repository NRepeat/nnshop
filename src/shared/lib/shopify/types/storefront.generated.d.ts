/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types';

export type CartBuyerIdentityUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  buyerIdentity: StorefrontTypes.CartBuyerIdentityInput;
}>;

export type CartBuyerIdentityUpdateMutation = {
  cartBuyerIdentityUpdate?: StorefrontTypes.Maybe<{
    cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id'>>;
    userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>>;
  }>;
};

export type CartQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;

export type CartQuery = {
  cart?: StorefrontTypes.Maybe<
    Pick<
      StorefrontTypes.Cart,
      | 'id'
      | 'checkoutUrl'
      | 'totalQuantity'
      | 'note'
      | 'createdAt'
      | 'updatedAt'
    > & {
      cost: {
        totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>;
        subtotalAmount: Pick<
          StorefrontTypes.MoneyV2,
          'amount' | 'currencyCode'
        >;
        totalTaxAmount?: StorefrontTypes.Maybe<
          Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>
        >;
      };
      lines: {
        edges: Array<{
          node:
            | (Pick<StorefrontTypes.CartLine, 'id' | 'quantity'> & {
                merchandise: Pick<
                  StorefrontTypes.ProductVariant,
                  'id' | 'title'
                > & {
                  image?: StorefrontTypes.Maybe<
                    Pick<
                      StorefrontTypes.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontTypes.Product,
                    'id' | 'title' | 'handle'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>
                  >;
                };
                cost: {
                  totalAmount: Pick<
                    StorefrontTypes.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontTypes.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
                attributes: Array<
                  Pick<StorefrontTypes.Attribute, 'key' | 'value'>
                >;
              })
            | (Pick<
                StorefrontTypes.ComponentizableCartLine,
                'id' | 'quantity'
              > & {
                merchandise: Pick<
                  StorefrontTypes.ProductVariant,
                  'id' | 'title'
                > & {
                  image?: StorefrontTypes.Maybe<
                    Pick<
                      StorefrontTypes.Image,
                      'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  product: Pick<
                    StorefrontTypes.Product,
                    'id' | 'title' | 'handle'
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>
                  >;
                };
                cost: {
                  totalAmount: Pick<
                    StorefrontTypes.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                  amountPerQuantity: Pick<
                    StorefrontTypes.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                };
                attributes: Array<
                  Pick<StorefrontTypes.Attribute, 'key' | 'value'>
                >;
              });
        }>;
      };
      attributes: Array<Pick<StorefrontTypes.Attribute, 'key' | 'value'>>;
      discountCodes: Array<
        Pick<StorefrontTypes.CartDiscountCode, 'code' | 'applicable'>
      >;
      delivery: {
        addresses: Array<
          Pick<StorefrontTypes.CartSelectableAddress, 'id' | 'selected'> & {
            address: Pick<
              StorefrontTypes.CartDeliveryAddress,
              | 'address1'
              | 'address2'
              | 'city'
              | 'countryCode'
              | 'firstName'
              | 'lastName'
              | 'phone'
              | 'zip'
            >;
          }
        >;
      };
      buyerIdentity: Pick<
        StorefrontTypes.CartBuyerIdentity,
        'email' | 'phone' | 'countryCode'
      > & {
        customer?: StorefrontTypes.Maybe<
          Pick<
            StorefrontTypes.Customer,
            'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
          >
        >;
      };
    }
  >;
};

export type CartDeliveryAddressesAddMutationVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
  addresses:
    | Array<StorefrontTypes.CartSelectableAddressInput>
    | StorefrontTypes.CartSelectableAddressInput;
}>;

export type CartDeliveryAddressesAddMutation = {
  cartDeliveryAddressesAdd?: StorefrontTypes.Maybe<{
    userErrors: Array<
      Pick<StorefrontTypes.CartUserError, 'message' | 'code' | 'field'>
    >;
    warnings: Array<
      Pick<StorefrontTypes.CartWarning, 'message' | 'code' | 'target'>
    >;
    cart?: StorefrontTypes.Maybe<
      Pick<StorefrontTypes.Cart, 'id'> & {
        delivery: {
          addresses: Array<
            Pick<
              StorefrontTypes.CartSelectableAddress,
              'id' | 'selected' | 'oneTimeUse'
            > & {
              address: Pick<
                StorefrontTypes.CartDeliveryAddress,
                | 'firstName'
                | 'lastName'
                | 'company'
                | 'address1'
                | 'address2'
                | 'city'
                | 'provinceCode'
                | 'zip'
                | 'countryCode'
              >;
            }
          >;
        };
      }
    >;
  }>;
};

export type GetCollectionQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  filters?: StorefrontTypes.InputMaybe<
    Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter
  >;
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  after?: StorefrontTypes.InputMaybe<
    StorefrontTypes.Scalars['String']['input']
  >;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  before?: StorefrontTypes.InputMaybe<
    StorefrontTypes.Scalars['String']['input']
  >;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductCollectionSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<
    StorefrontTypes.Scalars['Boolean']['input']
  >;
}>;

export type GetCollectionQuery = {
  collection?: StorefrontTypes.Maybe<
    Pick<
      StorefrontTypes.Collection,
      'id' | 'title' | 'handle' | 'description'
    > & {
      image?: StorefrontTypes.Maybe<
        Pick<StorefrontTypes.Image, 'url' | 'altText'>
      >;
      products: {
        pageInfo: Pick<
          StorefrontTypes.PageInfo,
          'hasNextPage' | 'hasPreviousPage' | 'endCursor' | 'startCursor'
        >;
        edges: Array<{
          node: Pick<
            StorefrontTypes.Product,
            | 'id'
            | 'title'
            | 'handle'
            | 'availableForSale'
            | 'productType'
            | 'vendor'
            | 'totalInventory'
            | 'tags'
          > & {
            variants: {
              edges: Array<{
                node: Pick<
                  StorefrontTypes.ProductVariant,
                  'id' | 'title' | 'availableForSale' | 'quantityAvailable'
                > & {
                  price: Pick<
                    StorefrontTypes.MoneyV2,
                    'amount' | 'currencyCode'
                  >;
                  compareAtPrice?: StorefrontTypes.Maybe<
                    Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  selectedOptions: Array<
                    Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>
                  >;
                };
              }>;
            };
            options: Array<
              Pick<StorefrontTypes.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontTypes.ProductOptionValue, 'name'>
                >;
              }
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontTypes.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontTypes.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            featuredImage?: StorefrontTypes.Maybe<
              Pick<
                StorefrontTypes.Image,
                'url' | 'altText' | 'width' | 'height'
              >
            >;
            media: {
              edges: Array<{
                node: {
                  previewImage?: StorefrontTypes.Maybe<
                    Pick<
                      StorefrontTypes.Image,
                      'url' | 'width' | 'height' | 'altText'
                    >
                  >;
                };
              }>;
            };
          };
        }>;
        filters: Array<
          Pick<StorefrontTypes.Filter, 'id' | 'label' | 'type'> & {
            values: Array<
              Pick<
                StorefrontTypes.FilterValue,
                'id' | 'label' | 'count' | 'input'
              >
            >;
          }
        >;
      };
    }
  >;
};

export type GetCollectionFiltersQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;

export type GetCollectionFiltersQuery = {
  collection?: StorefrontTypes.Maybe<{
    products: {
      filters: Array<
        Pick<StorefrontTypes.Filter, 'id' | 'label' | 'type'> & {
          values: Array<
            Pick<
              StorefrontTypes.FilterValue,
              'id' | 'label' | 'count' | 'input'
            >
          >;
        }
      >;
    };
  }>;
};

export type GetCollectionsHandlesQueryVariables = StorefrontTypes.Exact<{
  [key: string]: never;
}>;

export type GetCollectionsHandlesQuery = {
  collections: {
    edges: Array<{ node: Pick<StorefrontTypes.Collection, 'handle'> }>;
  };
};

export type GetCollectionsQueryVariables = StorefrontTypes.Exact<{
  [key: string]: never;
}>;

export type GetCollectionsQuery = {
  collections: {
    edges: Array<{ node: Pick<StorefrontTypes.Collection, 'handle'> }>;
  };
};

export type GetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  variant?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['ID']['input']>;
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

export type GetProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
}>;

export type GetProductsQuery = {
  products: {
    edges: Array<{
      node: Pick<
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
      };
    }>;
  };
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
            Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'> & {
              items: Array<
                Pick<
                  StorefrontTypes.MenuItem,
                  'title' | 'url' | 'resourceId'
                > & {
                  items: Array<
                    Pick<
                      StorefrontTypes.MenuItem,
                      'title' | 'url' | 'resourceId'
                    >
                  >;
                }
              >;
            }
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
  '\n  #graphql\n  query cart($id: ID!) {\n    cart(id: $id) {\n      id\n      checkoutUrl\n      totalQuantity\n      note\n      createdAt\n      updatedAt\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n        subtotalAmount {\n          amount\n          currencyCode\n        }\n        totalTaxAmount {\n          amount\n          currencyCode\n        }\n      }\n      lines(first: 100) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant {\n                id\n                title\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n                product {\n                  id\n                  title\n                  handle\n                }\n                selectedOptions {\n                  name\n                  value\n                }\n              }\n            }\n            cost {\n              totalAmount {\n                amount\n                currencyCode\n              }\n              amountPerQuantity {\n                amount\n                currencyCode\n              }\n            }\n            attributes {\n              key\n              value\n            }\n          }\n        }\n      }\n      attributes {\n        key\n        value\n      }\n      discountCodes {\n        code\n        applicable\n      }\n      delivery {\n        addresses {\n            id\n            selected\n            address {\n            ... on CartDeliveryAddress {\n            address1\n            address2\n            city\n            countryCode\n            firstName\n            lastName\n            phone\n            zip\n            }\n\n            }\n        }\n      }\n\n      buyerIdentity {\n        email\n        phone\n        countryCode\n        customer {\n          id\n          email\n          firstName\n          lastName\n          displayName\n        }\n\n      }\n    }\n  }\n': {
    return: CartQuery;
    variables: CartQueryVariables;
  };
  '\n  #graphql\n  query GetCollection(\n    $handle: String!\n    $filters: [ProductFilter!]\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n  ) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      description\n      image {\n        url\n        altText\n      }\n\n      products(\n        first: $first\n        last: $last\n        filters: $filters\n        sortKey: $sortKey\n        reverse: $reverse\n        after: $after\n        before: $before\n      ) {\n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          endCursor\n          startCursor\n        }\n        edges {\n          node {\n            id\n            title\n            handle\n            availableForSale\n            productType\n            vendor\n            totalInventory\n            tags\n            variants(first: 250) {\n              edges {\n                node {\n                  id\n                  title\n                  availableForSale\n                  quantityAvailable\n                  price {\n                    amount\n                    currencyCode\n                  }\n                  compareAtPrice {\n                    amount\n                    currencyCode\n                  }\n                  selectedOptions {\n                    name\n                    value\n                  }\n\n                }\n              }\n            }\n            options {\n              name\n              optionValues {\n                name\n              }\n            }\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url\n              altText\n              width\n              height\n            }\n            media(first:20){\n                    edges{\n                      node{\n\n                            previewImage{\n                              url\n                              width\n                              height\n                              altText\n                          }\n                      }\n                    }\n                  }\n          }\n        }\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n      }\n    }\n  }\n': {
    return: GetCollectionQuery;
    variables: GetCollectionQueryVariables;
  };
  '\n#graphql\nquery GetCollectionFilters($handle: String!) {\n    collection(handle: $handle) {\n        products(first: 1){\n            filters {\n                id\n                label\n                type\n                values {\n                    id\n                    label\n                    count\n                    input\n                }\n            }\n        }\n    }\n}\n': {
    return: GetCollectionFiltersQuery;
    variables: GetCollectionFiltersQueryVariables;
  };
  '\n  #graphql\n  query GetCollectionsHandles{\n    collections(first:250) {\n    \tedges{\n        node{\n          handle\n        }\n      }\n    }\n  }\n  ': {
    return: GetCollectionsHandlesQuery;
    variables: GetCollectionsHandlesQueryVariables;
  };
  '#graphql\n  query GetCollections {\n    collections(first: 250) {\n      edges {\n        node {\n          handle\n        }\n      }\n    }\n  }\n': {
    return: GetCollectionsQuery;
    variables: GetCollectionsQueryVariables;
  };
  '#graphql\n  query getProductByHandle($handle: String!, $variant: ID) {\n    product(handle: $handle, id: $variant) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      vendor\n      productType\n      priceRange {\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      options(first: 10) {\n        id\n        name\n        values\n      }\n      variants(first: 50) {\n        edges {\n          node {\n            id\n            title\n            availableForSale\n            price {\n              amount\n              currencyCode\n            }\n            compareAtPrice {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n      images(first: 10) {\n        edges {\n          node {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      featuredImage {\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n': {
    return: GetProductByHandleQuery;
    variables: GetProductByHandleQueryVariables;
  };
  '#graphql\n  query getProducts($first: Int!) {\n    products(first: $first) {\n      edges {\n        node {\n          id\n          title\n          handle\n          description\n          descriptionHtml\n          vendor\n          productType\n          priceRange {\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          options(first: 10) {\n            id\n            name\n            values\n          }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                availableForSale\n                price {\n                  amount\n                  currencyCode\n                }\n                compareAtPrice {\n                  amount\n                  currencyCode\n                }\n                selectedOptions {\n                  name\n                  value\n                }\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n          }\n          images(first: 10) {\n            edges {\n              node {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n          featuredImage {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n': {
    return: GetProductsQuery;
    variables: GetProductsQueryVariables;
  };
  '#graphql\n  query GetMainMenu {\n     menu(handle: "shop-main-menu") {\n       handle\n       items {\n         title\n         url\n         resourceId\n           items {\n             title\n             url\n             resourceId\n                          items{\n                             title\n                             url\n                             resourceId\n                             items {\n                                 title\n                                 url\n                                 resourceId\n                             }\n                          }           }\n       }\n     }\n   }\n': {
    return: GetMainMenuQuery;
    variables: GetMainMenuQueryVariables;
  };
  '#graphql\n  query GetSubMenu ($handle: String!) {\n    menu(handle: $handle) {\n      handle\n      items {\n        title\n        url\n        resourceId\n      }\n    }\n  }\n': {
    return: GetSubMenuQuery;
    variables: GetSubMenuQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '\n  #graphql\n  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {\n    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {\n      cart {\n        id\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: CartBuyerIdentityUpdateMutation;
    variables: CartBuyerIdentityUpdateMutationVariables;
  };
  '\n  #graphql\n  mutation CartDeliveryAddressesAdd($id: ID!, $addresses: [CartSelectableAddressInput!]!) {\n    cartDeliveryAddressesAdd(cartId: $id, addresses: $addresses) {\n      userErrors {\n        message\n        code\n        field\n      }\n      warnings {\n        message\n        code\n        target\n      }\n      cart {\n        id\n        delivery {\n          addresses {\n            id\n            selected\n            oneTimeUse\n            address {\n              ... on CartDeliveryAddress {\n                firstName\n                lastName\n                company\n                address1\n                address2\n                city\n                provinceCode\n                zip\n                countryCode\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CartDeliveryAddressesAddMutation;
    variables: CartDeliveryAddressesAddMutationVariables;
  };
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
