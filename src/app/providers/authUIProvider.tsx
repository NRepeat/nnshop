'use client';

import { client } from '@/features/auth/lib/client';
import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import { Link } from '@shared/i18n/navigation';
import { useRouter } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <Suspense>
      <AuthUIProvider
        authClient={client}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          router.refresh();
        }}
        social={{
          providers: ['google'],
        }}
        changeEmail={false}
        Link={Link}
        multiSession={false}
        
        viewPaths={{ SIGN_OUT: '/session/sign-out' }}
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
    </Suspense>
  );
}
