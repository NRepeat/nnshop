import { prisma } from '@shared/lib/prisma';
import { storefrontClient } from '@shared/lib/shopify/client';
import {
  CustomerAccessTokenCreateMutation,
  CustomerAccessTokenCreateMutationVariables,
} from '@shared/lib/shopify/types/storefront.generated';
const query = `#graphql
mutation customerAccessTokenCreate ($email:String!,$password:String!){
    customerAccessTokenCreate(input: {email: $email, password: $password}) {
      customerAccessToken {
        accessToken
      }
      customerUserErrors {
        message
      }
    }
  }
`;
export const createShopifyCustomerToken = async (
  variables: CustomerAccessTokenCreateMutationVariables,
) => {
  try {
    const res = await storefrontClient.request<
      CustomerAccessTokenCreateMutation,
      CustomerAccessTokenCreateMutationVariables
    >({
      query,
      variables,
    });
    if (
      res.customerAccessTokenCreate?.customerUserErrors &&
      res.customerAccessTokenCreate?.customerUserErrors.length > 0
    ) {
      console.log(
        JSON.stringify(
          res.customerAccessTokenCreate?.customerUserErrors,
          null,
          2,
        ),
      );
      throw new Error('Error create shopify customer token');
    }
    if (
      res.customerAccessTokenCreate &&
      res.customerAccessTokenCreate.customerAccessToken?.accessToken
    ) {
      await prisma.user.update({
        where: { email: variables.email },
        data: {
          shopifyToken:
            res.customerAccessTokenCreate.customerAccessToken.accessToken,
        },
      });
    }
  } catch (error) {
    console.log('🚀 ~ createShopifyCustomer ~ error:', error);
    throw new Error('Error create shopify customer');
  }
};
