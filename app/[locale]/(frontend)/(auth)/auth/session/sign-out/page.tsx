'use client';

import { authClient } from '@features/auth/lib/auth-client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    const signOut = () => {
      authClient.signOut();
      setTimeout(() => {}, 1000);
      window.location.href = '/';
    };

    signOut();
  }, [router]);

  return (
    <div className="flex  w-full flex-col items-center justify-center gap-4 h-screen">
      <p>Signing out...</p>
      <Loader2 className="h-12 w-12" />
    </div>
  );
}
