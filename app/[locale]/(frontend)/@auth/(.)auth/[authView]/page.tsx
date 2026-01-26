import { getTranslations } from 'next-intl/server';
import { AuthViewRenderer } from '@/features/auth/ui/auth-view-renderer';
import { QuickView } from '@widgets/product-view';
import { Suspense } from 'react';
import { AuthModalSkeleton } from './AuthModalSkeleton';

// export async function generateStaticParams() {
//   const params = [];
//   for (const locale of locales) {
//     // for (const authView of Object.values(authViewPaths)) {
//     params.push({ locale: locale });
//     // }
//   }
//   return params;
// }

// export function generateStaticParams() {
//   return Object.values(authViewPaths).map((path) => ({ authView: path }));
// }
const AuthSession = async ({
  params,
}: {
  params: Promise<{ authView: string; locale: string }>;
}) => {
  const { authView, locale } = await params;
  const tBetterAuth = await getTranslations({
    locale,
    namespace: 'BetterAuthUI',
  });
  return (
    <QuickView open={Boolean(params)}>
      <main className=" flex grow flex-col items-center justify-center self-center  ">
        <AuthViewRenderer authView={authView} tBetterAuth={tBetterAuth} />
      </main>
    </QuickView>
  );
};
export default async function AuthPage({
  params,
}: {
  params: Promise<{ authView: string; locale: string }>;
}) {
  return (
    <Suspense fallback={<AuthModalSkeleton />}>
      <AuthSession params={params} />
    </Suspense>
  );
}
