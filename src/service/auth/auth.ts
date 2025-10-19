import prisma from '@/lib/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { oauthShopifyClient } from './shopify/client';
import { nextCookies } from 'better-auth/next-js';
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
  session: {
    expiresIn: 60 * 60,
    updateAge: 60,
  },
  plugins: [oauthShopifyClient, nextCookies()],
});
