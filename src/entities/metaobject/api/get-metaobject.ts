import { storefrontClient } from '@shared/lib/shopify/client';
import {
  GetPRoductMetaobjectQueryVariables,
  GetPRoductMetaobjectQuery,
} from '@shared/lib/shopify/types/storefront.generated';
import {
  Metaobject,
  MetaobjectField,
} from '@shared/lib/shopify/types/storefront.types';

const GET_METAOBJECT_QUERY = `#graphql
  query GetPRoductMetaobject($id: ID!) {
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
export type ProductMEtaobjectType =
  | (Pick<Metaobject, 'id' | 'handle' | 'type'> & {
      fields: Array<Pick<MetaobjectField, 'key' | 'value'>>;
    })
  | null;
export const getMetaobject = async (
  id: string,
): Promise<ProductMEtaobjectType> => {
  'use cache'
  try {
    const variables: GetPRoductMetaobjectQueryVariables = {
      //@ts-ignore
      id: id,
    };

    const res = await storefrontClient.request<
      GetPRoductMetaobjectQuery,
      GetPRoductMetaobjectQueryVariables
    >({
      query: GET_METAOBJECT_QUERY,
      variables,
    });

    return res.metaobject || null;
  } catch (err) {
    console.error('Error fetching metaobject:', err);
    return null;
  }
};
