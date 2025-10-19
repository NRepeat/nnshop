import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { auth } from '../auth';
import { client } from '../client';
import { ShopifyClientType, shopifyFactory } from '@/lib/shopify/clients';

export default async function authShopifyCustomer(head: ReadonlyHeaders) {
  const serverSession = await auth.api.getSession({
    headers: head,
  });
  const accounts = await client.listAccounts({}, { headers: head });
  if (!accounts.data) {
    console.error('No accounts found');
    return null;
  }
  const accountId = accounts.data.find(
    (account) => account.providerId === 'shopify',
  );
  if (!accountId) {
    console.error('No shopify account found');
    return null;
  }
  const user = await auth.api.getAccessToken({
    body: {
      providerId: 'shopify',
      accountId: accountId?.id,
      userId: serverSession?.user.id,
    },
    headers: head,
  });
  if (!user) {
    throw new Error('No user found');
  }
  if (!user.accessToken) {
    throw new Error('No access token found');
  }
  const customerClient = await shopifyFactory.createClient(
    ShopifyClientType.CUSTOMER_ACCOUNT,
    {
      accessToken: user.accessToken,
    },
  );

  const cq = `{ customer { id ,   firstName
  lastName} }`;
  const shopifyCustomer = (await customerClient.request(cq)) as {
    customer: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  return {
    ...user,
    ...shopifyCustomer,
    client: customerClient,
  };
}
