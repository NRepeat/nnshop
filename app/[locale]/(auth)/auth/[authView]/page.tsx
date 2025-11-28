import { authViewPaths } from '@daveyplate/better-auth-ui/server';
import { getTranslations } from 'next-intl/server';
import { AuthViewRenderer } from '@/features/auth/ui/auth-view-renderer';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ authView: path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ authView: string }>;
}) {
  const { authView } = await params;
  const tBetterAuth = await getTranslations('BetterAuthUI');

  return (
    <main className="container flex grow flex-col items-center justify-center self-center  mt-2.5 py-6 md:py-10 mb-10 h-screen">
      <AuthViewRenderer authView={authView} tBetterAuth={tBetterAuth} />
    </main>
  );
}
