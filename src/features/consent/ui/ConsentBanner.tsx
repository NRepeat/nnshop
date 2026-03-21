'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@shared/ui/button';

const CONSENT_KEY = 'cookie_consent';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGtagConsent(granted: boolean) {
  if (typeof window === 'undefined' || !window.gtag) return;
  const state = granted ? 'granted' : 'denied';
  window.gtag('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function ConsentBanner() {
  const t = useTranslations('ConsentBanner');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    } else {
      updateGtagConsent(stored === 'granted');
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    updateGtagConsent(true);
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    updateGtagConsent(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-background border border-muted rounded shadow-lg px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground max-w-2xl">{t('text')}</p>
      <div className="flex gap-2 shrink-0">
        <Button variant="outline" size="sm" onClick={decline}>
          {t('decline')}
        </Button>
        <Button size="sm" onClick={accept}>
          {t('accept')}
        </Button>
      </div>
    </div>
  );
}
