import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetMetaobjectQueryQuery,
  GetMetaobjectQueryQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';

const GET_METAOBJECT_QUERY = `
  #graphql
  query GetMetaobjectQuery{
    metaobject(id:"gid://shopify/Metaobject/129047363746"){
    id
  }
  }
  `;

export const getMetaobject = async () => {
  try {
    const res = await storefrontClient.request<
      GetMetaobjectQueryQuery,
      GetMetaobjectQueryQueryVariables
    >({
      query: GET_METAOBJECT_QUERY,
      variables: {},
    });
    if (!res.metaobject) {
      return [];
    }
    return res.metaobject;
  } catch (err) {
    console.log(err);
    throw new Error('Error get metaobjects');
  }
};
