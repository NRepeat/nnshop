'use client';

import { Button } from '@shared/ui/button';
import { Link } from '@shared/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';

export const EmptyCartState = () => {
  const t = useTranslations('CartPage');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
      <h2 className="text-xl font-medium mb-2">{t('empty')}</h2>
      <Button asChild className="mt-4">
        <Link href="/">{t('continue_shopping')}</Link>
      </Button>
    </div>
  );
};
