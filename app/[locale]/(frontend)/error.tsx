'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Button } from '@shared/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.captureException(error);
  }, [error, posthog]);

  return (
    <div className="container mx-auto flex h-[calc(100vh-200px)] items-center justify-center text-center">
      <div>
        <h1 className="text-9xl font-bold text-primary">500</h1>
        <h2 className="mt-4 text-3xl font-semibold">Щось пішло не так</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Сталася помилка. Спробуйте ще раз.
        </p>
        {error.digest && (
          <p className="mt-1 text-sm text-muted-foreground">ID: {error.digest}</p>
        )}
        <div className="mt-8">
          <Button onClick={reset}>Спробувати знову</Button>
        </div>
      </div>
    </div>
  );
}
