'use client';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';

export const SignOut = () => {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut().then(() => {
      posthog.reset();
      router.push('/uk/woman');
    });
  }, [router]);

  return <></>;
};
