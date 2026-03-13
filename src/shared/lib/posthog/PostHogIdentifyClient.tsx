'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

export function PostHogIdentifyClient({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog && !posthog._isIdentified()) {
      posthog.identify(userId, { email, name });
    }
  }, [posthog, userId, email, name]);

  return null;
}
