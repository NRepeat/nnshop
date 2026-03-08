'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useSession } from '@features/auth/lib/client';

export function usePostHogIdentify() {
  const posthog = usePostHog();
  const { data: session } = useSession();

  useEffect(() => {
    if (!posthog) return;

    if (session?.user) {
      if (!posthog._isIdentified()) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          name: session.user.name,
        });
      }
    } else {
      if (posthog._isIdentified()) {
        posthog.reset();
      }
    }
  }, [posthog, session]);
}
