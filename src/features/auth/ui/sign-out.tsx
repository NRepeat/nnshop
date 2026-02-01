'use client';
import { authClient } from '../lib/auth-client';
import { useRouter } from 'next/navigation';

export const SignOut = () => {
  const router = useRouter();
  authClient.signOut();
  router.push('/');
  return <></>;
};
