'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subscribeToNewsletter } from '@features/newsletter/api/subscribe';
import {
  newsletterSchema,
  NewsletterFormData,
} from '@features/newsletter/schema/newsletterSchema';
import { useState } from 'react';
import { DEFAULT_GENDER } from '@shared/config/shop';

type NewsletterFieldValues = z.input<typeof newsletterSchema>;

export const FooterNewsletterForm = () => {
  const t = useTranslations('Footer');
  const tN = useTranslations('Newsletter');
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<NewsletterFieldValues, unknown, NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: '', gender: DEFAULT_GENDER },
  });

  async function onSubmit(data: NewsletterFormData) {
    await subscribeToNewsletter(data);
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-sm text-white/80">{t('subscribe_success')}</p>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* Gender */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
          <input
            type="radio"
            value="woman"
            {...form.register('gender')}
            className="w-4 h-4 accent-white"
          />
          {tN('forHer')}
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
          <input
            type="radio"
            value="man"
            {...form.register('gender')}
            className="w-4 h-4 accent-white"
          />
          {tN('forHim')}
        </label>
      </div>

      {/* Email + submit */}
      <div className="flex">
        <input
          type="email"
          placeholder={t('subscribe_placeholder')}
          aria-label={t('subscribe_placeholder')}
          {...form.register('email')}
          className="flex-1 rounded-r-none bg-transparent border border-white/30 text-sm text-white placeholder-white/40 px-3 py-2 focus:outline-none focus:border-white/60 min-w-0"
        />
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="bg-white rounded rounded-l-none text-black text-sm font-medium px-4 py-2 hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {t('subscribe_button')}
        </button>
      </div>

      {form.formState.errors.email && (
        <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
      )}
    </form>
  );
};
