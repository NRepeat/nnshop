import { Provider } from '@/app/providers/authUIProvider';
import { ReactNode, Suspense } from 'react';
import AuthLoading from '~/app/[locale]/(frontend)/(auth)/auth/[authView]/loading';

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <div className=" flex-col items-center justify-center flex w-full my-10 ">
        <Suspense fallback={<AuthLoading />}>
          <Provider> {children}</Provider>
        </Suspense>
      </div>
    </>
  );
}
