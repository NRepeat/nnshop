import { getTranslations } from 'next-intl/server';
import { AuthViewRenderer } from '@/features/auth/ui/auth-view-renderer';

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
    <div className="flex  flex-col items-center  self-center h-fit min-h-screen w-full">
      <AuthViewRenderer authView={authView} tBetterAuth={tBetterAuth} />
    </div>
  );
};
export default async function AuthPage({
  params,
}: {
  params: Promise<{ authView: string; locale: string }>;
}) {
  return <AuthSession params={params} />;
}
