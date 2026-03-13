'use client';

import { removeProductFromCart } from '@entities/cart/api/remove-product';
import { Button } from '@shared/ui/button';
import { useTranslations } from 'next-intl';
import { MouseEvent, useTransition } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

export const RemoveItemButton = ({
  cartId,
  itemId,
}: {
  cartId: string;
  itemId: string;
}) => {
  const t = useTranslations('Header.cart.drawer');
  const [isPending, startTransition] = useTransition();
  const posthog = usePostHog();
  const handleRemove = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>,
  ) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(async () => {
      const result = await removeProductFromCart(cartId, itemId);
      if (result.success) {
        toast.success(t('removeSuccess'));
        posthog?.capture('remove_from_cart', {
          item_id: itemId,
          $current_url: window.location.href,
        });
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
