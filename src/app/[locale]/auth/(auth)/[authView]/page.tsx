import { ForgotPasswordForm } from '@/components/forms/clientAuth/forgot-password-form';
import LoginForm from '@/components/forms/clientAuth/login-form';
import { SignupForm } from '@/components/forms/clientAuth/signup-form';
import { AuthView } from '@daveyplate/better-auth-ui';
import { authViewPaths } from '@daveyplate/better-auth-ui/server';
import { getTranslations } from 'next-intl/server';

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
      default:
        return (
          <AuthView
            path={authView}
            localization={{
              // Sign in
              SIGN_IN: tBetterAuth('SIGN_IN'),
              SIGN_IN_ACTION: tBetterAuth('SIGN_IN_ACTION'),
              SIGN_IN_DESCRIPTION: tBetterAuth('SIGN_IN_DESCRIPTION'),
              SIGN_IN_WITH: tBetterAuth('SIGN_IN_WITH'),

              // Sign up
              SIGN_UP: tBetterAuth('SIGN_UP'),
              SIGN_UP_ACTION: tBetterAuth('SIGN_UP_ACTION'),
              SIGN_UP_DESCRIPTION: tBetterAuth('SIGN_UP_DESCRIPTION'),

              // Common form fields
              EMAIL: tBetterAuth('EMAIL'),
              EMAIL_PLACEHOLDER: tBetterAuth('EMAIL_PLACEHOLDER'),
              EMAIL_REQUIRED: tBetterAuth('EMAIL_REQUIRED'),
              EMAIL_DESCRIPTION: tBetterAuth('EMAIL_DESCRIPTION'),
              EMAIL_INSTRUCTIONS: tBetterAuth('EMAIL_INSTRUCTIONS'),
              PASSWORD: tBetterAuth('PASSWORD'),
              PASSWORD_PLACEHOLDER: tBetterAuth('PASSWORD_PLACEHOLDER'),
              PASSWORD_REQUIRED: tBetterAuth('PASSWORD_REQUIRED'),
              CURRENT_PASSWORD_PLACEHOLDER: tBetterAuth(
                'CURRENT_PASSWORD_PLACEHOLDER',
              ),
              NEW_PASSWORD_PLACEHOLDER: tBetterAuth('NEW_PASSWORD_PLACEHOLDER'),
              CONFIRM_PASSWORD: tBetterAuth('CONFIRM_PASSWORD'),
              CONFIRM_PASSWORD_REQUIRED: tBetterAuth(
                'CONFIRM_PASSWORD_REQUIRED',
              ),
              NAME: tBetterAuth('NAME'),
              NAME_PLACEHOLDER: tBetterAuth('NAME_PLACEHOLDER'),
              NAME_DESCRIPTION: tBetterAuth('NAME_DESCRIPTION'),
              NAME_INSTRUCTIONS: tBetterAuth('NAME_INSTRUCTIONS'),

              // Reset password
              FORGOT_PASSWORD: tBetterAuth('FORGOT_PASSWORD'),
              FORGOT_PASSWORD_ACTION: tBetterAuth('FORGOT_PASSWORD_ACTION'),
              FORGOT_PASSWORD_DESCRIPTION: tBetterAuth(
                'FORGOT_PASSWORD_DESCRIPTION',
              ),
              FORGOT_PASSWORD_EMAIL: tBetterAuth('FORGOT_PASSWORD_EMAIL'),
              FORGOT_PASSWORD_LINK: tBetterAuth('FORGOT_PASSWORD_LINK'),
              RESET_PASSWORD: tBetterAuth('RESET_PASSWORD'),
              CHANGE_PASSWORD_DESCRIPTION: tBetterAuth(
                'CHANGE_PASSWORD_DESCRIPTION',
              ),
              CHANGE_PASSWORD_INSTRUCTIONS: tBetterAuth(
                'CHANGE_PASSWORD_INSTRUCTIONS',
              ),
              CHANGE_PASSWORD_SUCCESS: tBetterAuth('CHANGE_PASSWORD_SUCCESS'),

              // Magic link
              MAGIC_LINK: tBetterAuth('MAGIC_LINK'),
              MAGIC_LINK_ACTION: tBetterAuth('MAGIC_LINK_ACTION'),
              MAGIC_LINK_DESCRIPTION: tBetterAuth('MAGIC_LINK_DESCRIPTION'),
              MAGIC_LINK_EMAIL: tBetterAuth('MAGIC_LINK_EMAIL'),

              // Email verification
              VERIFY_YOUR_EMAIL: tBetterAuth('VERIFY_YOUR_EMAIL'),
              VERIFY_YOUR_EMAIL_DESCRIPTION: tBetterAuth(
                'VERIFY_YOUR_EMAIL_DESCRIPTION',
              ),

              // Common actions
              CONTINUE: tBetterAuth('CONTINUE'),
              CANCEL: tBetterAuth('CANCEL'),
              SAVE: tBetterAuth('SAVE'),
              DELETE: tBetterAuth('DELETE'),
              DONE: tBetterAuth('DONE'),
              OR_CONTINUE_WITH: tBetterAuth('OR_CONTINUE_WITH'),
              REMEMBER_ME: tBetterAuth('REMEMBER_ME'),

              // Links and account messages
              DONT_HAVE_AN_ACCOUNT: tBetterAuth('DONT_HAVE_AN_ACCOUNT'),
              ALREADY_HAVE_AN_ACCOUNT: tBetterAuth('ALREADY_HAVE_AN_ACCOUNT'),
              SIGN_OUT: tBetterAuth('SIGN_OUT'),

              // Error handling
              PASSWORDS_DO_NOT_MATCH: tBetterAuth('PASSWORDS_DO_NOT_MATCH'),
            }}
          />
        );
    }
  };

  return (
    <main className="container flex grow flex-col items-center justify-center self-center  mt-2.5 py-6 md:py-10">
      {renderAuthForm()}
    </main>
  );
}
