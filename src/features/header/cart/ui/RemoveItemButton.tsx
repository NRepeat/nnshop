'use client';

import { removeProductFromCart } from '@entities/cart/api/remove-product';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { MouseEvent, useTransition } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const RemoveItemButton = ({
  cartId,
  itemId,
  itemName,
  price,
}: {
  cartId: string;
  itemId: string;
  itemName?: string;
  price?: number;
}) => {
  const t = useTranslations('Header.cart.drawer');
  const [isPending, startTransition] = useTransition();
  const handleRemove = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await removeProductFromCart(cartId, itemId);
      if (result.success) {
        toast.success(t('removeSuccess'));
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'remove_from_cart', {
            items: [{ item_id: itemId, item_name: itemName, price }],
          });
        }
      } else {
        toast.error(t('removeError'));
      }
    });
  };
  return (
    <Button
      variant={'ghost'}
      size={'icon'}
      aria-label={t('remove')}
      onClick={(e) => handleRemove(e)}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground size-5 p-0"
    >
      <X className="size-3" />
    </Button>
  );
};
