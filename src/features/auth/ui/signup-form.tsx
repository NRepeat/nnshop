'use client';
import { cn } from '@/shared/lib/utils';
import { SignUpFormData, signUpSchema } from './schema';
import {
  createGoogleSignInHandler,
  createShopifySignInHandler,
  createSignUpHandler,
} from './action';
import { zodResolver } from '@hookform/resolvers/zod';

import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
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
  FieldSeparator,
} from '@/shared/ui/field';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('Auth.signUp');
  const tCommon = useTranslations('Auth.common');
  const tErrors = useTranslations('Auth.errors');
  const tSuccess = useTranslations('Auth.success');

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = createSignUpHandler(tErrors, tSuccess);

  const handleGoogleSignIn = createGoogleSignInHandler(tErrors);

  const handleShopifySignIn = createShopifySignInHandler(tErrors);

  return (
    <div
      className={cn('flex flex-col gap-6 w-full max-w-3xl', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">
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
              className="space-y-8 p-4"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">{t('title')}</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    {t('description')}
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Field>
                        <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
                        <FormControl>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                        <FieldDescription>
                          {t('emailDescription')}
                        </FieldDescription>
                      </Field>
                    </FormItem>
                  )}
                />

                <Field className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel htmlFor="password">
                            {t('password')}
                          </FieldLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="password"
                              type="password"
                              placeholder={t('passwordPlaceholder')}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <Field>
                          <FieldLabel htmlFor="confirm-password">
                            {t('confirmPassword')}
                          </FieldLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="confirm-password"
                              type="password"
                              placeholder={t('confirmPasswordPlaceholder')}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </Field>
                      </FormItem>
                    )}
                  />
                </Field>
                <FieldDescription>{t('passwordDescription')}</FieldDescription>

                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? t('creatingAccount')
                      : t('createAccountButton')}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  {t('orContinueWith')}
                </FieldSeparator>

                <Field className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    type="button"
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12.26px"
                      height="16px"
                      viewBox="0 0 147.5 192.5"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <g transform="translate(-2.5 -302.1)">
                        <path
                          fill="#95BF47"
                          d="M131.5 341.9c-.1-.9-.9-1.3-1.5-1.3s-13.7-1-13.7-1-9.1-9.1-10.2-10c-1-1-2.9-.7-3.7-.5-.1 0-2 .6-5.1 1.6-3.1-8.9-8.4-17-17.9-17h-.9c-2.6-3.4-6-5-8.8-5-22 0-32.6 27.5-35.9 41.5-8.6 2.7-14.7 4.5-15.4 4.8-4.8 1.5-4.9 1.6-5.5 6.1-.5 3.4-13 100.1-13 100.1l97.3 18.2L150 468c.1-.2-18.4-125.2-18.5-126.1zm-39.6-9.8c-2.4.7-5.3 1.6-8.2 2.6v-1.8c0-5.4-.7-9.8-2-13.3 5 .6 8.1 6.1 10.2 12.5zm-16.3-11.4c1.3 3.4 2.2 8.2 2.2 14.8v1c-5.4 1.7-11.1 3.4-17 5.3 3.3-12.6 9.6-18.8 14.8-21.1zm-6.4-6.2c1 0 2 .4 2.8 1-7.1 3.3-14.6 11.6-17.7 28.4-4.7 1.5-9.2 2.8-13.5 4.2 3.6-12.8 12.6-33.6 28.4-33.6z"
                        />
                        <path
                          fill="#5E8E3E"
                          d="M130 340.4c-.6 0-13.7-1-13.7-1s-9.1-9.1-10.2-10c-.4-.4-.9-.6-1.3-.6l-7.3 150.6 52.8-11.4s-18.5-125.2-18.6-126.1c-.4-.9-1.1-1.3-1.7-1.5z"
                        />
                        <path
                          fill="#FFF"
                          d="M79.4 369.6L73 388.9s-5.8-3.1-12.7-3.1c-10.3 0-10.8 6.5-10.8 8.1 0 8.8 23 12.2 23 32.9 0 16.3-10.3 26.8-24.2 26.8-16.8 0-25.2-10.4-25.2-10.4l4.5-14.8s8.8 7.6 16.2 7.6c4.9 0 6.9-3.8 6.9-6.6 0-11.5-18.8-12-18.8-31 0-15.9 11.4-31.3 34.5-31.3 8.6-.1 13 2.5 13 2.5z"
                        />
                      </g>
                    </svg>
                    <span className="sr-only">{t('signUpWithShopify')}</span>
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">{t('signUpWithGoogle')}</span>
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  {t('alreadyHaveAccount')}{' '}
                  <Link href="/auth/sign-in" className="underline">
                    {t('signIn')}
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/auth_image.jpeg"
              alt="Image"
              width={800}
              height={500}
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        {tCommon('byClickingContinue')}{' '}
        <Link href="/terms-of-service" className="underline">
          {tCommon('termsOfService')}
        </Link>{' '}
        {tCommon('and')}{' '}
        <Link href="/privacy-policy" className="underline">
          {tCommon('privacyPolicy')}
        </Link>
        .
      </FieldDescription>
    </div>
  );
}
