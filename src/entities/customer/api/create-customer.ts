import {
  CustomerCreateInput,
  CustomerCreatePayload,
} from '@shared/lib/shopify/types/storefront.types';
import { createShopifyCustomerToken } from './create-customer-token';
import { adminClient } from '@shared/lib/shopify/admin-client';
const query = `
mutation customerCreate($input: CustomerInput!) {
  customerCreate(input: $input) {
    userErrors {
      field
      message
    }
    customer {
      id
      defaultEmailAddress{
        emailAddress
        marketingState
        marketingOptInLevel
      }
      defaultPhoneNumber{
        phoneNumber
        marketingState
        marketingOptInLevel
      }
      taxExempt
     
      firstName
      lastName
      amountSpent {
        amount
        currencyCode
      }
      addressesV2 {
       edges{
        node{
      				address1
              city
              country
              phone
              zip
        }
      }
      }
    }
  }
}
`;
export const createShopifyCustomer = async (input: CustomerCreateInput) => {
  try {
    const res = await adminClient.client.request<
      { customerCreate: CustomerCreatePayload },
      {
        input: CustomerCreateInput & {
          emailMarketingConsent: {
            marketingOptInLevel: string;
            marketingState: string;
          };
        };
      }
    >({
      query: query,
      variables: {
        //@ts-ignore
        input: {
          email: input.email,
          phone: input.phone,
          firstName: input.firstName,
          emailMarketingConsent: {
            marketingOptInLevel: 'CONFIRMED_OPT_IN',
            marketingState: 'SUBSCRIBED',
          },
        },
      },
    });

    const errors = res.customerCreate.userErrors;

    if (errors && errors.length > 0) {
      console.error(
        '[Shopify Admin API] Customer Create Errors:',
        JSON.stringify(errors, null, 2),
      );
    //   throw new Error(errors[0].message || 'Error creating customer');
    }

    if (input.password) {
      await createShopifyCustomerToken({
        email: input.email!,
        password: input.password,
      });
    }

    return res.customerCreate.customer;
  } catch (error) {
    console.error('🚀 ~ createShopifyCustomer ~ error:', error);
    throw error;
  }
};
