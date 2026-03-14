'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!posthog) return;

    // Always identify if distinct_id doesn't match userId yet
    // This ensures anonymous → real user merge happens correctly
    if (posthog.get_distinct_id() !== userId) {
      posthog.identify(userId, { email, name });
    }

    // Fire auth event for Google OAuth callback
    const signedIn = searchParams.get('signed_in');
    if (signedIn === 'google') {
      posthog.capture('user_signed_in', { method: 'google' });
      // Remove the param from URL without re-render
      const url = new URL(window.location.href);
      url.searchParams.delete('signed_in');
      window.history.replaceState(null, '', url.toString());
    }
  }, [posthog, userId, email, name, searchParams]);

  return null;
}
