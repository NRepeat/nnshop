'use client';
import { authClient } from '../lib/auth-client';
import { redirect, RedirectType, useRouter } from 'next/navigation';

export const SignOut = () => {
//   const nav = useRouter();
  authClient.signOut();
  //   nav.push('/', { scroll: false });
  //   nav.refresh();
//   redirect('/', RedirectType.replace);
  window.location.href = '/';
  return <></>;
};
