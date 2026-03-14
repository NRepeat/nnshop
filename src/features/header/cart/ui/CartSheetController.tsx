'use client';

import { Sheet } from '@shared/ui/sheet';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';
import { usePostHog } from 'posthog-js/react';

interface CartSheetControllerProps {
  locale: string;
  children: React.ReactNode;
}

export const CartSheetController = ({ children }: CartSheetControllerProps) => {
  const { isOpen, openCart, closeCart } = useCartUIStore();
  const posthog = usePostHog();
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openCart();
          posthog?.capture('cart_viewed');
        } else closeCart();
      }}
    >
      {children}
    </Sheet>
  );
};
