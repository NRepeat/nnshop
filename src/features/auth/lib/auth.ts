import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { oauthShopifyClient } from './shopify/client';
import { nextCookies } from 'better-auth/next-js';
import { anonymous } from 'better-auth/plugins';
import { anonymousCartBuyerIdentityUpdate } from '../../../entities/cart/api/anonymous-cart-buyer-identity-update';
import { prisma } from '../../../shared/lib/prisma';
import { sendEvent } from '../../../shared/lib/mailer';
import { linkAnonymousDataToUser } from './on-link-account';

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
        after: async () => {},
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
  trustedOrigins: [
    betterAuthUrl,
    'https://www.miomio.com.ua',
    'https://miomio.com.ua',
  ],

  plugins: [
    oauthShopifyClient,
    anonymous({
      emailDomainName: 'gmail.com',
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const [cartMergeResult, dataLinkResult] = await Promise.allSettled([
          anonymousCartBuyerIdentityUpdate({ anonymousUser, newUser }),
          linkAnonymousDataToUser({
            anonymousUserId: anonymousUser.user.id,
            newUserId: newUser.user.id,
          }),
        ]);

        if (cartMergeResult.status === 'rejected') {
          console.error('[onLinkAccount] cart merge failed', {
            step: 'anonymous-cart-buyer-identity-update',
            userId: newUser.user.id,
            orderId: undefined,
            error:
              cartMergeResult.reason instanceof Error
                ? cartMergeResult.reason.message
                : String(cartMergeResult.reason),
          });
        }

        if (dataLinkResult.status === 'rejected') {
          console.error('[onLinkAccount] data link failed', {
            step: 'link-anonymous-data-to-user',
            userId: newUser.user.id,
            orderId: undefined,
            error:
              dataLinkResult.reason instanceof Error
                ? dataLinkResult.reason.message
                : String(dataLinkResult.reason),
          });
        }
      },
    }),
    nextCookies(),
  ],
});
