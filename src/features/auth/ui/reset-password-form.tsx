'use client';

import { cn } from '@/shared/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Link } from '@shared/i18n/navigation';
import { useEffect, useRef, useState } from 'react';
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
import { FieldGroup, FieldLabel } from '@/shared/ui/field';
import z from 'zod';
import { toast } from 'sonner';
import { authClient } from '../lib/auth-client';

type ResetPasswordFormData = {
  newPassword: string;
  confirmPassword: string;
};

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [isLoading, setIsLoading] = useState(false);
  const tokenChecked = useRef(false);
  const t = useTranslations('Auth.resetPassword');
  const tErrors = useTranslations('Auth.errors');

  const resetPasswordSchema = z
    .object({
      newPassword: z.string().min(8, {
        message: tErrors('passwordTooShort'),
      }),
      confirmPassword: z.string().min(8, {
        message: tErrors('passwordTooShort'),
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: tErrors('passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (tokenChecked.current) return;
    tokenChecked.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (!token) {
      toast.error(t('invalidToken'));
      window.location.href = '/auth/sign-in';
    }
  }, [t]);

  const handleSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token') as string;

      const result = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (result.error) {
        toast.error(tErrors('unexpectedError'));
        return;
      }

      toast.success(t('success'));
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(tErrors('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn('flex flex-col gap-6 w-full max-w-3xl', className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 shadow-none border-none">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
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
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="newPassword">
                        {t('newPassword')}
                      </FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder={t('newPasswordPlaceholder')}
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel htmlFor="confirmPassword">
                        {t('confirmPassword')}
                      </FieldLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder={t('confirmPasswordPlaceholder')}
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
                  {isLoading ? t('saving') : t('saveButton')}
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-2">
                  <Link
                    href="/auth/sign-in"
                    scroll={false}
                    className="underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    {t('backToSignIn')}
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </Form>

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/auth_image.jpeg"
              alt="Reset password cover"
              fill
              sizes="50vw"
              priority
              className="absolute inset-0 h-full w-full object-cover grayscale contrast-125"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
