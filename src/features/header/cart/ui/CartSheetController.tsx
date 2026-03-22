'use client';

import { Sheet } from '@shared/ui/sheet';
import { useCartUIStore } from '@shared/store/use-cart-ui-store';

interface CartSheetControllerProps {
  locale: string;
  children: React.ReactNode;
}

export const CartSheetController = ({ children }: CartSheetControllerProps) => {
  const { isOpen, openCart, closeCart } = useCartUIStore();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openCart();
        } else closeCart();
      }}
    >
      {children}
    </Sheet>
  );
};
