import { genericOAuthClient } from 'better-auth/client/plugins';
import { anonymousClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const client = createAuthClient({
  plugins: [genericOAuthClient(), anonymousClient()],
});

export const { signUp, signIn, signOut, useSession } = client;
