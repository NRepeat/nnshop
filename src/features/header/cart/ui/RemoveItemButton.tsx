'use client';

import { removeProductFromCart } from '@entities/cart/api/remove-product';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

export const RemoveItemButton = ({
  cartId,
  itemId,
}: {
  cartId: string;
  itemId: string;
}) => {
  const t = useTranslations('Header.cart.drawer');
  const [isPending, startTransition] = useTransition();
  const handleRemove = () => {
    startTransition(async () => {
      console.log('Removing item from cart...');
      const result = await removeProductFromCart(cartId, itemId);
      if (result.success) {
        toast.success('Item removed from cart');
      } else {
        toast.error('Failed to remove item');
      }
    });
  };
  return (
    <Button
      variant={'link'}
      onClick={() => handleRemove()}
      disabled={isPending}
      className="hover:underline  justify-start font-light p-0"
    >
      <p className="hover:underline cursor-pointer">{t('remove')}</p>
    </Button>
  );
};
