import { ForgotPasswordForm } from '@/features/auth/ui/forgot-password-form';
import LoginForm from '@/features/auth/ui/login-form';
import { SignupForm } from '@/features/auth/ui/signup-form';
import { localization } from '@/shared/i18n/localization/authView';
import { AuthView } from '@daveyplate/better-auth-ui';
// import { AuthView } from '@daveyplate/better-auth-ui';
import { notFound } from 'next/navigation';

interface AuthViewRendererProps {
  authView: string;
  tBetterAuth: (key: string) => string;
}

export const AuthViewRenderer = ({
  authView,
  tBetterAuth,
}: AuthViewRendererProps) => {
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
    // case 'reset-password':
    // case 'magic-link':
    // case 'verify-email':
    // case 'account-link':
    // case 'sign-out':
    return (
      <AuthView path={authView} localization={localization(tBetterAuth)} />
    );
    default:
      notFound();
  }
};
