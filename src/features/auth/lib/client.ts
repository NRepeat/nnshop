import { genericOAuthClient } from 'better-auth/client/plugins';
import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  plugins: [genericOAuthClient(), anonymousClient()],
});

export const { signUp, signIn, signOut, useSession } = client;
