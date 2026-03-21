'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function PostHogIdentifyClient({
  userId,
  email,
  name,
}: {
  userId: string;
  email: string;
  name?: string | null;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Remove the signed_in param from URL without re-render
    const signedIn = searchParams.get('signed_in');
    if (signedIn === 'google') {
      const url = new URL(window.location.href);
      url.searchParams.delete('signed_in');
      window.history.replaceState(null, '', url.toString());
    }
  }, [userId, email, name, searchParams]);

  return null;
}
