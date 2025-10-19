import { ForgotPasswordForm } from '@/components/forms/clientAuth/forgot-password-form';
import LoginForm from '@/components/forms/clientAuth/login-form';
import { SignupForm } from '@/components/forms/clientAuth/signup-form';
import { localization } from '@/lib/betterAuthLocaliztions/authView';
import { AuthView } from '@daveyplate/better-auth-ui';
import { authViewPaths } from '@daveyplate/better-auth-ui/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

  const renderAuthForm = () => {
    switch (authView) {
      case 'sign-in':
      case 'login':
        return <LoginForm />;
      case 'sign-up':
      case 'signup':
      case 'register':
        return <SignupForm />;
      case 'forgot-password':
        return <ForgotPasswordForm />;
      case 'reset-password':
      case 'magic-link':
      case 'verify-email':
      case 'account-link':
      case 'sign-out':
        return (
          <AuthView path={authView} localization={localization(tBetterAuth)} />
        );
      default:
        notFound();
    }
  };

  return (
    <main className="container flex grow flex-col items-center justify-center self-center  mt-2.5 py-6 md:py-10">
      {renderAuthForm()}
    </main>
  );
}
