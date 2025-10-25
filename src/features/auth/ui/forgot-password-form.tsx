'use client';
import { cn } from '@/lib/utils';

import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import { client } from '@/features/auth/lib/client';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
} from '@/shared/ui/field';
import {
  FormItem,
  FormControl,
  FormMessage,
  FormField,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';

const forgotPasswordSchema = z.object({
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const t = useTranslations('Auth.forgotPassword');
  const tCommon = useTranslations('Auth.common');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const result = await client.forgetPassword({
        email: data.email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        toast.error(result.error.message || 'Failed to send reset email');
        return;
      }

      setIsSubmitted(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className={cn('flex flex-col gap-6 w-full max-w-3xl', className)}
        {...props}
      >
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold">{t('checkEmail')}</h1>
                <p className="text-muted-foreground text-balance">
                  {t('emailSent')} <strong>{form.getValues('email')}</strong>
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {t('didntReceive')}{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal"
                    onClick={() => {
                      setIsSubmitted(false);
                      form.reset();
                    }}
                  >
                    {t('tryAgain')}
                  </Button>
                </p>
                <div className="text-center">
                  <Link
                    href="/auth/sign-in"
                    className="text-sm underline underline-offset-2 hover:no-underline"
                  >
                    {t('backToSignIn')}
                  </Link>
                </div>
              </div>
            </div>
            <div className="bg-muted relative hidden md:block">
              <Image
                src="/placeholder.svg"
                alt="Image"
                width={800}
                height={500}
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col gap-6 w-full max-w-3xl', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 p-4"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">{t('title')}</h1>
                  <p className="text-muted-foreground text-balance">
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
                      </Field>
                    </FormItem>
                  )}
                />

                <Field>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? t('sending') : t('sendResetLink')}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  {t('rememberPassword')}{' '}
                  <Link href="/auth/sign-in" className="underline">
                    {t('signIn')}
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </Form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.svg"
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
