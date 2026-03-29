'use client';
import { authClient } from '../lib/auth-client';
import { useRouter } from '@shared/i18n/navigation';
import { useEffect } from 'react';

export const SignOut = () => {
  const router = useRouter();

  useEffect(() => {
    authClient.signOut().then(() => {
      router.push('/woman');
    });
  }, [router]);

  return <></>;
};
