'use client';

import { client } from '@/features/auth/lib/client';
import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={client}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={Link}
      account={{
        basePath: '/account',
        fields: ['name', 'email', 'image'],
      }}
      signUp={{
        fields: ['name'],
      }}
    >
      {children}
    </AuthUIProvider>
  );
}
