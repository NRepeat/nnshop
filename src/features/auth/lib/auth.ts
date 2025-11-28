import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { oauthShopifyClient } from './shopify/client';
import { nextCookies } from 'better-auth/next-js';
import { anonymous } from 'better-auth/plugins';
import { anonymousCartBuyerIdentityUpdate } from '../../../entities/cart/api/anonymous-cart-buyer-identity-update';
import { prisma } from '../../../shared/lib/prisma';
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      // You can implement custom email sending logic here
      // For now, we'll use console.log - replace with your email service
      console.log(`Password reset URL for ${user.email}: ${url}`);

      // Example with a hypothetical email service:
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Reset your password',
      //   html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`
      // });
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
        await Promise.all([
          anonymousCartBuyerIdentityUpdate({ anonymousUser, newUser }),
          linkAnonymousDataToUser({
            anonymousUserId: anonymousUser.user.id,
            newUserId: newUser.user.id,
          }),
        ]);
      },
    }),
    nextCookies(),
  ],
});
