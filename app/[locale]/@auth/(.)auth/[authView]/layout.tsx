import { Provider } from '@/app/providers/authUIProvider';
import { Suspense } from 'react';
import { locales } from '@shared/i18n/routing';
import { authViewPaths } from '@daveyplate/better-auth-ui';
// export function generateStaticParams() {
//   return locales.flatMap((locale) =>
//     Object.values(authViewPaths).map((path) => ({
//       locale,
//       path,
//     })),
//   );
// }
export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className=" flex-col items-center justify-center flex w-full">
        <Suspense>
          <Provider> {children}</Provider>
        </Suspense>
      </div>
    </>
  );
}
