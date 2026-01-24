import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetMetaobjectQueryQuery,
  GetMetaobjectQueryQueryVariables,
} from '@shared/lib/shopify/types/storefront.generated';

const GET_METAOBJECT_QUERY = `#graphql
  query GetMetaobject($id: ID!) {
    metaobject(id: $id) {
      id
      handle
      type
      fields {
        key
        value
      }
    }
  }
`;

export const getMetaobject = async (id: string) => {
  try {
    const variables: GetMetaobjectQueryQueryVariables = {
      //@ts-ignore
      id: id,
    };

    const res = await storefrontClient.request<
      GetMetaobjectQueryQuery,
      GetMetaobjectQueryQueryVariables
    >({
      query: GET_METAOBJECT_QUERY,
      variables,
    });

    return res.metaobject || null;
  } catch (err) {
    console.error('Error fetching metaobject:', err);
    throw new Error('Error get metaobjects');
  }
};
