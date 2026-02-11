'use client';

import { cn } from '@/shared/lib/utils';
import { createSignInSchema, SignInFormData } from './schema';
import {
  createSignInHandler,
  createGoogleSignInHandler,
  createShopifySignInHandler,
} from './action';
import { zodResolver } from '@hookform/resolvers/zod';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/shared/ui/form';
import {
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import { Link } from '@shared/i18n/navigation';

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Auth.signIn');
  const tCommon = useTranslations('Auth.common');
  const tErrors = useTranslations('Auth.errors');
  const tSuccess = useTranslations('Auth.success');

  const signInSchema = createSignInSchema(tErrors);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = createSignInHandler(tErrors, tSuccess);
  const handleGoogleSignIn = createGoogleSignInHandler(tErrors);
  const handleShopifySignIn = createShopifySignInHandler(tErrors);

  return (
    <div
      className={cn('flex flex-col gap-6 w-full max-w-3xl', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 shadow-none border-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                setIsLoading(true);
                try {
                  await handleSubmit(data);
                } finally {
                  setIsLoading(false);
                }
              })}
              className="pr-0 md:pr-8 pl-1"
            >
              <FieldGroup className="gap-6">
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  <h1 className="text-2xl font-bold">{t('title')}</h1>
                  <p className="text-muted-foreground text-sm">
                    {t('description')}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder={t('emailPlaceholder')}
                          disabled={isLoading}
                          className="rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password">
                          {t('password')}
                        </FieldLabel>
                        <Link
                          href="/auth/forgot-password"
                          scroll={false}
                          className="text-xs underline underline-offset-4 hover:text-primary transition-colors"
                        >
                          {t('forgotPassword')}
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          autoComplete="current-password"
                          placeholder={t('passwordPlaceholder')}
                          disabled={isLoading}
                          className="rounded-md"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md h-11"
                >
                  {isLoading ? t('signingIn') : t('signInButton')}
                </Button>

                <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground uppercase tracking-wider">
                    {t('orContinueWith')}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* <Button
                    variant="outline"
                    type="button"
                    className="rounded-md h-11"
                    disabled={isLoading}
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        await handleShopifySignIn();
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    <ShopifyIcon />
                    <span className="ml-2 text-xs font-medium uppercase tracking-tighter">Shopify</span>
                  </Button> */}
                  <Button
                    variant="outline"
                    type="button"
                    className="rounded-md h-11 group hover:border-[#4285F4] hover:bg-[#4285F4]/5 transition-all"
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
                    <span className="ml-2 text-xs font-medium uppercase tracking-tighter group-hover:text-[#4285F4] transition-colors">
                      Google
                    </span>
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-2">
                  {t('dontHaveAccount')}{' '}
                  <Link
                    href="/auth/sign-up"
                    scroll={false}
                    className="underline underline-offset-4 font-semibold hover:text-primary transition-colors"
                  >
                    {t('signUp')}
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </Form>

          <div className="bg-muted relative hidden md:block ">
            <Image
              src="/auth_image.jpeg"
              alt="Login cover"
              fill
              priority
              className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
            />
          </div>
        </CardContent>
      </Card>

      <p className="px-6 text-center text-[11px] text-muted-foreground leading-relaxed uppercase tracking-wide">
        {tCommon('byClickingContinue')}{' '}
        <Link
          href="/terms-of-service"
          scroll={false}
          className="underline underline-offset-2"
        >
          {tCommon('termsOfService')}
        </Link>{' '}
        {tCommon('and')}{' '}
        <Link
          href="/privacy-policy"
          scroll={false}
          className="underline underline-offset-2"
        >
          {tCommon('privacyPolicy')}
        </Link>
        .
      </p>
    </div>
  );
}

// Вынес иконки в отдельные мини-компоненты для чистоты кода
const ShopifyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 147.5 192.5"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      fill="#95BF47"
      d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5zm-16.3-11.4c1.3 3.4 2.2 8.2 2.2 14.8v1c-5.4 1.7-11.1 3.4-17 5.3 3.3-12.6 9.6-18.8 14.8-21.1zm-6.4-6.2c1 0 2 .4 2.8 1-7.1 3.3-14.6 11.6-17.7 28.4-4.7 1.5-9.2 2.8-13.5 4.2 3.6-12.8 12.6-33.6 28.4-33.6z"
      transform="translate(-2.5 -302.1)"
    />
    <path
      fill="#5E8E3E"
      d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"
      transform="translate(-2.5 -302.1)"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
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
