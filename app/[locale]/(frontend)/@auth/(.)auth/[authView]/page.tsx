import { authViewPaths } from '@daveyplate/better-auth-ui/server';
import { getTranslations } from 'next-intl/server';
import { AuthViewRenderer } from '@/features/auth/ui/auth-view-renderer';
import { QuickView } from '@widgets/product-view';
import { locales } from '@shared/i18n/routing';
import { Suspense } from 'react';
export async function generateStaticParams() {
  const params = [];
  for (const locale of locales) {
    // for (const authView of Object.values(authViewPaths)) {
    params.push({ locale: locale });
    // }
  }
  return params;
}
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
    <main className=" flex grow flex-col items-center justify-center self-center  ">
      <AuthViewRenderer authView={authView} tBetterAuth={tBetterAuth} />
    </main>
  );
};
export default async function AuthPage({
  params,
}: {
  params: Promise<{ authView: string; locale: string }>;
}) {
  return (
    <Suspense>
      <QuickView open={Boolean(params)}>
        <AuthSession params={params} />
      </QuickView>
    </Suspense>
  );
}
