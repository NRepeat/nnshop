'use client';
import { useRouter } from '@shared/i18n/navigation';
import { useEffect } from 'react';
import { signOutPreservingCart } from '../lib/sign-out-preserve-cart';

export const SignOut = () => {
  const router = useRouter();

  useEffect(() => {
    signOutPreservingCart()
      .catch((err) => {
        console.error('[SignOut] preserve-cart failed', err);
      })
      .finally(() => {
        router.push('/woman');
        router.refresh();
      });
  }, [router]);

  return <></>;
};
