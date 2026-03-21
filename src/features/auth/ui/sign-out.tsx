'use client';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SignOut = () => {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut().then(() => {
      router.push('/uk/woman');
    });
  }, [router]);

  return <></>;
};
