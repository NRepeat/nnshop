'use client';

import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { redirect } from 'next/navigation';
import { useTransition } from 'react';

export const CreateOrderButton = () => {
  const t = useTranslations('Header.cart.drawer');
  const [isPending, startTransition] = useTransition();
  const handleCreateOrder = () => {
    startTransition(async () => {
      redirect('/checkout/info');
      // const { success, order, errors } = await createDraftOrder(cartId);
    });
  };

  return (
    <div className="w-full flex flex-col justify-between px-4 py-4 space-y-4">
      <span>{t('tax_information')}</span>
      <Button
        onClick={handleCreateOrder}
        disabled={isPending}
        className="w-full rounded-none"
      >
        {t('checkout')}
      </Button>
    </div>
  );
};
