'use client';
import { authClient } from '@features/auth/lib/auth-client';
import { Suspense, useEffect } from 'react';

const SignOut = () => {
  //   const nav = useRouter();

  useEffect(() => {
    authClient.signOut();
    //   nav.push('/', { scroll: false });
    //   nav.refresh();
    //   redirect('/', RedirectType.replace);
    if (window) {
      window.location.href = '/';
    }
  }, []);
  return <></>;
};

const SignOutSession = () => {
  return (
    <Suspense>
      <SignOut />
    </Suspense>
  );
};
export default SignOutSession;
