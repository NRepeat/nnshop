'use client';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';

export const SignOut = () => {
  const router = useRouter();
  posthog.reset();
  authClient.signOut();
  router.push('/');
  return <></>;
};
