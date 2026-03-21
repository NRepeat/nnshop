'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/form';
import { FieldGroup, FieldLabel } from '@shared/ui/field';
import { Link } from '@shared/i18n/navigation';
import {
  createSignInSchema,
  createSignUpSchema,
  SignInFormData,
  SignUpFormData,
} from '@features/auth/ui/schema';
import {
  createSignInHandler,
  createSignUpHandler,
  createGoogleSignInHandler,
} from '@features/auth/ui/action';
import { client } from '@features/auth/lib/client';
import { toast } from 'sonner';

type Mode = 'signIn' | 'signUp';

export function CheckoutAuthGate() {
  const [mode, setMode] = useState<Mode>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const locale = useLocale();
  const t = useTranslations('CheckoutPage.authGate');
  const tErrors = useTranslations('Auth.errors');
  const tSuccess = useTranslations('Auth.success');
  const tSignIn = useTranslations('Auth.signIn');
  const tSignUp = useTranslations('Auth.signUp');
  const tCommon = useTranslations('Auth.common');

  const callbackUrl = `/${locale}/checkout/info`;

  const signInSchema = createSignInSchema(tErrors);
  const signUpSchema = createSignUpSchema(tErrors);

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const handleSignIn = createSignInHandler(tErrors, tSuccess, callbackUrl);
  const handleSignUp = createSignUpHandler(tErrors, tSuccess, callbackUrl);
  const handleGoogleSignIn = createGoogleSignInHandler(tErrors, callbackUrl);


  return (
    <div className="rounded border border-dashed border-gray-200 bg-gray-50/50 p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{t('title')}</p>
          <p className="text-muted-foreground text-xs mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      {/* Quick actions always visible */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="rounded group hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-all"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true);
            try {
              await handleGoogleSignIn();
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <GoogleIcon />
          <span className="ml-1.5 text-xs font-medium group-hover:text-[#4285F4] transition-colors">
            Google
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="rounded text-xs text-muted-foreground"
          disabled={isLoading}
       onClick={() => setExpanded((v) => !v)}
        >
           {expanded ? t('hide') : t('signIn')}
        </Button>
      </div>

      {/* Expandable email/password forms */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-gray-200">
          {/* Mode toggle */}
          <div className="flex rounded border overflow-hidden w-fit text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode('signIn')}
              className={`px-4 py-1.5 transition-colors ${
                mode === 'signIn'
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => setMode('signUp')}
              className={`px-4 py-1.5 transition-colors ${
                mode === 'signUp'
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('signUp')}
            </button>
          </div>

          {/* Sign In */}
          {mode === 'signIn' && (
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(async (data) => {
                  setIsLoading(true);
                  try {
                    await handleSignIn(data);
                  } finally {
                    setIsLoading(false);
                  }
                })}
              >
                <FieldGroup className="gap-3">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel className="text-xs">{tSignIn('email')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="username"
                            placeholder={tSignIn('emailPlaceholder')}
                            disabled={isLoading}
                            className="rounded h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FieldLabel className="text-xs">{tSignIn('password')}</FieldLabel>
                          <Link
                            href="/auth/forgot-password"
                            scroll={false}
                            className="text-[11px] underline underline-offset-4 hover:text-primary transition-colors"
                          >
                            {tSignIn('forgotPassword')}
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            placeholder={tSignIn('passwordPlaceholder')}
                            disabled={isLoading}
                            className="rounded h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded h-9 text-sm"
                  >
                    {isLoading ? tSignIn('signingIn') : tSignIn('signInButton')}
                  </Button>
                </FieldGroup>
              </form>
            </Form>
          )}

          {/* Sign Up */}
          {mode === 'signUp' && (
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(async (data) => {
                  setIsLoading(true);
                  try {
                    await handleSignUp(data);
                  } finally {
                    setIsLoading(false);
                  }
                })}
              >
                <FieldGroup className="gap-3">
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel className="text-xs">{tSignUp('email')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            placeholder={tSignUp('emailPlaceholder')}
                            disabled={isLoading}
                            className="rounded h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel className="text-xs">{tSignUp('password')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            placeholder={tSignUp('passwordPlaceholder')}
                            disabled={isLoading}
                            className="rounded h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel className="text-xs">{tSignUp('confirmPassword')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            placeholder={tSignUp('confirmPasswordPlaceholder')}
                            disabled={isLoading}
                            className="rounded h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded h-9 text-sm"
                  >
                    {isLoading
                      ? tSignUp('creatingAccount')
                      : tSignUp('createAccountButton')}
                  </Button>
                </FieldGroup>
              </form>
            </Form>
          )}

          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-wide">
            {tCommon('byClickingContinue')}{' '}
            <Link
              href="/info/public-offer-agreement"
              scroll={false}
              className="underline underline-offset-2"
            >
              {tCommon('termsOfService')}
            </Link>{' '}
            {tCommon('and')}{' '}
            <Link
              href="/info/privacy-policy"
              scroll={false}
              className="underline underline-offset-2"
            >
              {tCommon('privacyPolicy')}
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);
