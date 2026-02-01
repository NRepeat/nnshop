import { Provider } from '@/app/providers/authUIProvider';
import { Suspense } from 'react';

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className=" flex-col items-center justify-center flex w-full my-10 ">
        <Suspense>
          <Provider> {children}</Provider>
        </Suspense>
      </div>
    </>
  );
}
