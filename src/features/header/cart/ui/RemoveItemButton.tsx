'use client';

import { removeProductFromCart } from '@entities/cart/api/remove-product';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { MouseEvent, useTransition } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export const RemoveItemButton = ({
  cartId,
  itemId,
}: {
  cartId: string;
  itemId: string;
}) => {
  const t = useTranslations('Header.cart.drawer');
  const [isPending, startTransition] = useTransition();
  const handleRemove = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      console.log('Removing item from cart...');
      const result = await removeProductFromCart(cartId, itemId);
      if (result.success) {
        toast.success(t('removeSuccess'));
      } else {
        toast.error(t('removeError'));
      }
    });
  };
  return (
    <Button
      variant={'ghost'}
      size={'icon'}
      onClick={(e) => handleRemove(e)}
      disabled={isPending}
      className="text-muted-foreground hover:text-foreground size-5 p-0"
    >
      <X className="size-3" />
    </Button>
  );
};
