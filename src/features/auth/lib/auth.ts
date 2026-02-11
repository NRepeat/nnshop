import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { oauthShopifyClient } from './shopify/client';
import { nextCookies } from 'better-auth/next-js';
import { anonymous } from 'better-auth/plugins';
import { anonymousCartBuyerIdentityUpdate } from '../../../entities/cart/api/anonymous-cart-buyer-identity-update';
import { prisma } from '../../../shared/lib/prisma';
import { sendEvent } from '../../../shared/lib/mailer';
import { linkAnonymousDataToUser } from './on-link-account';
import { createShopifyCustomer } from '@entities/customer/api/create-customer';

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.NEXT_PUBLIC_BASE_URL;

if (!betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required');
}
if (!betterAuthUrl) {
  throw new Error('BETTER_AUTH_URL environment variable is required');
}

export const auth = betterAuth({
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEvent({
        eventTypeKey: 'password_reset',
        keyValue: user.email,
        params: {
          EmailAddress: user.email,
          resetLink: url,
        },
      });
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          console.log('[databaseHooks] User created:', {
            id: user.id,
            email: user.email,
            name: user.name,
            isAnonymous: (user as any).isAnonymous,
          });
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['shopify', 'google'],
    },
  },
  trustedOrigins: [betterAuthUrl],

  plugins: [
    oauthShopifyClient,
    anonymous({
      emailDomainName: 'gmail.com',
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        console.log('[onLinkAccount] START', {
          anonymousUserId: anonymousUser.user.id,
          newUserId: newUser.user.id,
          newUserEmail: newUser.user.email,
        });
        try {
          const results = await Promise.allSettled([
            anonymousCartBuyerIdentityUpdate({ anonymousUser, newUser }),
            linkAnonymousDataToUser({
              anonymousUserId: anonymousUser.user.id,
              newUserId: newUser.user.id,
            }),
          ]);
          console.log('[onLinkAccount] RESULTS', {
            cartUpdate: results[0].status,
            cartUpdateReason: results[0].status === 'rejected' ? results[0].reason?.message : undefined,
            dataLink: results[1].status,
            dataLinkReason: results[1].status === 'rejected' ? results[1].reason?.message : undefined,
          });
          console.log('[onLinkAccount] DONE');
        } catch (error) {
          console.error('[onLinkAccount] ERROR:', error);
        }
      },
    }),
    nextCookies(),
  ],
});
