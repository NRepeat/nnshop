import { ForgotPasswordForm } from '@/components/forms/clientAuth/forgot-password-form';
import LoginForm from '@/components/forms/clientAuth/login-form';
import { SignupForm } from '@/components/forms/clientAuth/signup-form';
import { AuthView } from '@daveyplate/better-auth-ui';
import { authViewPaths } from '@daveyplate/better-auth-ui/server';

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
      default:
        return <AuthView path={authView} />;
    }
  };

  return (
    <main className="container flex grow flex-col items-center justify-center self-center  mt-2.5 py-6 md:py-10">
      {renderAuthForm()}
    </main>
  );
}
