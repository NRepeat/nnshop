'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@shared/ui/form';
import { Input } from '@shared/ui/input';
import { Button } from '@shared/ui/button';
import { subscribeToNewsletter } from '../api/subscribe';
import {
  newsletterSchema,
  NewsletterFormData,
} from '../schema/newsletterSchema';
import { z } from 'zod';

type NewsletterFieldValues = z.input<typeof newsletterSchema>;

export const NewsletterForm = () => {
  const t = useTranslations('Newsletter');
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<NewsletterFieldValues, unknown, NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '', gender: 'woman' },
  });

  if (submitted) {
    return <p className="text-center text-lg py-4">{t('success')}</p>;
  }

  async function onSubmit(data: NewsletterFormData) {
    await subscribeToNewsletter(data);
    // Always treat as success — duplicate email is silent per CONTEXT.md
    setSubmitted(true);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* Gender radio */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="woman"
                      checked={field.value === 'woman'}
                      onChange={() => field.onChange('woman')}
                      className="w-4 h-4 accent-primary bg-primary"
                    />
                    <span className="text-sm">{t('forHer')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="man"
                      checked={field.value === 'man'}
                      onChange={() => field.onChange('man')}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm">{t('forHim')}</span>
                  </label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Email + submit row */}
        <div className="flex gap-3 items-start">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    className="border-0 border-b border-foreground rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-foreground px-0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            // variant={'default'}
            disabled={form.formState.isSubmitting}
            className=" shrink-0 rounded"
          >
            {t('submit')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
