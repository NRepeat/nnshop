'use client';

import { cn } from '@/shared/lib/utils';
import { signInSchema, SignInFormData } from './schema';
import {
  createSignInHandler,
  createGoogleSignInHandler,
  createShopifySignInHandler,
} from './action';
import { zodResolver } from '@hookform/resolvers/zod';

import Image from 'next/image';
import Link from 'next/link';
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Auth.signIn');
  const tCommon = useTranslations('Auth.common');
  const tErrors = useTranslations('Auth.errors');
  const tSuccess = useTranslations('Auth.success');

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
      <Card className="overflow-hidden p-0 rounded-none shadow-none border-none">
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
              className="pr-6 md:pr-8 pl-1"
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
                          className="rounded-none"
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
                          className="rounded-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full rounded-none h-11"
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
                    className="rounded-none h-11"
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
                    className="rounded-none h-11"
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
                    <span className="ml-2 text-xs font-medium uppercase tracking-tighter">Google</span>
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-2">
                  {t('dontHaveAccount')}{' '}
                  <Link href="/auth/sign-up" className="underline underline-offset-4 font-semibold hover:text-primary transition-colors">
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
        <Link href="/terms-of-service" className="underline underline-offset-2">
          {tCommon('termsOfService')}
        </Link>{' '}
        {tCommon('and')}{' '}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          {tCommon('privacyPolicy')}
        </Link>.
      </p>
    </div>
  );
}

// Вынес иконки в отдельные мини-компоненты для чистоты кода
const ShopifyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 147.5 192.5" preserveAspectRatio="xMidYMid meet">
    <path fill="#95BF47" d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5zm-16.3-11.4c1.3 3.4 2.2 8.2 2.2 14.8v1c-5.4 1.7-11.1 3.4-17 5.3 3.3-12.6 9.6-18.8 14.8-21.1zm-6.4-6.2c1 0 2 .4 2.8 1-7.1 3.3-14.6 11.6-17.7 28.4-4.7 1.5-9.2 2.8-13.5 4.2 3.6-12.8 12.6-33.6 28.4-33.6z" transform="translate(-2.5 -302.1)"/>
    <path fill="#5E8E3E" d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z" transform="translate(-2.5 -302.1)"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor"/>
  </svg>
);