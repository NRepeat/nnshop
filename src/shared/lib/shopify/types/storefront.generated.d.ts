/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontTypes from './storefront.types.d.ts';

export type PredictiveSearchQueryQueryVariables = StorefrontTypes.Exact<{
  limit: StorefrontTypes.Scalars['Int']['input'];
  limitScope: StorefrontTypes.PredictiveSearchLimitScope;
  query: StorefrontTypes.Scalars['String']['input'];
  searchableFields?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.SearchableField> | StorefrontTypes.SearchableField>;
  types?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.PredictiveSearchType> | StorefrontTypes.PredictiveSearchType>;
}>;


export type PredictiveSearchQueryQuery = { predictiveSearch?: StorefrontTypes.Maybe<{ products: Array<(
      Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'tags' | 'vendor'>
      & { metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'value'>>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, options: Array<(
        Pick<StorefrontTypes.ProductOption, 'name'>
        & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
      )>, media: { edges: Array<{ node: { previewImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'width' | 'height' | 'altText'>> } }> }, variants: { edges: Array<{ node: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ) }> } }
    )> }> };

export type PredictiveSearchQueryVariables = StorefrontTypes.Exact<{
  limit: StorefrontTypes.Scalars['Int']['input'];
  limitScope: StorefrontTypes.PredictiveSearchLimitScope;
  query: StorefrontTypes.Scalars['String']['input'];
  searchableFields?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.SearchableField> | StorefrontTypes.SearchableField>;
  types?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.PredictiveSearchType> | StorefrontTypes.PredictiveSearchType>;
}>;


export type PredictiveSearchQuery = { predictiveSearch?: StorefrontTypes.Maybe<{ products: Array<(
      Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'tags' | 'vendor'>
      & { featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'value'>>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, options: Array<(
        Pick<StorefrontTypes.ProductOption, 'name'>
        & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
      )>, media: { edges: Array<{ node: { previewImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'width' | 'height' | 'altText'>> } }> }, variants: { edges: Array<{ node: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
            & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ) }> } }
    )> }> };

export type GetAllProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetAllProductsQuery = { products: { edges: Array<{ node: Pick<StorefrontTypes.Product, 'vendor' | 'id'> }>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type CartLinesForVariantQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type CartLinesForVariantQuery = { cart?: StorefrontTypes.Maybe<{ lines: { edges: Array<{ node: (
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id'> }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id'> }
        ) }> } }> };

export type CartLinesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineUpdateInput> | StorefrontTypes.CartLineUpdateInput;
}>;


export type CartLinesUpdateMutation = { cartLinesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'totalQuantity'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type LinkGetCartQueryVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
}>;


export type LinkGetCartQuery = { cart?: StorefrontTypes.Maybe<{ lines: { nodes: Array<(
        Pick<StorefrontTypes.CartLine, 'quantity'>
        & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id'> }
      ) | (
        Pick<StorefrontTypes.ComponentizableCartLine, 'quantity'>
        & { merchandise: Pick<StorefrontTypes.ProductVariant, 'id'> }
      )> } }> };

export type LinkCartLinesAddMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  lines: Array<StorefrontTypes.CartLineInput> | StorefrontTypes.CartLineInput;
}>;


export type LinkCartLinesAddMutation = { cartLinesAdd?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type LinkCartBuyerIdentityUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  buyerIdentity: StorefrontTypes.CartBuyerIdentityInput;
}>;


export type LinkCartBuyerIdentityUpdateMutation = { cartBuyerIdentityUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type GetCartQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartQuery = { cart?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Cart, 'id' | 'checkoutUrl' | 'totalQuantity' | 'note' | 'createdAt' | 'updatedAt'>
    & { cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, lines: { edges: Array<{ node: (
          Pick<StorefrontTypes.CartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: (
              Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'vendor'>
              & { metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'value'>>> }
            ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ), cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, discountAllocations: Array<{ discountedAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }>, attributes: Array<Pick<StorefrontTypes.Attribute, 'key' | 'value'>> }
        ) | (
          Pick<StorefrontTypes.ComponentizableCartLine, 'id' | 'quantity'>
          & { merchandise: (
            Pick<StorefrontTypes.ProductVariant, 'id' | 'title'>
            & { image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, product: (
              Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'vendor'>
              & { metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'value'>>> }
            ), selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
          ), cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, amountPerQuantity: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtAmountPerQuantity?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>> }, discountAllocations: Array<{ discountedAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }>, attributes: Array<Pick<StorefrontTypes.Attribute, 'key' | 'value'>> }
        ) }> }, attributes: Array<Pick<StorefrontTypes.Attribute, 'key' | 'value'>>, discountCodes: Array<Pick<StorefrontTypes.CartDiscountCode, 'code' | 'applicable'>>, discountAllocations: Array<{ discountedAmount: Pick<StorefrontTypes.MoneyV2, 'amount'> }>, delivery: { addresses: Array<(
        Pick<StorefrontTypes.CartSelectableAddress, 'id' | 'selected'>
        & { address: Pick<StorefrontTypes.CartDeliveryAddress, 'address1' | 'address2' | 'city' | 'countryCode' | 'firstName' | 'lastName' | 'phone' | 'zip'> }
      )> }, buyerIdentity: (
      Pick<StorefrontTypes.CartBuyerIdentity, 'email' | 'phone' | 'countryCode'>
      & { customer?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Customer, 'id' | 'email' | 'firstName' | 'lastName' | 'displayName'>> }
    ) }
  )> };

export type CartDeliveryAddressesAddMutationVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
  addresses: Array<StorefrontTypes.CartSelectableAddressInput> | StorefrontTypes.CartSelectableAddressInput;
}>;


export type CartDeliveryAddressesAddMutation = { cartDeliveryAddressesAdd?: StorefrontTypes.Maybe<{ userErrors: Array<Pick<StorefrontTypes.CartUserError, 'message' | 'code' | 'field'>>, warnings: Array<Pick<StorefrontTypes.CartWarning, 'message' | 'code' | 'target'>>, cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id'>
      & { delivery: { addresses: Array<(
          Pick<StorefrontTypes.CartSelectableAddress, 'id' | 'selected' | 'oneTimeUse'>
          & { address: Pick<StorefrontTypes.CartDeliveryAddress, 'firstName' | 'lastName' | 'company' | 'address1' | 'address2' | 'city' | 'provinceCode' | 'zip' | 'countryCode'> }
        )> } }
    )> }> };

export type CartDiscountCodesUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  discountCodes?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.Scalars['String']['input']> | StorefrontTypes.Scalars['String']['input']>;
}>;


export type CartDiscountCodesUpdateMutation = { cartDiscountCodesUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<(
      Pick<StorefrontTypes.Cart, 'id'>
      & { discountCodes: Array<Pick<StorefrontTypes.CartDiscountCode, 'code' | 'applicable'>>, cost: { totalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, subtotalAmount: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> } }
    )>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type GetCartDiscountCodesQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCartDiscountCodesQuery = { cart?: StorefrontTypes.Maybe<{ discountCodes: Array<Pick<StorefrontTypes.CartDiscountCode, 'code' | 'applicable'>> }> };

export type CartNoteUpdateMutationVariables = StorefrontTypes.Exact<{
  cartId: StorefrontTypes.Scalars['ID']['input'];
  note: StorefrontTypes.Scalars['String']['input'];
}>;


export type CartNoteUpdateMutation = { cartNoteUpdate?: StorefrontTypes.Maybe<{ cart?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Cart, 'id' | 'note'>>, userErrors: Array<Pick<StorefrontTypes.CartUserError, 'field' | 'message'>> }> };

export type GetCollectionLightQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  filters?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetCollectionLightQuery = { collection?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'id' | 'title' | 'handle'>
    & { products: { pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'>, edges: Array<{ node: (
          Pick<StorefrontTypes.Product, 'id' | 'createdAt' | 'tags'>
          & { metafield?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value'>>, gender?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value'>>, sortOrder?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value'>>, priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount'> }, variants: { edges: Array<{ node: (
                Pick<StorefrontTypes.ProductVariant, 'availableForSale'>
                & { selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
              ) }> }, options: Array<(
            Pick<StorefrontTypes.ProductOption, 'name'>
            & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
          )> }
        ) }>, filters: Array<(
        Pick<StorefrontTypes.Filter, 'id' | 'label' | 'type'>
        & { values: Array<Pick<StorefrontTypes.FilterValue, 'id' | 'label' | 'count' | 'input'>> }
      )> } }
  )> };

export type GetCollectionQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  filters?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
  first?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  last?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Int']['input']>;
  before?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
  sortKey?: StorefrontTypes.InputMaybe<StorefrontTypes.ProductCollectionSortKeys>;
  reverse?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['Boolean']['input']>;
}>;


export type GetCollectionQuery = { collection?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Collection, 'id' | 'title' | 'handle' | 'description'>
    & { seo: Pick<StorefrontTypes.Seo, 'description'>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>>, products: { pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'hasPreviousPage' | 'endCursor' | 'startCursor'>, edges: Array<{ node: (
          Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'availableForSale' | 'productType' | 'vendor' | 'totalInventory' | 'tags' | 'createdAt'>
          & { metafield?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value' | 'namespace' | 'key'>>, sortOrder?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value'>>, variants: { edges: Array<{ node: (
                Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
                & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
              ) }> }, options: Array<(
            Pick<StorefrontTypes.ProductOption, 'name'>
            & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
          )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, media: { edges: Array<{ node: { previewImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'width' | 'height' | 'altText'>> } }> } }
        ) }>, filters: Array<(
        Pick<StorefrontTypes.Filter, 'id' | 'label' | 'type'>
        & { values: Array<Pick<StorefrontTypes.FilterValue, 'id' | 'label' | 'count' | 'input'>> }
      )> } }
  )> };

export type GetCollectionFiltersQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  filters?: StorefrontTypes.InputMaybe<Array<StorefrontTypes.ProductFilter> | StorefrontTypes.ProductFilter>;
}>;


export type GetCollectionFiltersQuery = { collection?: StorefrontTypes.Maybe<{ products: { filters: Array<(
        Pick<StorefrontTypes.Filter, 'id' | 'label' | 'type'>
        & { values: Array<Pick<StorefrontTypes.FilterValue, 'id' | 'label' | 'count' | 'input'>> }
      )> } }> };

export type GetCollectionsHandlesQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetCollectionsHandlesQuery = { collections: { edges: Array<{ node: Pick<StorefrontTypes.Collection, 'handle'> }> } };

export type GetCollectionHandleByIdQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetCollectionHandleByIdQuery = { collection?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Collection, 'handle'>> };

export type GetCollectionsQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetCollectionsQuery = { collections: { edges: Array<{ node: Pick<StorefrontTypes.Collection, 'handle'> }> } };

export type CustomerAccessTokenCreateMutationVariables = StorefrontTypes.Exact<{
  email: StorefrontTypes.Scalars['String']['input'];
  password: StorefrontTypes.Scalars['String']['input'];
}>;


export type CustomerAccessTokenCreateMutation = { customerAccessTokenCreate?: StorefrontTypes.Maybe<{ customerAccessToken?: StorefrontTypes.Maybe<Pick<StorefrontTypes.CustomerAccessToken, 'accessToken'>>, customerUserErrors: Array<Pick<StorefrontTypes.CustomerUserError, 'message'>> }> };

export type GetPRoductMetaobjectQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetPRoductMetaobjectQuery = { metaobject?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Metaobject, 'id' | 'handle' | 'type'>
    & { fields: Array<Pick<StorefrontTypes.MetaobjectField, 'key' | 'value'>> }
  )> };

export type GetNewProductsByTypeQueryVariables = StorefrontTypes.Exact<{
  query: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type GetNewProductsByTypeQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'availableForSale' | 'productType' | 'vendor' | 'tags' | 'totalInventory'>
        & { priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'> }> }, options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }> } }
      ) }> } };

export type ProductMetafieldsFragment = { metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'id' | 'key' | 'value'>>> };

export type GetProductByHandleQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
  variant?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['ID']['input']>;
}>;


export type GetProductByHandleQuery = { product?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description' | 'descriptionHtml' | 'vendor' | 'productType'>
    & { priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, variants: { edges: Array<{ node: (
          Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'sku' | 'quantityAvailable' | 'currentlyNotInStock'>
          & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'id' | 'key' | 'value'>>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
        ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'> }> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, metafields: Array<StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'id' | 'key' | 'value'>>> }
  )> };

export type GetHandleByIdQueryVariables = StorefrontTypes.Exact<{
  id: StorefrontTypes.Scalars['ID']['input'];
}>;


export type GetHandleByIdQuery = { product?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Product, 'handle'>> };

export type GetProductsQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type GetProductsQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'description' | 'descriptionHtml' | 'vendor' | 'productType'>
        & { priceRange: { maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, options: Array<Pick<StorefrontTypes.ProductOption, 'id' | 'name' | 'values'>>, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>>, image?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
            ) }> }, images: { edges: Array<{ node: Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'> }> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>> }
      ) }> } };

export type GetProductsByIdsQueryVariables = StorefrontTypes.Exact<{
  query: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetProductsByIdsQuery = { products: { edges: Array<(
      Pick<StorefrontTypes.ProductEdge, 'cursor'>
      & { node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'availableForSale' | 'productType' | 'vendor' | 'totalInventory' | 'tags'>
        & { metafield?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'value' | 'namespace' | 'key'>>, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }> }, options: Array<(
          Pick<StorefrontTypes.ProductOption, 'name'>
          & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
        )>, priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, media: { edges: Array<{ node: { previewImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'width' | 'height' | 'altText'>> } }> } }
      ) }
    )>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetProductsBySkuQueryVariables = StorefrontTypes.Exact<{
  query: StorefrontTypes.Scalars['String']['input'];
  first: StorefrontTypes.Scalars['Int']['input'];
}>;


export type GetProductsBySkuQuery = { products: { edges: Array<{ node: (
        Pick<StorefrontTypes.Product, 'id' | 'title' | 'handle' | 'availableForSale' | 'productType' | 'vendor' | 'tags' | 'totalInventory'>
        & { priceRange: { minVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, maxVariantPrice: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'> }, featuredImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText' | 'width' | 'height'>>, media: { edges: Array<{ node: { previewImage?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Image, 'url' | 'altText'>> } }> }, options: Array<(
          Pick<StorefrontTypes.ProductOption, 'id' | 'name'>
          & { optionValues: Array<Pick<StorefrontTypes.ProductOptionValue, 'name'>> }
        )>, metafield?: StorefrontTypes.Maybe<Pick<StorefrontTypes.Metafield, 'key' | 'value'>>, variants: { edges: Array<{ node: (
              Pick<StorefrontTypes.ProductVariant, 'id' | 'title' | 'availableForSale' | 'quantityAvailable' | 'sku'>
              & { price: Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>, compareAtPrice?: StorefrontTypes.Maybe<Pick<StorefrontTypes.MoneyV2, 'amount' | 'currencyCode'>>, selectedOptions: Array<Pick<StorefrontTypes.SelectedOption, 'name' | 'value'>> }
            ) }> } }
      ) }> } };

export type GetMainMenuQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetMainMenuQuery = { menu?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Menu, 'handle'>
    & { items: Array<(
      Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
      & { items: Array<(
        Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
        & { items: Array<(
          Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>
          & { items: Array<Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>> }
        )> }
      )> }
    )> }
  )> };

export type GetSubMenuQueryVariables = StorefrontTypes.Exact<{
  handle: StorefrontTypes.Scalars['String']['input'];
}>;


export type GetSubMenuQuery = { menu?: StorefrontTypes.Maybe<(
    Pick<StorefrontTypes.Menu, 'handle'>
    & { items: Array<Pick<StorefrontTypes.MenuItem, 'title' | 'url' | 'resourceId'>> }
  )> };

export type GetProductsForSitemapQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetProductsForSitemapQuery = { products: { edges: Array<{ node: Pick<StorefrontTypes.Product, 'handle' | 'updatedAt'> }>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

export type GetCollectionsForSitemapQueryVariables = StorefrontTypes.Exact<{ [key: string]: never; }>;


export type GetCollectionsForSitemapQuery = { collections: { edges: Array<{ node: Pick<StorefrontTypes.Collection, 'handle' | 'updatedAt'> }> } };

export type GetVendorsForSitemapQueryVariables = StorefrontTypes.Exact<{
  first: StorefrontTypes.Scalars['Int']['input'];
  after?: StorefrontTypes.InputMaybe<StorefrontTypes.Scalars['String']['input']>;
}>;


export type GetVendorsForSitemapQuery = { products: { edges: Array<{ node: Pick<StorefrontTypes.Product, 'vendor'> }>, pageInfo: Pick<StorefrontTypes.PageInfo, 'hasNextPage' | 'endCursor'> } };

interface GeneratedQueryTypes {
  "#graphql\n  query predictiveSearchQuery(\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $query: String!\n    $searchableFields: [SearchableField!]\n    $types: [PredictiveSearchType!]\n  ) {\n    predictiveSearch(\n      limit: $limit\n      limitScope: $limitScope\n      query: $query\n      searchableFields: $searchableFields\n      types: $types\n    ) {\n      products {\n        id\n        title\n        handle\n        metafields(identifiers: [{key: \"znizka\", namespace: \"custom\"}]) {\n          key\n          value\n        }\n        priceRange {\n          maxVariantPrice {\n            amount\n            currencyCode\n          }\n        }\n        featuredImage {\n          url\n          altText\n          width\n          height\n        }\n        tags\n        vendor\n        options {\n          name\n          optionValues {\n            name\n          }\n        }\n        media(first: 20) {\n          edges {\n            node {\n              previewImage {\n                url\n                width\n                height\n                altText\n              }\n            }\n          }\n        }\n        variants(first: 250) {\n          edges {\n            node {\n              id\n              title\n              availableForSale\n              quantityAvailable\n              price {\n                amount\n                currencyCode\n              }\n              compareAtPrice {\n                amount\n                currencyCode\n              }\n              selectedOptions {\n                name\n                value\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: PredictiveSearchQueryQuery, variables: PredictiveSearchQueryQueryVariables},
  "#graphql\n  query predictiveSearch(\n    $limit: Int!\n    $limitScope: PredictiveSearchLimitScope!\n    $query: String!\n    $searchableFields: [SearchableField!]\n    $types: [PredictiveSearchType!]\n  ) {\n    predictiveSearch(\n      limit: $limit\n      limitScope: $limitScope\n      query: $query\n      searchableFields: $searchableFields\n      types: $types\n    ) {\n      products {\n        id\n        title\n        handle\n        featuredImage {\n          url\n        }\n        metafields(identifiers: [\n        {key: \"znizka\", namespace: \"custom\"}]){\n          key\n          value\n        }\n          priceRange {\n             maxVariantPrice{\n              amount\n              currencyCode\n             }\n            }\n                featuredImage {\n              url\n              altText\n              width\n              height\n            }\n            tags\n            vendor\n             options {\n              name\n              optionValues {\n                name\n              }\n            }\n            media(first:20){\n                    edges{\n                      node{\n\n                            previewImage{\n                              url\n                              width\n                              height\n                              altText\n                          }\n                      }\n                    }\n                  }\n            variants(first: 250) {\n              edges {\n                node {\n                  id\n                  title\n                  availableForSale\n                  quantityAvailable\n                  price {\n                    amount\n                    currencyCode\n                  }\n                  compareAtPrice {\n                    amount\n                    currencyCode\n                  }\n                  selectedOptions {\n                    name\n                    value\n                  }\n\n                }\n              }\n            }\n      }\n    }\n  }\n": {return: PredictiveSearchQuery, variables: PredictiveSearchQueryVariables},
  "#graphql\n  query GetAllProducts($first: Int!, $after: String) {\n    products(first: $first, after: $after) {\n      edges {\n        node {\n          vendor\n          id\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetAllProductsQuery, variables: GetAllProductsQueryVariables},
  "#graphql\n  query CartLinesForVariant($id: ID!) {\n    cart(id: $id) {\n      lines(first: 100) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant { id }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: CartLinesForVariantQuery, variables: CartLinesForVariantQueryVariables},
  "#graphql\n  query LinkGetCart($cartId: ID!) {\n    cart(id: $cartId) {\n      lines(first: 100) {\n        nodes {\n          merchandise {\n            ... on ProductVariant { id }\n          }\n          quantity\n        }\n      }\n    }\n\n  }\n": {return: LinkGetCartQuery, variables: LinkGetCartQueryVariables},
  "#graphql\n  query GetCart($id: ID!) {\n    cart(id: $id) {\n      id\n      checkoutUrl\n      totalQuantity\n      note\n      createdAt\n      updatedAt\n      cost {\n        totalAmount {\n          amount\n          currencyCode\n        }\n        subtotalAmount {\n          amount\n          currencyCode\n        }\n      }\n      lines(first: 100) {\n        edges {\n          node {\n            id\n            quantity\n            merchandise {\n              ... on ProductVariant {\n                id\n                title\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n                product {\n                  id\n                  title\n                  handle\n                  vendor\n                  metafields(   identifiers: [\n                  {key: \"znizka\", namespace: \"custom\"}]){\n                    key\n                    value\n                  }\n                }\n                selectedOptions {\n                  name\n                  value\n                }\n              }\n            }\n            cost {\n              totalAmount {\n                amount\n                currencyCode\n              }\n              amountPerQuantity {\n                amount\n                currencyCode\n              }\n              compareAtAmountPerQuantity {\n                amount\n                currencyCode\n              }\n            }\n            discountAllocations {\n              discountedAmount {\n                amount\n                currencyCode\n              }\n            }\n            attributes {\n              key\n              value\n            }\n          }\n        }\n      }\n      attributes {\n        key\n        value\n      }\n      discountCodes {\n        code\n        applicable\n      }\n      discountAllocations{\n        discountedAmount{\n          amount\n        }\n\n      }\n      delivery {\n        addresses {\n            id\n            selected\n            address {\n            ... on CartDeliveryAddress {\n            address1\n            address2\n            city\n            countryCode\n            firstName\n            lastName\n            phone\n            zip\n            }\n\n            }\n        }\n      }\n\n      buyerIdentity {\n        email\n        phone\n        countryCode\n        customer {\n          id\n          email\n          firstName\n          lastName\n          displayName\n        }\n\n      }\n    }\n  }\n": {return: GetCartQuery, variables: GetCartQueryVariables},
  "#graphql\n  query GetCartDiscountCodes($id: ID!) {\n    cart(id: $id) {\n      discountCodes {\n        code\n        applicable\n      }\n    }\n  }\n": {return: GetCartDiscountCodesQuery, variables: GetCartDiscountCodesQueryVariables},
  "#graphql\n  query GetCollectionLight(\n    $handle: String!\n    $filters: [ProductFilter!]\n    $first: Int\n    $after: String\n  ) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      products(\n        first: $first\n        filters: $filters\n        after: $after\n      ) {\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n        edges {\n          node {\n            id\n            createdAt\n            tags\n            metafield(namespace:\"custom\",key:\"znizka\"){\n              value\n            }\n            gender: metafield(namespace:\"custom\",key:\"gender\"){\n              value\n            }\n            sortOrder: metafield(namespace:\"custom\",key:\"sort_order\"){\n              value\n            }\n            priceRange {\n              maxVariantPrice {\n                amount\n              }\n            }\n            variants(first: 250) {\n              edges {\n                node {\n                  availableForSale\n                  selectedOptions {\n                    name\n                    value\n                  }\n                }\n              }\n            }\n            options {\n              name\n              optionValues {\n                name\n              }\n            }\n          }\n        }\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n      }\n    }\n  }\n": {return: GetCollectionLightQuery, variables: GetCollectionLightQueryVariables},
  "#graphql\n  query GetCollection(\n    $handle: String!\n    $filters: [ProductFilter!]\n    $first: Int\n    $after: String\n    $last: Int\n    $before: String\n    $sortKey: ProductCollectionSortKeys\n    $reverse: Boolean\n  ) {\n    collection(handle: $handle) {\n      id\n      title\n      handle\n      description\n      seo {\n        description\n      }\n\n      image {\n        url\n        altText\n      }\n\n      products(\n        first: $first\n        last: $last\n        filters: $filters\n        sortKey: $sortKey\n        reverse: $reverse\n        after: $after\n        before: $before\n      ) {\n        \n        pageInfo {\n          hasNextPage\n          hasPreviousPage\n          endCursor\n          startCursor\n        }\n        edges {\n        \n          node {\n            id\n            title\n            handle\n            availableForSale\n            productType\n            vendor\n            totalInventory\n            tags\n            createdAt\n            metafield(namespace:\"custom\",key:\"znizka\"){\n                       value\n                       namespace\n                       key\n            }\n            sortOrder: metafield(namespace:\"custom\",key:\"sort_order\"){\n                       value\n            }\n            variants(first: 250) {\n              edges {\n                node {\n                  id\n                  title\n                  availableForSale\n                  quantityAvailable\n                  price {\n                    amount\n                    currencyCode\n                  }\n                  compareAtPrice {\n                    amount\n                    currencyCode\n                  }\n                  selectedOptions {\n                    name\n                    value\n                  }\n\n                }\n              }\n            }\n            options {\n              name\n              optionValues {\n                name\n              }\n            }\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url\n              altText\n              width\n              height\n            }\n            media(first: 6){\n                    edges{\n                      node{\n\n                            previewImage{\n                              url\n                              width\n                              height\n                              altText\n                          }\n                      }\n                    }\n                  }\n          }\n        }\n        filters {\n          id\n          label\n          type\n          values {\n            id\n            label\n            count\n            input\n          }\n        }\n      }\n    }\n  }\n": {return: GetCollectionQuery, variables: GetCollectionQueryVariables},
  "\n#graphql\nquery GetCollectionFilters($handle: String!, $filters: [ProductFilter!]) {\n    collection(handle: $handle) {\n        products(first: 1, filters: $filters){\n            filters {\n                id\n                label\n                type\n                values {\n                    id\n                    label\n                    count\n                    input\n                }\n            }\n        }\n    }\n}\n": {return: GetCollectionFiltersQuery, variables: GetCollectionFiltersQueryVariables},
  "\n  #graphql\n  query GetCollectionsHandles{\n    collections(first:250) {\n    \tedges{\n        node{\n          handle\n        }\n      }\n    }\n  }\n  ": {return: GetCollectionsHandlesQuery, variables: GetCollectionsHandlesQueryVariables},
  "#graphql\n        query getCollectionHandleById($id: ID!) {\n          collection(id: $id) {\n            handle\n          }\n        }": {return: GetCollectionHandleByIdQuery, variables: GetCollectionHandleByIdQueryVariables},
  "#graphql\n  query GetCollections {\n    collections(first: 250) {\n      edges {\n        node {\n          handle\n        }\n      }\n    }\n  }\n": {return: GetCollectionsQuery, variables: GetCollectionsQueryVariables},
  "#graphql\n  query GetPRoductMetaobject($id: ID!) {\n    metaobject(id: $id) {\n      id\n      handle\n      type\n      fields {\n        key\n        value\n      }\n    }\n  }\n": {return: GetPRoductMetaobjectQuery, variables: GetPRoductMetaobjectQueryVariables},
  "#graphql\n  query GetNewProductsByType($query: String!, $first: Int!) {\n    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {\n      edges {\n        node {\n          id\n          title\n          handle\n          availableForSale\n          productType\n          vendor\n          tags\n          totalInventory\n          priceRange {\n            minVariantPrice { amount currencyCode }\n            maxVariantPrice { amount currencyCode }\n          }\n          featuredImage { url altText width height }\n          images(first: 20) {\n            edges { node { url altText width height } }\n          }\n          options(first: 10) { id name values }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                availableForSale\n                quantityAvailable\n                price { amount currencyCode }\n                compareAtPrice { amount currencyCode }\n                selectedOptions { name value }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetNewProductsByTypeQuery, variables: GetNewProductsByTypeQueryVariables},
  "#graphql\n  query getProductByHandle($handle: String!, $variant: ID) {\n  \n    product(handle: $handle, id: $variant) {\n      id\n      title\n      handle\n      description\n      descriptionHtml\n      vendor\n      productType\n      \n      priceRange {\n        maxVariantPrice {\n          amount\n          currencyCode\n        }\n        minVariantPrice {\n          amount\n          currencyCode\n        }\n      }\n      options(first: 250) {\n        id\n        name\n        values\n      }\n      ...ProductMetafields\n      variants(first: 250) {\n        edges {\n          node {\n            id\n            title\n            availableForSale\n            sku\n            quantityAvailable\n            currentlyNotInStock\n            price {\n              amount\n              currencyCode\n            }\n            compareAtPrice {\n              amount\n              currencyCode\n            }\n            selectedOptions {\n              name\n              value\n            }\n            metafields(identifiers: {key: \"at_the_fitting\", namespace: \"custom\"}) {\n              id\n              key\n              value\n            }\n            image {\n              url\n              altText\n              width\n              height\n            }\n          }\n        }\n      }\n      images(first: 250) {\n        edges {\n          node {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n      featuredImage {\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n  #graphql\n  fragment ProductMetafields on Product {\n    metafields(\n      identifiers: [\n        {key: \"recommended_products\", namespace: \"custom\"},\n        {key: \"bound-products\", namespace: \"custom\"},\n        {key: \"attributes\", namespace: \"custom\"},\n        {key: \"znizka\", namespace: \"custom\"},\n        {key: \"color\", namespace: \"custom\"},\n        {key: \"kolektsiya\", namespace: \"custom\"},\n        {key: \"styl\", namespace: \"custom\"},\n        {key: \"krayina\", namespace: \"custom\"},\n        {key: \"pidoshva\", namespace: \"custom\"},\n        {key: \"posadka\", namespace: \"custom\"},\n        {key: \"osoblyvosti\", namespace: \"custom\"},\n        {key: \"tip\", namespace: \"custom\"},\n        {key: \"kategorija\", namespace: \"custom\"},\n        {key: \"vysota-pidoshvy\", namespace: \"custom\"},\n        {key: \"zastibka\", namespace: \"custom\"},\n        {key: \"kabluk\", namespace: \"custom\"},\n        {key: \"napovnjuvach\", namespace: \"custom\"},\n        {key: \"sostav\", namespace: \"custom\"},\n        {key: \"material\", namespace: \"custom\"},\n        {key: \"rozmir\", namespace: \"custom\"},\n        {key: \"sezon\", namespace: \"custom\"},\n        {key: \"pidkladka\", namespace: \"custom\"},\n        {key: \"gender\", namespace: \"custom\"}\n      ]\n    ) {\n      id\n      key\n      value\n    }\n  }\n\n": {return: GetProductByHandleQuery, variables: GetProductByHandleQueryVariables},
  "#graphql\n        query getHandleById($id: ID!) {\n          product(id: $id) {\n            handle\n          }\n        }": {return: GetHandleByIdQuery, variables: GetHandleByIdQueryVariables},
  "#graphql\n  query getProducts($first: Int!) {\n    products(first: $first) {\n      edges {\n        node {\n          id\n          title\n          handle\n          description\n          descriptionHtml\n          vendor\n          productType\n          priceRange {\n            maxVariantPrice {\n              amount\n              currencyCode\n            }\n            minVariantPrice {\n              amount\n              currencyCode\n            }\n          }\n          options(first: 10) {\n            id\n            name\n            values\n          }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                availableForSale\n                price {\n                  amount\n                  currencyCode\n                }\n                compareAtPrice {\n                  amount\n                  currencyCode\n                }\n                selectedOptions {\n                  name\n                  value\n                }\n                image {\n                  url\n                  altText\n                  width\n                  height\n                }\n              }\n            }\n          }\n          images(first: 10) {\n            edges {\n              node {\n                url\n                altText\n                width\n                height\n              }\n            }\n          }\n          featuredImage {\n            url\n            altText\n            width\n            height\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsQuery, variables: GetProductsQueryVariables},
  "#graphql\n  query getProductsByIds($query: String!, $first: Int!, $after: String) {\n    products(first: $first, query: $query, after: $after) {\n      edges {\n        cursor\n        \n         node {\n            id\n            title\n            handle\n            availableForSale\n            productType\n            vendor\n            totalInventory\n            tags\n            metafield(namespace:\"custom\",key:\"znizka\"){\n                       value\n                       namespace\n                       key\n            }\n            variants(first: 250) {\n              edges {\n                node {\n                  id\n                  title\n                  availableForSale\n                  quantityAvailable\n                  price {\n                    amount\n                    currencyCode\n                  }\n                  compareAtPrice {\n                    amount\n                    currencyCode\n                  }\n                  selectedOptions {\n                    name\n                    value\n                  }\n\n                }\n              }\n            }\n            options {\n              name\n              optionValues {\n                name\n              }\n            }\n            priceRange {\n              minVariantPrice {\n                amount\n                currencyCode\n              }\n              maxVariantPrice {\n                amount\n                currencyCode\n              }\n            }\n            featuredImage {\n              url\n              altText\n              width\n              height\n            }\n            media(first:20){\n                    edges{\n                      node{\n\n                            previewImage{\n                              url\n                              width\n                              height\n                              altText\n                          }\n                      }\n                    }\n                  }\n          }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetProductsByIdsQuery, variables: GetProductsByIdsQueryVariables},
  "#graphql\n  query GetProductsBySku($query: String!, $first: Int!) {\n    products(first: $first, query: $query) {\n      edges {\n        node {\n          id\n          title\n          handle\n          availableForSale\n          productType\n          vendor\n          tags\n          totalInventory\n          priceRange {\n            minVariantPrice { amount currencyCode }\n            maxVariantPrice { amount currencyCode }\n          }\n          featuredImage { url altText width height }\n          media(first: 5) {\n            edges { node { previewImage { url altText } } }\n          }\n          options(first: 10) {\n            id\n            name\n            optionValues { name }\n          }\n          metafield(namespace: \"custom\", key: \"znizka\") {\n            key\n            value\n          }\n          variants(first: 50) {\n            edges {\n              node {\n                id\n                title\n                availableForSale\n                quantityAvailable\n                sku\n                price { amount currencyCode }\n                compareAtPrice { amount currencyCode }\n                selectedOptions { name value }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: GetProductsBySkuQuery, variables: GetProductsBySkuQueryVariables},
  "#graphql\n  query GetMainMenu {\n     menu(handle: \"shop-main-menu\") {\n       handle\n       items {\n         title\n         url\n         resourceId\n           items {\n             title\n             url\n             resourceId\n                          items{\n                             title\n                             url\n                             resourceId\n                             items {\n                                 title\n                                 url\n                                 resourceId\n                             }\n                          }           }\n       }\n     }\n   }\n": {return: GetMainMenuQuery, variables: GetMainMenuQueryVariables},
  "#graphql\n  query GetSubMenu ($handle: String!) {\n    menu(handle: $handle) {\n      handle\n      items {\n        title\n        url\n        resourceId\n      }\n    }\n  }\n": {return: GetSubMenuQuery, variables: GetSubMenuQueryVariables},
  "#graphql\n  query GetProductsForSitemap($first: Int!, $after: String) {\n    products(first: $first, after: $after) {\n      edges {\n        node {\n          handle\n          updatedAt\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetProductsForSitemapQuery, variables: GetProductsForSitemapQueryVariables},
  "#graphql\n  query GetCollectionsForSitemap {\n    collections(first: 250) {\n      edges {\n        node {\n          handle\n          updatedAt\n        }\n      }\n    }\n  }\n": {return: GetCollectionsForSitemapQuery, variables: GetCollectionsForSitemapQueryVariables},
  "#graphql\n  query GetVendorsForSitemap($first: Int!, $after: String) {\n    products(first: $first, after: $after) {\n      edges {\n        node {\n          vendor\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": {return: GetVendorsForSitemapQuery, variables: GetVendorsForSitemapQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {\n    cartLinesUpdate(cartId: $cartId, lines: $lines) {\n      cart { id totalQuantity }\n      userErrors { field message }\n    }\n  }\n": {return: CartLinesUpdateMutation, variables: CartLinesUpdateMutationVariables},
  "#graphql\n  mutation LinkCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {\n    cartLinesAdd(cartId: $cartId, lines: $lines) {\n      cart { id }\n      userErrors { field message }\n    }\n  }\n": {return: LinkCartLinesAddMutation, variables: LinkCartLinesAddMutationVariables},
  "#graphql\n  mutation LinkCartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {\n    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {\n      cart { id }\n      userErrors { field message }\n    }\n  }\n": {return: LinkCartBuyerIdentityUpdateMutation, variables: LinkCartBuyerIdentityUpdateMutationVariables},
  "\n  #graphql\n  mutation CartDeliveryAddressesAdd($id: ID!, $addresses: [CartSelectableAddressInput!]!) {\n    cartDeliveryAddressesAdd(cartId: $id, addresses: $addresses) {\n      userErrors {\n        message\n        code\n        field\n      }\n      warnings {\n        message\n        code\n        target\n      }\n      cart {\n        id\n        delivery {\n          addresses {\n            id\n            selected\n            oneTimeUse\n            address {\n              ... on CartDeliveryAddress {\n                firstName\n                lastName\n                company\n                address1\n                address2\n                city\n                provinceCode\n                zip\n                countryCode\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n": {return: CartDeliveryAddressesAddMutation, variables: CartDeliveryAddressesAddMutationVariables},
  "#graphql\n  mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {\n    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {\n      cart {\n        id\n        discountCodes {\n          code\n          applicable\n        }\n        cost {\n          totalAmount {\n            amount\n            currencyCode\n          }\n          subtotalAmount {\n            amount\n            currencyCode\n          }\n        }\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartDiscountCodesUpdateMutation, variables: CartDiscountCodesUpdateMutationVariables},
  "#graphql\n  mutation cartNoteUpdate($cartId: ID!, $note: String!) {\n    cartNoteUpdate(cartId: $cartId, note: $note) {\n      cart {\n        id\n        note\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n": {return: CartNoteUpdateMutation, variables: CartNoteUpdateMutationVariables},
  "#graphql\nmutation customerAccessTokenCreate ($email:String!,$password:String!){\n    customerAccessTokenCreate(input: {email: $email, password: $password}) {\n      customerAccessToken {\n        accessToken\n      }\n      customerUserErrors {\n        message\n      }\n    }\n  }\n": {return: CustomerAccessTokenCreateMutation, variables: CustomerAccessTokenCreateMutationVariables},
}
declare module '@shopify/storefront-api-client' {
  type InputMaybe<T> = StorefrontTypes.InputMaybe<T>;
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
