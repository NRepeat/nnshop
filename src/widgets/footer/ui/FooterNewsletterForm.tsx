'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { subscribeToNewsletter } from '@features/newsletter/api/subscribe';
import { usePostHog } from 'posthog-js/react';

export const FooterNewsletterForm = () => {
  const t = useTranslations('Footer');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const posthog = usePostHog();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    await subscribeToNewsletter({ email, gender: 'woman' });
    posthog?.capture('newsletter_subscribed', { email });
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-sm text-white/80">{t('subscribe_success')}</p>;
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('subscribe_placeholder')}
        aria-label={t('subscribe_placeholder')}
        required
        className="flex-1 rounded-r-none bg-transparent border border-white/30 text-sm text-white placeholder-white/40 px-3 py-2 focus:outline-none focus:border-white/60 min-w-0"
      />
      <button
        type="submit"
        className="bg-white rounded rounded-l-none text-black text-sm font-medium px-4 py-2 hover:bg-white/90 transition-colors whitespace-nowrap"
      >
        {t('subscribe_button')}
      </button>
    </form>
  );
};
