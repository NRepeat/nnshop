'use client';

import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export const CreateOrderButton = () => {
  const t = useTranslations('Header.cart.drawer');
  const nav = useRouter();
  const handleCreateOrder = () => {
    nav.push('/checkout/info');
  };

  return (
    <div className="w-full flex flex-col justify-between px-4 py-4 space-y-4">
      <span>{t('tax_information')}</span>
      <Button onClick={handleCreateOrder} className="w-full rounded-none">
        {t('checkout')}
      </Button>
    </div>
  );
};
