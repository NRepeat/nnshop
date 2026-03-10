import { getTranslations } from 'next-intl/server';
import { AuthViewRenderer } from '@/features/auth/ui/auth-view-renderer';
import { QuickView } from '@widgets/product-view';
import { Suspense } from 'react';
import { AuthModalSkeleton } from './AuthModalSkeleton';


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
    <QuickView open={Boolean(params)} className='px-1.5'>
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
